using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Posts;
using InteractHub.API.Entities;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.API.Services.Implementations;

public class PostReportService : IPostReportService
{
    private readonly IPostReportRepository _reportRepo;
    private readonly IPostRepository _postRepo;
    private readonly INotificationService _notificationService;


    public PostReportService(IPostReportRepository reportRepo, IPostRepository postRepo, INotificationService notificationService
)
    {
        _reportRepo = reportRepo;
        _postRepo = postRepo;
        _notificationService = notificationService;

    }

    public async Task<Result<string>> ReportPostAsync(string userId, PostReportRequestDTO request)
    {
        var post = await _postRepo.GetByIdAsync(request.PostId);
        if (post == null)
            return Result<string>.NotFound("Bài viết không tồn tại.");

        var exists = await _reportRepo.HasUserReportedPostAsync(userId, request.PostId);
        if (exists)
            return Result<string>.Conflict("Bạn đã báo cáo bài viết này rồi.");

        var report = new PostReport
        {
            PostId = request.PostId,
            UserId = userId,
            Reason = request.Reason,
            CreatedAt = DateTime.UtcNow,
            Status = 0
        };

        try
        {
            await _reportRepo.AddAsync(report);
            await _reportRepo.SaveChangesAsync();
            return Result<string>.Ok(message: "Cảm ơn bạn, báo cáo đã được gửi tới đội ngũ quản trị.");
        }
        catch (DbUpdateException)
        {
            return Result<string>.Conflict("Bạn đã báo cáo bài viết này rồi.");
        }
    }

    public async Task<Result<PostReportDashboardDTO>> GetReportsCountAsync()
    {
        try
        {
            var count = await _reportRepo.GetReportsCountAsync();

            return Result<PostReportDashboardDTO>.Ok(count);
        }
        catch (Exception ex)
        {
            return Result<PostReportDashboardDTO>.ServerError($"Lỗi khi lấy dữ liệu từ báo cáo: {ex.Message}");
        }
    }

    public async Task<Result<List<PostReportAdminDTO>>> GetAllPostReportsAdminAsync()
    {
        try
        {
            var count = await _reportRepo.GetAllPostReportsAdminAsync();

            return Result<List<PostReportAdminDTO>>.Ok(count);
        }
        catch (Exception ex)
        {
            return Result<List<PostReportAdminDTO>>.ServerError($"Lỗi khi lấy dữ liệu báo cáo: {ex.Message}");
        }
    }

    // public async Task<Result<bool>> UpdateStatusAsync(int reportId, string? adminNote, int status, string userNameAuthor)
    // {
    //     try
    //     {
    //         var result = await _reportRepo.UpdateStatusAsync(reportId, adminNote);
    //         return Result<bool>.Ok(result);
    //     }
    //     catch (Exception ex)
    //     {
    //         return Result<bool>.ServerError($"Lỗi khi cập nhật status: {ex.Message}");
    //     }
    // }

    public async Task<Result<bool>> UpdateStatusAsync(
    int reportId,
    string? adminNote,
    int status,
    string userNameAuthor)
    {
        try
        {
            // 1. Lấy report
            var report = await _reportRepo.GetByIdAsync(reportId);
            if (report == null)
                return Result<bool>.NotFound("Report không tồn tại");

            // 2. Update report
            var result = await _reportRepo.UpdateStatusAsync(reportId, adminNote);

            if (!result)
                return Result<bool>.ServerError("Không thể cập nhật report");

            // 3. Tạo message gửi cho NGƯỜI REPORT
            string message = status switch
            {
                1 => $"Báo cáo của bạn về bài viết của {userNameAuthor} đã được xử lý.",
                -1 => $"Báo cáo của bạn về bài viết của {userNameAuthor} đã bị từ chối.",
                _ => "Trạng thái báo cáo đã được cập nhật."
            };

            string type = status switch
            {
                1 => "REPORT_RESOLVED",
                -1 => "REPORT_REJECTED",
                _ => "REPORT_UPDATED"
            };

            // 4. Gửi notification cho NGƯỜI REPORT (QUAN TRỌNG)
            await _notificationService.CreateNotificationAsync(
                userId: report.UserId!, // ✅ người đi report
                message: message,
                type: type,
                link: $"/post/{report.PostId}"
            );

            return Result<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return Result<bool>.ServerError($"Lỗi khi cập nhật status: {ex.Message}");
        }
    }
}