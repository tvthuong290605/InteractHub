using InteractHub.API.Data;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using InteractHub.API.DTOs.Posts;
using CommentAdminDTO = InteractHub.API.DTOs.Comments.CommentAdminDTO;
using LikeAdminDTO = InteractHub.API.DTOs.Like.LikeAdminDTO;

namespace InteractHub.API.Repositories.Implementations;

public class PostReportRepository : Repository<PostReport>, IPostReportRepository
{
    public PostReportRepository(AppDbContext context) : base(context) { }

    public async Task<bool> HasUserReportedPostAsync(string userId, int postId)
    {
        return await _dbSet.AnyAsync(r => r.UserId == userId && r.PostId == postId);
    }

    public async Task<PostReportDashboardDTO> GetReportsCountAsync()
    {
        var totalCount = await _context.PostReports.CountAsync();

        var postReports = await _context.PostReports
        .GroupBy(r =>
            (r.Reason ?? "").Contains(":")
                ? (r.Reason ?? "").Substring(0, (r.Reason ?? "").IndexOf(":")).Trim()
                : (r.Reason ?? "").Trim()
        )
        .Select(g => new PostReportDTO
        {
            Reason = g.Key,
            Count = g.Count()
        })
        .ToListAsync();

        return new PostReportDashboardDTO
        {
            TotalReport = totalCount,
            PostReports = postReports
        };
    }

    // public async Task<List<PostReportAdminDTO>> GetAllPostReportsAdminAsync()
    // {
    //     var rawData = await _context.PostReports
    //         .OrderByDescending(r => r.CreatedAt)
    //         .Select(r => new
    //         {
    //             r.Id,
    //             r.PostId,
    //             r.UserId,
    //             UserName = r.User != null ? r.User.FullName : "",
    //             r.Reason,
    //             r.Status,

    //             Post = new
    //             {
    //                 r.Post.Id,
    //                 r.Post.Title,
    //                 r.Post.Content,
    //                 r.Post.UserId,
    //                 r.Post.Status,

    //                 AuthorName = r.Post.User != null ? r.Post.User.FullName : "",
    //                 AuthorAvatar = r.Post.User != null ? r.Post.User.ProfilePicture : "",
    //                 r.Post.CreatedAt,

    //                 LikeCount = r.Post.Likes.Count(l => l.Status == 1),
    //                 CommentCount = r.Post.Comments.Count(),

    //                 // 👇 để IQueryable (KHÔNG ToList ở đây)
    //                 Media = r.Post.PostMedias.Select(m => m.Url)
    //             }
    //         })
    //         .ToListAsync();

    //     // 👉 xử lý sau khi đã về memory
    //     var result = rawData.Select(r =>
    //     {
    //         var reason = r.Reason ?? "";

    //         string type;
    //         string? content = null;

    //         if (reason.Contains(":"))
    //         {
    //             var parts = reason.Split(':', 2);
    //             type = parts[0].Trim();
    //             content = parts.Length > 1 ? parts[1].Trim() : null;
    //         }
    //         else
    //         {
    //             type = reason.Trim();
    //         }

    //         return new PostReportAdminDTO
    //         {
    //             Id = r.Id,
    //             PostId = r.PostId,
    //             UserId = r.UserId,
    //             UserName= r.UserName,
    //             Type = type,
    //             Content = content,
    //             Status = r.Status,

    //             Post = new PostAdminDTO
    //             {
    //                 Id = r.Post.Id,
    //                 Title = r.Post.Title,
    //                 Content = r.Post.Content,
    //                 UserId = r.Post.UserId,
    //                 Status = r.Post.Status,

    //                 AuthorName = r.Post.AuthorName,
    //                 AuthorAvatar = r.Post.AuthorAvatar,
    //                 CreatedAt = r.Post.CreatedAt,

    //                 LikeCount = r.Post.LikeCount,
    //                 CommentCount = r.Post.CommentCount,

    //                 // 👇 convert tại đây
    //                 MediaUrls = r.Post.Media.ToList()
    //             }
    //         };
    //     }).ToList();

    //     return result;
    // }

    public async Task<List<PostReportAdminDTO>> GetAllPostReportsAdminAsync()
    {
        // ! : đảm bảo không null
        var reports = await _context.PostReports
            .OrderBy(r => r.Status == 0 ? 0 : 1)   // Status = 0 lên đầu
            .ThenByDescending(r => r.CreatedAt)    // sau đó mới sort theo ngày
            .Include(r => r.User)
            .Include(r => r.Post)
                .ThenInclude(p => p.User)
            .Include(r => r.Post)
                .ThenInclude(p => p.PostMedias)
            .Include(r => r.Post)
                .ThenInclude(p => p.Likes!)
                .ThenInclude(l => l.User)

            .Include(r => r.Post)
                .ThenInclude(p => p.Comments!)
                .ThenInclude(c => c.User)
            .AsSplitQuery()
            .ToListAsync();

        var result = reports.Select(r =>
        {
            // ───── xử lý reason → type + content ─────
            var reason = r.Reason ?? "";
            string type;
            string? content = null;

            if (reason.Contains(":"))
            {
                var parts = reason.Split(':', 2);
                type = parts[0].Trim();
                content = parts.Length > 1 ? parts[1].Trim() : null;
            }
            else
            {
                type = reason.Trim();
            }

            var p = r.Post;

            var allComments = p.Comments?
                .Select(c => new CommentAdminDTO
                {
                    Id = c.Id,
                    Content = c.Content ?? "",
                    UserId = c.UserId ?? "",
                    UserName = c.User?.UserName ?? "",
                    UserAvatar = c.User?.ProfilePicture,
                    PostId = c.PostId,
                    ParentId = c.ParentId,
                    ParentUserName = c.ParentId.HasValue
                        ? p.Comments.FirstOrDefault(x => x.Id == c.ParentId)?.User?.UserName
                        : null,
                    Status = c.Status,
                    CreatedAt = c.CreatedAt,
                    LikeCount = 0,
                    IsLikedByCurrentUser = false,
                    Replies = new List<CommentAdminDTO>()
                })
                .ToList() ?? new List<CommentAdminDTO>();

            var map = allComments.ToDictionary(c => c.Id);
            var rootComments = new List<CommentAdminDTO>();

            foreach (var c in allComments)
            {
                if (c.ParentId.HasValue && map.TryGetValue(c.ParentId.Value, out var parent))
                {
                    parent.Replies.Add(c);
                }
                else
                {
                    rootComments.Add(c);
                }
            }

            return new PostReportAdminDTO
            {
                Id = r.Id,
                PostId = r.PostId,
                UserId = r.UserId,
                UserName = r.User?.FullName ?? "",

                Type = type,
                Content = content,
                Status = r.Status,
                CreatedAt = r.CreatedAt,
                ResolvedAt = r.ResolvedAt,
                AdminNote = r.AdminNote,

                Post = new PostAdminDTO
                {
                    Id = p.Id,
                    Title = p.Title,
                    Content = p.Content,
                    UserId = p.UserId,
                    Status = p.Status,

                    AuthorName = p.User?.FullName ?? "",
                    AuthorAvatar = p.User?.ProfilePicture ?? "",
                    CreatedAt = p.CreatedAt,

                    MediaUrls = p.PostMedias?
                        .Select(m => m.Url)
                        .ToList() ?? new List<string>(),

                    // ✅ LIKE FULL
                    LikeCount = p.Likes?.Count(l => l.Status == 1) ?? 0,
                    UserLike = (p.Likes ?? Enumerable.Empty<Like>())
                        .Where(l => l.Status == 1)
                        .Select(l => new LikeAdminDTO
                        {
                            UserId = l.UserId,
                            UserName = l.User?.UserName ?? "",
                            Avatar = l.User?.ProfilePicture ?? "",
                            Type = l.Type.ToString()
                        }).ToList(),

                    // ✅ COMMENT FULL
                    CommentCount = p.Comments?.Count ?? 0,
                    Comments = rootComments
                }
            };
        }).ToList();

        return result;
    }

    public async Task<bool> UpdateStatusAsync(int reportId, string? adminNote)
    {
        var report = await _context.PostReports
            .FirstOrDefaultAsync(r => r.Id == reportId);

        if (report == null)
            return false;


        report.Status = 1;
        report.AdminNote = adminNote;
        report.ResolvedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }
}