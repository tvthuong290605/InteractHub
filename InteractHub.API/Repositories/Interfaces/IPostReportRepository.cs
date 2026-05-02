using InteractHub.API.Entities;
using InteractHub.API.DTOs.Posts;

namespace InteractHub.API.Repositories.Interfaces;

public interface IPostReportRepository : IRepository<PostReport>
{
    Task<bool> HasUserReportedPostAsync(string userId, int postId);

    // Đếm tổng số lượng report và số lượng report từng loại
    Task<PostReportDashboardDTO> GetReportsCountAsync();
    // lấy tất cả report
    Task<List<PostReportAdminDTO>> GetAllPostReportsAdminAsync();
    // cập nhật status và nội dung xử lý của report
    Task<bool> UpdateStatusAsync(int reportId, string? adminNote);

}