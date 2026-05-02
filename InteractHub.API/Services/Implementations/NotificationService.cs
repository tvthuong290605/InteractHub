using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Notification;
using InteractHub.API.Entities;
using InteractHub.API.Hubs;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace InteractHub.API.Services.Implementations;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepo;
    private readonly IHubContext<ChatHub> _hubContext; // ✅ thêm

    public NotificationService(
        INotificationRepository notificationRepo,
        IHubContext<ChatHub> hubContext)               // ✅ thêm
    {
        _notificationRepo = notificationRepo;
        _hubContext = hubContext;
    }

    // ── Lấy danh sách thông báo ───────────────────────────────────
    public async Task<Result<IEnumerable<NotificationResponseDto>>> GetNotificationsByUserIdAsync(
        string userId)
    {
        var notifications = await _notificationRepo.GetByUserIdAsync(userId);
        return Result<IEnumerable<NotificationResponseDto>>.Ok(
            notifications.Select(MapToDto)
        );
    }

    // ── Tạo hoặc cập nhật thông báo tương tác (like, comment...) ─
    public async Task CreateOrUpdateInteractionNotificationAsync(
        string receiverId,
        string actorId,
        string type,
        string link,
        string message,
        int currentCount)
    {
        // Unlike / bỏ tương tác → xóa thông báo
        if (currentCount <= 0)
        {
            var existing = await _notificationRepo.GetExistingNotificationAsync(
                receiverId, type, link);
            if (existing != null)
            {
                _notificationRepo.Delete(existing);
                await _notificationRepo.SaveChangesAsync();
            }
            return;
        }

        var notify = await _notificationRepo.GetExistingNotificationAsync(
            receiverId, type, link);

        if (notify == null)
        {
            notify = new Notification
            {
                UserId      = receiverId,
                LastActorId = actorId,
                ActorsCount = currentCount,
                Message     = message,
                Type        = type,
                Link        = link,
                IsRead      = false,
                CreatedAt   = DateTime.UtcNow,
            };
            await _notificationRepo.AddAsync(notify);
        }
        else
        {
            notify.LastActorId = actorId;
            notify.ActorsCount = currentCount;
            notify.IsRead      = false;
            notify.UpdatedAt   = DateTime.UtcNow;
            notify.Message     = message;
            _notificationRepo.Update(notify);
        }

        await _notificationRepo.SaveChangesAsync();

        // ✅ Push realtime sau khi lưu
        await PushAsync(receiverId, notify);
    }

    // ── Tạo thông báo đơn giản (system, friend request...) ───────
    public async Task CreateNotificationAsync(
        string userId, string message, string type, string? link)
    {
        var notification = new Notification
        {
            UserId    = userId,
            Message   = message,
            Type      = type,
            Link      = link,
            IsRead    = false,
            CreatedAt = DateTime.UtcNow,
        };

        await _notificationRepo.AddAsync(notification);
        await _notificationRepo.SaveChangesAsync();

        // ✅ Push realtime sau khi lưu
        await PushAsync(userId, notification);
    }

    // ── Đếm chưa đọc ─────────────────────────────────────────────
    public async Task<Result<int>> GetUnreadCountAsync(string userId)
    {
        var count = await _notificationRepo.CountUnreadAsync(userId);
        return Result<int>.Ok(count);
    }

    // ── Đánh dấu 1 thông báo đã đọc ──────────────────────────────
    public async Task<Result<string>> MarkAsReadAsync(int notificationId, string userId)
    {
        var notification = await _notificationRepo.GetByIdAndUserAsync(
            notificationId, userId);
        if (notification == null)
            return Result<string>.NotFound("Không tìm thấy thông báo.");

        notification.IsRead = true;
        _notificationRepo.Update(notification);
        await _notificationRepo.SaveChangesAsync();
        return Result<string>.Ok("Đã đánh dấu là đã đọc.");
    }

    // ── Đánh dấu tất cả đã đọc ───────────────────────────────────
    public async Task<Result<string>> MarkAllAsReadAsync(string userId)
    {
        var notifications = await _notificationRepo.GetByUserIdAsync(userId);
        foreach (var n in notifications.Where(n => !n.IsRead))
        {
            n.IsRead = true;
            _notificationRepo.Update(n);
        }
        await _notificationRepo.SaveChangesAsync();
        return Result<string>.Ok("Đã đọc tất cả.");
    }

    // ── Xóa thông báo ─────────────────────────────────────────────
    public async Task<Result<string>> DeleteNotificationAsync(
        int notificationId, string userId)
    {
        var notification = await _notificationRepo.GetByIdAndUserAsync(
            notificationId, userId);
        if (notification == null)
            return Result<string>.NotFound("Không thể xóa thông báo.");

        _notificationRepo.Delete(notification);
        await _notificationRepo.SaveChangesAsync();
        return Result<string>.Ok("Đã xóa thông báo.");
    }

    // ── Xóa theo logic (không cần userId) ────────────────────────
    public async Task DeleteNotificationByLogicAsync(
        string receiverId, string type, string link)
    {
        var existing = await _notificationRepo.GetExistingNotificationAsync(
            receiverId, type, link);
        if (existing != null)
            _notificationRepo.Delete(existing);
    }

    // ════════════════════════════════════════════════════════════════
    // ── PRIVATE HELPERS ─────────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════

    /// <summary>
    /// Push thông báo realtime tới receiver qua SignalR.
    /// Group = userId (được setup trong ChatHub.OnConnectedAsync)
    /// </summary>
    private async Task PushAsync(string receiverId, Notification notification)
    {
        var dto = MapToDto(notification);
        await _hubContext.Clients
            .Group(receiverId)
            .SendAsync("ReceiveNotification", dto); // Khớp với FE: signalRService.onReceiveNotification
    }

    private static NotificationResponseDto MapToDto(Notification n) => new()
    {
        Id              = n.Id,
        Message         = n.Message,
        Type            = n.Type,
        Link            = n.Link,
        IsRead          = n.IsRead,
        CreatedAt       = n.UpdatedAt ?? n.CreatedAt,
        LastActorName   = n.LastActor?.FullName ?? n.LastActor?.UserName ?? "Người dùng",
        LastActorAvatar = n.LastActor?.ProfilePicture,
        ActorsCount     = n.ActorsCount,
    };
}