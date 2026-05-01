using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Posts;

namespace InteractHub.API.Services.Interfaces;

public interface IPostService
{
    // =====================================================
    // POST
    // =====================================================

    Task<Result<PostResponseDto>> CreatePostAsync(
        string userId,
        PostCreateDto dto
    );

    Task<Result<IEnumerable<PostResponseDto>>> GetTimelineAsync();

    Task<Result<IEnumerable<PostResponseDto>>> GetPostsByUserIdAsync(
        string userId
    );

    Task<Result<PostResponseDto>> GetPostByIdAsync(
        int postId
    );

    Task<Result<PostResponseDto>> UpdatePostAsync(
        int postId,
        string userId,
        PostUpdateDto dto
    );

    Task<Result<string>> DeletePostAsync(
        int postId,
        string userId
    );

    // =====================================================
    // FEED
    // =====================================================

    Task<Result<PagedPostResponseDto>> GetHomeFeedAsync(
        string currentUserId,
        int page,
        int pageSize
    );

    // =====================================================
    // SHARE POST
    // =====================================================

    Task<Result<PostResponseDto>> SharePostAsync(
        string userId,
        SharePostRequest request
    );

    // =====================================================
    // SEARCH
    // =====================================================

    Task<Result<IEnumerable<PostSearchResponseDto>>> SearchPostsAsync(
        string keyword
    );

    // =====================================================
    // ADMIN
    // =====================================================

    Task<Result<IEnumerable<PostAdminDTO>>> GetAllPostsForAdminAsync();

    Task<Result<string>> UpdateStatusPostForAdminAsync(
        int postId,
        int status
    );

    Task<Result<PostDashboardDTO>> GetPostsCountAsync();
}