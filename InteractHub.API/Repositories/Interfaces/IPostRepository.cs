using InteractHub.API.Entities;
using InteractHub.API.DTOs.Posts;

namespace InteractHub.API.Repositories.Interfaces;

public interface IPostRepository
{
    // Các phương thức cơ bản từ Generic (nếu bạn có IRepository chung thì kế thừa, nếu không thì khai báo dưới đây)
    Task AddAsync(Post post);
    void Update(Post post);
    void Delete(Post post);
    Task<bool> SaveChangesAsync();
    Task<Post?> GetByIdAsync(int id);

    // Các phương thức lấy dữ liệu chi tiết
    Task<IEnumerable<Post>> GetPostsWithDetailsAsync(); // Lấy bảng tin chung
    Task<IEnumerable<Post>> GetPostsByUserIdAsync(string userId); // Lấy bài viết của 1 người
    Task<Post?> GetPostDetailsByIdAsync(int id); // Lấy chi tiết 1 bài viết kèm Media/Like/Comment

    // phương thức cho admin
    Task<IEnumerable<PostAdminDTO>> GetAllPostsForAdminAsync();  // Lấy tất cả bài viết  của tất cả user
    Task<bool> UpdateStatusPostForAdminAsync(int postId, int status);
    Task<PostDashboardDTO> GetPostsCountAsync();
    Task<(IEnumerable<Post> Posts, int TotalCount)> GetHomeFeedPagedAsync(
    string currentUserId,
    IEnumerable<string> friendIds,
    int page,
    int pageSize);
}