using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Data;
using InteractHub.API.Entities;
using Microsoft.EntityFrameworkCore;

using InteractHub.API.DTOs.Posts;
using LikeAdminDTO = InteractHub.API.DTOs.Like.LikeAdminDTO;
using CommentAdminDTO = InteractHub.API.DTOs.Comments.CommentAdminDTO;
namespace InteractHub.API.Repositories.Implementations;



public class PostRepository : IPostRepository
{
    // Đổi ApplicationDbContext thành AppDbContext cho khớp với Program.cs
    private readonly AppDbContext _context;

    public PostRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Post post)
    {
        await _context.Posts.AddAsync(post);
    }

    public void Update(Post post)
    {
        _context.Posts.Update(post);
    }

    public void Delete(Post post)
    {
        _context.Posts.Remove(post);
    }

    public async Task<bool> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<Post?> GetByIdAsync(int id)
    {
        return await _context.Posts.FindAsync(id);
    }

    public async Task<IEnumerable<Post>> GetPostsWithDetailsAsync()
    {
        return await _context.Posts
            .Include(p => p.User)
            .Include(p => p.PostMedias) // Đảm bảo trong Entity Post có property này
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Post>> GetPostsByUserIdAsync(string userId)
    {
        return await _context.Posts
            .Where(p => p.UserId == userId)
            .Include(p => p.User)
            .Include(p => p.PostMedias)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Post?> GetPostDetailsByIdAsync(int id)
    {
        return await _context.Posts
            .Include(p => p.User)
            .Include(p => p.PostMedias)
            // Nếu Entity chưa có Likes/Comments thì tạm thời comment lại để không lỗi build
            // .Include(p => p.Likes)
            // .Include(p => p.Comments)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    // ------------Admin-------------
    public async Task<IEnumerable<PostAdminDTO>> GetAllPostsForAdminAsync()
    {
        // ── 1. Lấy raw data từ DB ──────────────────────────────────────────────
        // Dùng ToListAsync() + map trong memory để tránh lỗi EF không translate
        // được các hàm C# phức tạp (FirstOrDefault lồng trong Select).
        var posts = await _context.Posts
            .OrderByDescending(p => p.CreatedAt)
            .Include(p => p.User)
            .Include(p => p.PostMedias)
            .Include(p => p.Likes)
                .ThenInclude(l => l.User)
            .Include(p => p.Comments)
                .ThenInclude(c => c.User)
            .AsSplitQuery()   // tránh cartesian explosion khi nhiều collection Include
            .ToListAsync();

        // ── 2. Map sang DTO ────────────────────────────────────────────────────
        return posts.Select(p =>
        {
            // Bước 2a: Flat map tất cả comments → DTO (chưa có Replies)
            var allCommentDtos = p.Comments
                .Select(c => new CommentAdminDTO
                {
                    Id = c.Id,
                    Content = c.Content ?? "",
                    UserId = c.UserId ?? "",
                    UserName = c.User?.UserName ?? "",
                    UserAvatar = c.User?.ProfilePicture,
                    PostId = c.PostId,
                    ParentId = c.ParentId,

                    // Tra tên người được reply dựa vào ParentId
                    ParentUserName = c.ParentId.HasValue
                        ? p.Comments
                            .FirstOrDefault(parent => parent.Id == c.ParentId.Value)
                            ?.User?.UserName
                        : null,

                    Status = c.Status,
                    CreatedAt = c.CreatedAt,
                    LikeCount = 0,               // mở rộng sau nếu có bảng CommentLike
                    IsLikedByCurrentUser = false, // mở rộng khi truyền currentUserId
                    Replies = new List<CommentAdminDTO>()
                })
                .ToList();

            // Bước 2b: Build tree — gắn reply vào đúng parent
            var commentMap = allCommentDtos.ToDictionary(c => c.Id);
            var rootComments = new List<CommentAdminDTO>();

            foreach (var dto in allCommentDtos)
            {
                if (dto.ParentId.HasValue
                    && commentMap.TryGetValue(dto.ParentId.Value, out var parentDto))
                {
                    parentDto.Replies.Add(dto);
                }
                else
                {
                    rootComments.Add(dto);
                }
            }

            // Bước 2c: Map Post → DTO, Comments chỉ chứa root (replies đã lồng vào trong)
            return new PostAdminDTO
            {
                Id = p.Id,
                Title = p.Title,
                Content = p.Content,
                UserId = p.UserId,
                Status = p.Status,
                AuthorName = p.User?.UserName ?? "User",
                AuthorAvatar = p.User?.ProfilePicture ?? "",
                CreatedAt = p.CreatedAt,

                MediaUrls = p.PostMedias?
                    .Select(m => m.Url)
                    .ToList() ?? new List<string>(),

                LikeCount = p.Likes.Count(l => l.Status == 1),

                UserLike = p.Likes
                    .Where(l => l.Status == 1)
                    .Select(l => new LikeAdminDTO
                    {
                        UserId = l.UserId,
                        UserName = l.User?.UserName ?? "",
                        Avatar = l.User?.ProfilePicture ?? "",
                        Type = l.Type.ToString()
                    }).ToList(),

                CommentCount = p.Comments.Count,

                // ✅ Chỉ trả về root comments — replies đã lồng vào Replies bên trong
                Comments = rootComments
            };
        });
    }
    public async Task<bool> UpdateStatusPostForAdminAsync(int postId, int status)
    {
        var rows = await _context.Posts
            .Where(p => p.Id == postId)
            .ExecuteUpdateAsync(s =>
                s.SetProperty(p => p.Status, status)
            );

        return rows > 0;
    }

    public async Task<PostDashboardDTO> GetPostsCountAsync()
    {
        // Tổng bài viết
        var totalPosts = await _context.Posts.CountAsync();

        // Group theo tháng
        var activity = await _context.Posts
            .Where(p => p.CreatedAt.HasValue) // ✅ lọc null
            .Include(p => p.Comments)
            .Include(p => p.Likes)
            .GroupBy(p => new
            {
                p.CreatedAt.Value.Year,
                p.CreatedAt.Value.Month
            })
            .Select(g => new PostActivityStatDTO
            {
                Month = g.Key.Month.ToString(),
                Posts = g.Count(),
                Comments = g.SelectMany(p => p.Comments).Count(),
                Likes = g.SelectMany(p => p.Likes).Count(l => l.Status == 1)
            })
            .OrderBy(x => x.Month)
            .ToListAsync();
        return new PostDashboardDTO
        {
            TotalPosts = totalPosts,
            Activity = activity
        };
    }
    public async Task<(IEnumerable<Post> Posts, int TotalCount)> GetHomeFeedPagedAsync(
    string currentUserId,
    IEnumerable<string> friendIds,
    int page,
    int pageSize)
    {
        var friendIdSet = friendIds.ToHashSet();

        var query = _context.Posts
            .Include(p => p.User)
            .Include(p => p.PostMedias)
            .Where(p =>
                (p.Status == 1) ||
                (p.Status == 2 && friendIdSet.Contains(p.UserId!))
            )
            .OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync();

        var posts = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (posts, totalCount);
    }
    // ✅ Tìm kiếm bài viết theo keyword trong Title hoặc Content
    // Chỉ trả về bài viết công khai (Status = 1)
    public async Task<IEnumerable<Post>> SearchPostsAsync(string keyword)
    {
        var lower = keyword.ToLower();
        return await _context.Posts
        .Where(p => p.Status == 1 &&
           (
               (p.Content != null && EF.Functions.Like(p.Content, $"%{keyword}%"))
               || (p.Title != null && EF.Functions.Like(p.Title, $"%{keyword}%"))
           ))
            .Include(p => p.User)
            .Include(p => p.PostMedias)
            // .Include(p => p.Likes)
            // .Include(p => p.Comments)
            .OrderByDescending(p => p.CreatedAt)
            .Take(50) // giới hạn 50 kết quả
            .ToListAsync();
    }
}