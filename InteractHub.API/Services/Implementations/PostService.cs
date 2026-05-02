using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Posts;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;


namespace InteractHub.API.Services.Implementations;

public class PostService : IPostService
{
    private readonly IPostRepository _postRepo;
    private readonly IMediaService _mediaService;
    private readonly IHashtagService _hashtagService;
    private readonly IPostHashtagRepository _postHashtagRepo;
    private readonly IFriendshipRepository _friendshipRepo;
    private readonly INotificationService _notificationService;

    public PostService(
        IPostRepository postRepo,
        IMediaService mediaService,
        IHashtagService hashtagService,
        IPostHashtagRepository postHashtagRepo,
        INotificationService notificationService,
        IFriendshipRepository friendshipRepo)
    {
        _postRepo = postRepo;
        _mediaService = mediaService;
        _hashtagService = hashtagService;
        _postHashtagRepo = postHashtagRepo;
        _friendshipRepo = friendshipRepo;
        _notificationService = notificationService;
    }

    // =====================================================
    // CREATE POST
    // =====================================================

    public async Task<Result<PostResponseDto>> CreatePostAsync(
        string userId, PostCreateDto dto)
    {
        var post = new Post
        {
            UserId = userId,
            Title = dto.Title?.Trim(),
            Content = dto.Content?.Trim(),
            Status = dto.Status ?? 1,
            OriginalPostId = dto.OriginalPostId,
            CreatedAt = DateTime.UtcNow,
            PostMedias = new List<PostMedia>()
        };

        if (dto.Files != null && dto.Files.Any())
        {
            foreach (var file in dto.Files)
            {
                var url = await _mediaService.SaveFileAsync(file, "posts");
                if (!string.IsNullOrWhiteSpace(url))
                {
                    post.PostMedias.Add(new PostMedia
                    {
                        Url = url,
                        MediaType = file.ContentType.Contains("video") ? 1 : 0
                    });
                }
            }
        }

        await _postRepo.AddAsync(post);
        await _postRepo.SaveChangesAsync();

        await HandleHashtagsAsync(post.Id, post.Content);

        var result = await _postRepo.GetPostDetailsByIdAsync(post.Id);

        return Result<PostResponseDto>.Ok(
            MapToDto(result ?? post),
            "Tạo bài viết thành công."
        );
    }

    // =====================================================
    // UPDATE POST
    // =====================================================

    public async Task<Result<PostResponseDto>> UpdatePostAsync(
        int postId, string userId, PostUpdateDto dto)
    {
        var post = await _postRepo.GetPostDetailsByIdAsync(postId);

        if (post == null)
            return Result<PostResponseDto>.NotFound("Bài viết không tồn tại.");

        if (post.UserId != userId)
            return Result<PostResponseDto>.BadRequest("Bạn không có quyền chỉnh sửa bài viết này.");

        if (dto.Title != null)   post.Title   = dto.Title.Trim();
        if (dto.Content != null) post.Content = dto.Content.Trim();
        if (dto.Status != null)  post.Status  = dto.Status.Value;

        post.UpdatedAt = DateTime.UtcNow;

        if (dto.DeleteMediaUrls != null && dto.DeleteMediaUrls.Any())
        {
            var deleteList = post.PostMedias
                .Where(m => dto.DeleteMediaUrls.Contains(m.Url))
                .ToList();

            foreach (var media in deleteList)
            {
                _mediaService.DeleteFile(media.Url);
                post.PostMedias.Remove(media);
            }
        }

        if (dto.NewFiles != null && dto.NewFiles.Any())
        {
            foreach (var file in dto.NewFiles)
            {
                var url = await _mediaService.SaveFileAsync(file, "posts");
                if (!string.IsNullOrWhiteSpace(url))
                {
                    post.PostMedias.Add(new PostMedia
                    {
                        Url = url,
                        MediaType = file.ContentType.Contains("video") ? 1 : 0
                    });
                }
            }
        }

        if (dto.Content != null)
        {
            await _postHashtagRepo.DeleteByPostIdAsync(post.Id);
            await HandleHashtagsAsync(post.Id, post.Content);
        }

        _postRepo.Update(post);
        await _postRepo.SaveChangesAsync();

        var updated = await _postRepo.GetPostDetailsByIdAsync(post.Id);

        return Result<PostResponseDto>.Ok(
            MapToDto(updated ?? post),
            "Cập nhật bài viết thành công."
        );
    }

    // =====================================================
    // DELETE POST
    // =====================================================

    public async Task<Result<string>> DeletePostAsync(int postId, string userId)
    {
        var post = await _postRepo.GetPostDetailsByIdAsync(postId);

        if (post == null)
            return Result<string>.NotFound("Bài viết không tồn tại.");

        if (post.UserId != userId)
            return Result<string>.BadRequest("Bạn không có quyền xóa bài viết này.");

        if (post.PostMedias != null)
        {
            foreach (var media in post.PostMedias)
                _mediaService.DeleteFile(media.Url);
        }

        await _postHashtagRepo.DeleteByPostIdAsync(post.Id);
        _postRepo.Delete(post);
        await _postRepo.SaveChangesAsync();

        return Result<string>.Ok(message: "Xóa bài viết thành công.");
    }

    // =====================================================
    // GET TIMELINE
    // =====================================================

    public async Task<Result<IEnumerable<PostResponseDto>>> GetTimelineAsync()
    {
        var posts = await _postRepo.GetPostsWithDetailsAsync();
        return Result<IEnumerable<PostResponseDto>>.Ok(posts.Select(MapToDto));
    }

    // =====================================================
    // GET POSTS BY USER
    // =====================================================

    public async Task<Result<IEnumerable<PostResponseDto>>> GetPostsByUserIdAsync(string userId)
    {
        var posts = await _postRepo.GetPostsByUserIdAsync(userId);
        return Result<IEnumerable<PostResponseDto>>.Ok(posts.Select(MapToDto));
    }

    // =====================================================
    // GET POST BY ID
    // =====================================================

    public async Task<Result<PostResponseDto>> GetPostByIdAsync(int postId)
    {
        var post = await _postRepo.GetPostDetailsByIdAsync(postId);

        if (post == null)
            return Result<PostResponseDto>.NotFound("Bài viết không tồn tại.");

        return Result<PostResponseDto>.Ok(MapToDto(post));
    }

    // =====================================================
    // HOME FEED
    // =====================================================

    public async Task<Result<PagedPostResponseDto>> GetHomeFeedAsync(
        string currentUserId, int page = 1, int pageSize = 10)
    {
        var friendIds = await _friendshipRepo.GetFriendIdsAsync(currentUserId);

        var (posts, totalCount) = await _postRepo.GetHomeFeedPagedAsync(
            currentUserId, friendIds, page, pageSize);

        return Result<PagedPostResponseDto>.Ok(new PagedPostResponseDto
        {
            Posts      = posts.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            HasMore    = page * pageSize < totalCount
        });
    }

    // =====================================================
    // SHARE POST
    // =====================================================

    public async Task<Result<PostResponseDto>> SharePostAsync(
        string userId, SharePostRequest request)
    {
        var originalPost = await _postRepo.GetPostDetailsByIdAsync(request.OriginalPostId);

        if (originalPost == null)
            return Result<PostResponseDto>.NotFound("Bài viết gốc không tồn tại.");

        // ✅ Không cho tự share bài của chính mình
        if (originalPost.UserId == userId)
            return Result<PostResponseDto>.BadRequest("Bạn không thể chia sẻ bài viết của chính mình.");

        var sharedPost = new Post
        {
            UserId         = userId,
            Content        = request.Content?.Trim(),
            Title          = null,
            Status         = request.Status ?? 1,
            OriginalPostId = request.OriginalPostId,
            CreatedAt      = DateTime.UtcNow,
            PostMedias     = new List<PostMedia>()
        };

        // Tăng ShareCount bài gốc
        originalPost.ShareCount++;

        await _postRepo.AddAsync(sharedPost);
        _postRepo.Update(originalPost);
        await _postRepo.SaveChangesAsync();

        var result = await _postRepo.GetPostDetailsByIdAsync(sharedPost.Id);

        return Result<PostResponseDto>.Ok(
            MapToDto(result ?? sharedPost),
            "Chia sẻ bài viết thành công."
        );
    }

    // =====================================================
    // HANDLE HASHTAG
    // =====================================================

    private async Task HandleHashtagsAsync(int postId, string? content)
    {
        if (string.IsNullOrWhiteSpace(content)) return;

        var hashtags = await _hashtagService.ExtractHashtagsAsync(content);

        if (hashtags == null || !hashtags.Any()) return;

        var mappings = hashtags
            .Select(tag => new Post_Hashtag { PostId = postId, HashtagId = tag.Id })
            .ToList();

        await _postHashtagRepo.AddRangeAsync(mappings);
        await _postHashtagRepo.SaveChangesAsync();
    }

    // =====================================================
    // MAP TO DTO
    // =====================================================

    private static PostResponseDto MapToDto(Post p)
    {
        SharedPostDto? originalPost = null;

        if (p.OriginalPost != null)
        {
            originalPost = new SharedPostDto
            {
                Id          = p.OriginalPost.Id,
                Title       = p.OriginalPost.Title,
                Content     = p.OriginalPost.Content,
                UserId      = p.OriginalPost.UserId,
                Status      = p.OriginalPost.Status,
                AuthorName  = p.OriginalPost.User?.FullName ?? p.OriginalPost.User?.UserName ?? "User",
                AuthorAvatar = p.OriginalPost.User?.ProfilePicture ?? "",
                CreatedAt   = p.OriginalPost.CreatedAt,
                MediaUrls   = p.OriginalPost.PostMedias?.Select(m => m.Url).ToList() ?? new List<string>()
            };
        }

        return new PostResponseDto
        {
            Id           = p.Id,
            Title        = p.Title,
            Content      = p.Content,
            UserId       = p.UserId,
            Status       = p.Status,
            AuthorName   = p.User?.FullName ?? p.User?.UserName ?? "User",
            AuthorAvatar = p.User?.ProfilePicture ?? "",
            CreatedAt    = p.CreatedAt,
            UpdatedAt    = p.UpdatedAt,

            // Share
            OriginalPostId = p.OriginalPostId,
            OriginalPost   = originalPost,
            ShareCount     = p.ShareCount,

            // Count
            LikeCount    = p.Likes?.Count(l => l.Status == 1) ?? 0,
            CommentCount = p.Comments?.Count(c => c.ParentId == null) ?? 0,

            // Media
            MediaUrls = p.PostMedias?.Select(m => m.Url).ToList() ?? new List<string>()
        };
    }

    // =====================================================
    // ADMIN
    // =====================================================

    public async Task<Result<IEnumerable<PostAdminDTO>>> GetAllPostsForAdminAsync()
    {
        var posts = await _postRepo.GetAllPostsForAdminAsync();
        return Result<IEnumerable<PostAdminDTO>>.Ok(posts);
    }

    // public async Task<Result<string>> UpdateStatusPostForAdminAsync(int postId, int status)
    // {

    //     // status: -1. xóa ; 0. ẩn ; 1. public ; 2. friend ; 3. private
    //     if (status != 1 && status != 0 && status != -1 && status != 2 && status != 3)
    //         return Result<string>.BadRequest("Trạng thái không hợp lệ.");

    //     var post = await _postRepo.GetByIdAsync(postId);
    //     if (post == null)
    //         return Result<string>.NotFound("Bài đăng không tồn tại.");

    //     var result = await _postRepo.UpdateStatusPostForAdminAsync(postId, status);

    //     if (!result)
    //         return Result<string>.ServerError("Không thể cập nhật trạng thái.");

    //     //  Message theo status (UX tốt hơn)
    //     string message = status switch
    //     {
    //         -1 => "Đã xóa bài đăng.",
    //         0 => "Đã ẩn bài đăng.",
    //         1 => "Chế độ công khai.",
    //         2 => "Chế độ bạn bè",
    //         3 => "Chế độ riêng tư",
    //         _ => "Cập nhật trạng thái thành công."
    //     };

    //     return Result<string>.Ok(message: message);
    // }

    public async Task<Result<string>> UpdateStatusPostForAdminAsync(
    int postId, int status)
    {
        if (status != 1 && status != 0 && status != -1 && status != 2 && status != 3)
            return Result<string>.BadRequest("Trạng thái không hợp lệ.");

        var post = await _postRepo.GetByIdAsync(postId);

        if (post == null)
            return Result<string>.NotFound("Bài đăng không tồn tại.");

        var result = await _postRepo.UpdateStatusPostForAdminAsync(postId, status);

        if (!result)
            return Result<string>.ServerError("Không thể cập nhật trạng thái.");

        // ✅ 👉 CHỖ GỌI NOTIFICATION
        if (status == 0 || status == -1)
        {
            if (string.IsNullOrEmpty(post.UserId))
                return Result<string>.ServerError("UserId không hợp lệ");

            string message = status == 0
                ? "Bài viết của bạn đã bị ẩn bởi quản trị viên."
                : "Bài viết của bạn đã bị xóa bởi quản trị viên.";

            string type = status == 0 ? "POST_HIDDEN" : "POST_DELETED";

            await _notificationService.CreateNotificationAsync(
                userId: post.UserId,
                message: message,
                type: type,
                link: $"/post/{post.Id}"
            );
        }

        return Result<string>.Ok("Cập nhật trạng thái thành công.");
    }

    public async Task<Result<PostDashboardDTO>> GetPostsCountAsync()
    {
        try
        {
            var count = await _postRepo.GetPostsCountAsync();
            return Result<PostDashboardDTO>.Ok(count);
        }
        catch (Exception ex)
        {
            return Result<PostDashboardDTO>.ServerError(
                $"Lỗi khi lấy dữ liệu bài viết dashboard: {ex.Message}");
        }
    }

    // =====================================================
    // SEARCH POSTS
    // =====================================================

    public async Task<Result<IEnumerable<PostSearchResponseDto>>> SearchPostsAsync(string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
            return Result<IEnumerable<PostSearchResponseDto>>.Ok(
                Enumerable.Empty<PostSearchResponseDto>());

        var posts = await _postRepo.SearchPostsAsync(keyword);

        var dtos = posts.Select(p => new PostSearchResponseDto
        {
            Id           = p.Id,
            Title        = p.Title,
            Content      = p.Content,
            AuthorName   = p.User?.FullName ?? p.User?.UserName ?? "User",
            AuthorAvatar = p.User?.ProfilePicture ?? "",
            AuthorId     = p.UserId ?? "",
            CreatedAt    = p.CreatedAt ?? DateTime.UtcNow,
            LikeCount    = p.Likes?.Count(l => l.Status == 1) ?? 0,
            CommentCount = p.Comments?.Count ?? 0,
            MediaUrls    = p.PostMedias?.Select(m => m.Url).ToList() ?? new List<string>()
        });

        return Result<IEnumerable<PostSearchResponseDto>>.Ok(dtos);
    }
}