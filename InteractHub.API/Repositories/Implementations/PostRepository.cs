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
    private readonly AppDbContext _context;

    public PostRepository(AppDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // BASIC CRUD
    // =====================================================

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

    // =====================================================
    // GET BY ID
    // =====================================================

    public async Task<Post?> GetByIdAsync(int id)
    {
        return await _context.Posts

            .Include(p => p.User)

            .Include(p => p.PostMedias)

            .Include(p => p.Likes)

            .Include(p => p.Comments)

            // Share
            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.User)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.PostMedias)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.Likes)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.Comments)

            .AsSplitQuery()

            .FirstOrDefaultAsync(p => p.Id == id);
    }

    // =====================================================
    // GET ALL POSTS
    // =====================================================

    public async Task<IEnumerable<Post>> GetPostsWithDetailsAsync()
    {
        return await _context.Posts

            .Where(p => p.Status == 1)

            .Include(p => p.User)

            .Include(p => p.PostMedias)

            .Include(p => p.Likes)

            .Include(p => p.Comments)

            // Share
            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.User)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.PostMedias)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.Likes)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.Comments)

            .OrderByDescending(p => p.CreatedAt)

            .AsSplitQuery()

            .ToListAsync();
    }

    // =====================================================
    // GET POSTS BY USER
    // =====================================================

    public async Task<IEnumerable<Post>> GetPostsByUserIdAsync(
        string userId)
    {
        return await _context.Posts

            .Where(p => p.UserId == userId &&
                p.Status != -1
            )

            .Include(p => p.User)

            .Include(p => p.PostMedias)

            .Include(p => p.Likes)

            .Include(p => p.Comments)

            // Share
            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.User)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.PostMedias)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.Likes)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.Comments)

            .OrderByDescending(p => p.CreatedAt)

            .AsSplitQuery()

            .ToListAsync();
    }

    // =====================================================
    // GET POST DETAILS
    // =====================================================

    public async Task<Post?> GetPostDetailsByIdAsync(int id)
    {
        return await _context.Posts

            .Include(p => p.User)

            .Include(p => p.PostMedias)

            .Include(p => p.Likes)

            .Include(p => p.Comments)

            // Share
            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.User)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.PostMedias)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.Likes)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.Comments)

            .AsSplitQuery()

            .FirstOrDefaultAsync(p => p.Id == id);
    }

    // =====================================================
    // HOME FEED
    // =====================================================

    public async Task<
        (IEnumerable<Post> Posts, int TotalCount)
    > GetHomeFeedPagedAsync(
        string currentUserId,
        IEnumerable<string> friendIds,
        int page,
        int pageSize)
    {
        var friendIdSet = friendIds.ToHashSet();

        var query = _context.Posts

            .Include(p => p.User)

            .Include(p => p.PostMedias)

            .Include(p => p.Likes)

            .Include(p => p.Comments)

            // Share
            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.User)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.PostMedias)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.Likes)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.Comments)

            .Where(p =>

                // Public
                p.Status == 1

                ||

                // Friend
                (
                    p.Status == 2
                    &&
                    (
                        friendIdSet.Contains(p.UserId!)
                        || p.UserId == currentUserId
                    )
                )

                ||

                // Private
                (
                    p.Status == 3
                    &&
                    p.UserId == currentUserId
                )
            )

            .OrderByDescending(p => p.CreatedAt)

            .AsSplitQuery();

        var totalCount = await query.CountAsync();

        var posts = await query

            .Skip((page - 1) * pageSize)

            .Take(pageSize)

            .ToListAsync();

        return (posts, totalCount);
    }

    // =====================================================
    // SEARCH POSTS
    // =====================================================

    public async Task<IEnumerable<Post>> SearchPostsAsync(
        string keyword)
    {
        keyword = keyword.Trim();

        return await _context.Posts

            .Where(p =>

                p.Status == 1

                &&

                (
                    (
                        p.Content != null
                        &&
                        EF.Functions.Like(
                            p.Content,
                            $"%{keyword}%"
                        )
                    )

                    ||

                    (
                        p.Title != null
                        &&
                        EF.Functions.Like(
                            p.Title,
                            $"%{keyword}%"
                        )
                    )
                )
            )

            .Include(p => p.User)

            .Include(p => p.PostMedias)

            .Include(p => p.Likes)

            .Include(p => p.Comments)

            // Share
            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.User)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.PostMedias)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.Likes)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op!.Comments)

            .OrderByDescending(p => p.CreatedAt)

            .Take(50)

            .AsSplitQuery()

            .ToListAsync();
    }

    // =====================================================
    // ADMIN
    // =====================================================

    public async Task<IEnumerable<PostAdminDTO>> GetAllPostsForAdminAsync()
    {
        var posts = await _context.Posts
            .OrderByDescending(p => p.CreatedAt)

            .Include(p => p.User)

            .Include(p => p.PostMedias)

            .Include(p => p.Likes)
                .ThenInclude(l => l.User)

            .Include(p => p.Comments)
                .ThenInclude(c => c.User)
            .Include(p => p.OriginalPost)
                .ThenInclude(op => op.User)

            .Include(p => p.OriginalPost)
                .ThenInclude(op => op.PostMedias)

            .AsSplitQuery()

            .ToListAsync();

        return posts.Select(p =>
        {
            var allCommentDtos = p.Comments
                .Select(c => new CommentAdminDTO
                {
                    Id = c.Id,

                    Content = c.Content ?? "",

                    UserId = c.UserId ?? "",

                    UserName = c.User?.UserName ?? "",

                    UserAvatar =
                        c.User?.ProfilePicture,

                    PostId = c.PostId,

                    ParentId = c.ParentId,

                    // Tra tên người được reply dựa vào ParentId
                    ParentUserName = c.ParentId.HasValue
                        ? p.Comments?
                            .FirstOrDefault(parent => parent.Id == c.ParentId.Value)
                            ?.User?.UserName
                        : null,

                    Status = c.Status,

                    CreatedAt = c.CreatedAt,

                    LikeCount = 0,

                    IsLikedByCurrentUser = false,

                    Replies =
                        new List<CommentAdminDTO>()
                })
                .ToList();

            var commentMap =
                allCommentDtos.ToDictionary(c => c.Id);

            var rootComments =
                new List<CommentAdminDTO>();

            foreach (var dto in allCommentDtos)
            {
                if (
                    dto.ParentId.HasValue
                    &&
                    commentMap.TryGetValue(
                        dto.ParentId.Value,
                        out var parentDto)
                )
                {
                    parentDto.Replies.Add(dto);
                }
                else
                {
                    rootComments.Add(dto);
                }
            }

            return new PostAdminDTO
            {
                Id = p.Id,

                Title = p.Title,

                Content = p.Content,

                UserId = p.UserId,

                Status = p.Status,
                AuthorName = p.User?.FullName ?? "User",
                AuthorAvatar = p.User?.ProfilePicture ?? "",
                CreatedAt = p.CreatedAt,

                MediaUrls =
                    p.PostMedias?
                        .Select(m => m.Url)
                        .ToList()

                    ?? new List<string>(),

                LikeCount =
                    p.Likes.Count(l => l.Status == 1),

                UserLike = (p.Likes ?? Enumerable.Empty<Like>())
                    .Where(l => l.Status == 1)
                    .Select(l => new LikeAdminDTO
                    {
                        UserId = l.UserId,

                        UserName =
                            l.User?.UserName ?? "",

                        Avatar =
                            l.User?.ProfilePicture ?? "",

                        Type = l.Type.ToString()
                    })
                    .ToList(),

                CommentCount = p.Comments?.Count ?? 0,

                Comments = rootComments,
                SharedPost = p.OriginalPost == null ? null : new PostAdminDTO
                {
                    Id = p.OriginalPost.Id,
                    Title = p.OriginalPost.Title,
                    Content = p.OriginalPost.Content,
                    UserId = p.OriginalPost.UserId,
                    AuthorName = p.OriginalPost.User?.FullName ?? "User",
                    AuthorAvatar = p.OriginalPost.User?.ProfilePicture ?? "",
                    CreatedAt = p.OriginalPost.CreatedAt,

                    MediaUrls = p.OriginalPost.PostMedias?
                    
                    .Select(m => m.Url)
                    .ToList() ?? new List<string>()
                }
            };
        });
    }

    public async Task<bool> UpdateStatusPostForAdminAsync(
        int postId,
        int status)
    {
        var rows = await _context.Posts

            .Where(p => p.Id == postId)

            .ExecuteUpdateAsync(s =>
                s.SetProperty(
                    p => p.Status,
                    status
                )
            );

        return rows > 0;
    }

    public async Task<PostDashboardDTO> GetPostsCountAsync()
    {
        var totalPosts =
            await _context.Posts.CountAsync();

        var activity = await _context.Posts

            .Where(p => p.CreatedAt.HasValue)

            .Include(p => p.Comments)

            .Include(p => p.Likes)

            .GroupBy(p => new
            {
                p.CreatedAt!.Value.Year,
                p.CreatedAt!.Value.Month
            })

            .Select(g => new PostActivityStatDTO
            {
                Month = g.Key.Month.ToString(),

                Posts = g.Count(),

                Comments = g
                    .SelectMany(p => p.Comments)
                    .Count(),

                Likes = g
                    .SelectMany(p => p.Likes)
                    .Count(l => l.Status == 1)
            })

            .OrderBy(x => x.Month)

            .ToListAsync();

        return new PostDashboardDTO
        {
            TotalPosts = totalPosts,

            Activity = activity
        };
    }
}