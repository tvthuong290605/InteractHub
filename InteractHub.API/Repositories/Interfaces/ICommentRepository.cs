// using InteractHub.API.Entities;

// namespace InteractHub.API.Repositories.Interfaces;

// public interface ICommentRepository : IRepository<Comment>
// {
//     Task<IEnumerable<Comment>> GetByPostIdAsync(int postId);
//     Task<Comment?> GetByIdWithUserAsync(int commentId);   // Dùng để load User khi tạo mới
//                                                           // Trong Repositories/Interfaces/ICommentRepository.cs
//     Task<bool> CheckLikeExistsAsync(string userId, int commentId);
//     Task AddLikeAsync(string userId, int commentId);
//     Task RemoveLikeAsync(string userId, int commentId);
//     Task<bool> PostExistsAsync(int postId);
//     Task<bool> ParentCommentExistsAsync(int parentId);
//     Task<int> CountUniqueRepliersAsync(int parentCommentId);
//     Task<bool> UpdateCommentStatusAsync(int commentId, int status); // cập nhật status cho comment 1: public , 2: friend, 3:private, 0:hidden, -1: delete

// }

using InteractHub.API.Entities;

namespace InteractHub.API.Repositories.Interfaces;

public interface ICommentRepository : IRepository<Comment>
{
    Task<IEnumerable<Comment>> GetByPostIdAsync(int postId);

    Task<Comment?> GetByIdWithUserAsync(int commentId);

    Task<bool> CheckLikeExistsAsync(string userId, int commentId);
    Task AddLikeAsync(string userId, int commentId);
    Task RemoveLikeAsync(string userId, int commentId);

    Task<bool> PostExistsAsync(int postId);
    Task<bool> ParentCommentExistsAsync(int parentId);

    Task<int> CountUniqueRepliersAsync(int parentCommentId);

    /// <summary>
    /// Lấy bài viết kèm UserId của chủ sở hữu để gửi thông báo khi có comment mới.
    /// </summary>
    Task<Post?> GetPostWithOwnerAsync(int postId);

    /// <summary>
    /// Đếm số người dùng duy nhất đã comment gốc vào bài viết (không tính reply).
    /// Dùng để nhóm thông báo: "A, B và N người khác đã bình luận bài viết của bạn."
    /// </summary>
    Task<int> CountUniqueCommentersAsync(int postId);

    /// <summary>
    /// Cập nhật status cho comment và toàn bộ replies con cháu.
    /// Status: 1 = public, 2 = friend, 3 = private, 0 = hidden, -1 = delete
    /// </summary>
    Task<bool> UpdateCommentStatusAsync(int commentId, int status);
}