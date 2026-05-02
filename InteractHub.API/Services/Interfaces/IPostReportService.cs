using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Posts;

namespace InteractHub.API.Services.Interfaces;

public interface IPostReportService
{
    Task<Result<string>> ReportPostAsync(string userId, PostReportRequestDTO request);

    Task<Result<PostReportDashboardDTO>> GetReportsCountAsync();

    Task<Result<List<PostReportAdminDTO>>> GetAllPostReportsAdminAsync();

    Task<Result<bool>> UpdateStatusAsync(int reportId, string? adminNote, int status, string userNameAuthor);
}