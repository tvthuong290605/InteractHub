using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.User;
using InteractHub.API.Entities;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.Data;
using Microsoft.EntityFrameworkCore;
using static InteractHub.API.DTOs.User.UserDto;

namespace InteractHub.API.Services.Implementations;

public class UserService : IUserService
{
    private readonly UserManager<User> _userManager;
    private readonly INotificationService _notificationService;
    private readonly IUserRepository _userRepository;
    private readonly AppDbContext _db;

    public UserService(
        UserManager<User> userManager,
        INotificationService notificationService,
        IUserRepository userRepository,
        AppDbContext db)
    {
        _userManager = userManager;
        _notificationService = notificationService;
        _userRepository = userRepository;
        _db = db;
    }

    public async Task<Result<UserDto>> GetByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        return user == null
            ? Result<UserDto>.NotFound("Người dùng không tồn tại.")
            : Result<UserDto>.Ok(await MapToDtoAsync(user));
    }

    public async Task<Result<UserDto>> GetMyProfileAsync(string userId)
    {
        return await GetByIdAsync(userId);
    }

    public async Task<Result<UserDto>> UpdateProfileAsync(string userId, UpdateProfileDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return Result<UserDto>.NotFound("Người dùng không tồn tại.");

        user.FullName = dto.UserName;
        user.PhoneNumber = dto.Phone;
        user.DateOfBirth = dto.DateOfBirth;
        user.Bio = dto.Bio;
        user.Gender = dto.Gender;

        if (!string.IsNullOrEmpty(dto.AvatarUrl))
            user.ProfilePicture = dto.AvatarUrl;

        if (!string.IsNullOrEmpty(dto.CoverUrl))
            user.CoverUrl = dto.CoverUrl;

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return Result<UserDto>.BadRequest(
                string.Join(", ", updateResult.Errors.Select(e => e.Description))
            );

        if (!string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
                return Result<UserDto>.BadRequest("Vui lòng nhập mật khẩu hiện tại.");

            if (dto.NewPassword != dto.ConfirmNewPassword)
                return Result<UserDto>.BadRequest("Mật khẩu xác nhận không khớp.");

            var passwordResult = await _userManager.ChangePasswordAsync(
                user, dto.CurrentPassword, dto.NewPassword);

            if (!passwordResult.Succeeded)
                return Result<UserDto>.BadRequest(
                    string.Join(", ", passwordResult.Errors.Select(e => e.Description))
                );

            await _notificationService.CreateNotificationAsync(
                userId,
                "Mật khẩu của bạn đã được thay đổi thành công.",
                "SECURITY",
                "/profile/settings"
            );
        }

        return Result<UserDto>.Ok(await MapToDtoAsync(user), "Cập nhật thông tin thành công.");
    }

    public async Task<Result<string>> UpdateAvatarAsync(string userId, string avatarUrl)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return Result<string>.NotFound("Người dùng không tồn tại.");

        user.ProfilePicture = avatarUrl;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return Result<string>.BadRequest(
                string.Join(", ", result.Errors.Select(e => e.Description))
            );

        return Result<string>.Ok(avatarUrl, "Cập nhật ảnh đại diện thành công.");
    }

    public async Task<Result<string>> UpdateCoverAsync(string userId, string coverUrl)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return Result<string>.NotFound("Người dùng không tồn tại.");

        user.CoverUrl = coverUrl;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return Result<string>.BadRequest(
                string.Join(", ", result.Errors.Select(e => e.Description))
            );

        return Result<string>.Ok(coverUrl, "Cập nhật ảnh bìa thành công.");
    }


    // ── GET ALL USERS (ADMIN) ────────────────────────────────
    public async Task<Result<List<UserAdminDTO>>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();

        if (users == null || !users.Any())
            return Result<List<UserAdminDTO>>.Ok(new List<UserAdminDTO>());

        var postCounts = await _db.Posts
            .Where(p => p.UserId != null)
            .GroupBy(p => p.UserId)
            .Select(g => new { UserId = g.Key!, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count);

        var result = new List<UserAdminDTO>();

        foreach (var user in users)
        {
            var dto = await MapToAdminDtoAsync(user);

            dto.PostCount = postCounts.ContainsKey(user.Id)
                ? postCounts[user.Id]
                : 0;

            result.Add(dto);
        }

        return Result<List<UserAdminDTO>>.Ok(result);
    }

    // ── UPDATE USER STATUS (ADMIN) ─────────────────────────
    public async Task<Result<bool>> UpdateUserStatusAsync(string userId, int newStatus)
    {
        if (await GetByIdAsync(userId) == null)
            return Result<bool>.NotFound("Người dùng không tồn tại.");

        if (newStatus < 1 || newStatus > 3)
            return Result<bool>.BadRequest("Trạng thái không hợp lệ.");

        return Result<bool>.Ok(await _userRepository.UpdateStatusAsync(userId, newStatus));
    }

    // ── MAPPER USER ────────────────────────────────────────
    private async Task<UserDto> MapToDtoAsync(User user)
    {
        var roles = await _userManager.GetRolesAsync(user);

        return new UserDto
        {
            Id = user.Id,
            Username = user.FullName ?? user.UserName ?? "",
            Email = user.Email ?? "",
            Phone = user.PhoneNumber,
            AvatarUrl = user.ProfilePicture,
            CoverUrl = user.CoverUrl,
            Bio = user.Bio,
            DateOfBirth = user.DateOfBirth,
            Gender = user.Gender,
            CreatedAt = user.CreatedAt,
            Roles = roles.ToList()
        };
    }

    // ── MAPPER ADMIN ───────────────────────────────────────
    private async Task<UserAdminDTO> MapToAdminDtoAsync(User user)
    {
        var roles = await _userManager.GetRolesAsync(user);

        return new UserAdminDTO
        {
            Id = user.Id,
            Username = user.FullName ?? user.UserName ?? "",
            Email = user.Email ?? "",
            Status = user.Status,
            Phone = user.PhoneNumber,
            AvatarUrl = user.ProfilePicture,
            CoverUrl = user.CoverUrl,
            Bio = user.Bio,
            DateOfBirth = user.DateOfBirth,
            Gender = user.Gender,
            CreatedAt = user.CreatedAt,
            Roles = roles.ToList(),
            PostCount = user.Posts?.Count ?? 0
        };
    }

    public async Task<Result<UserDashboardDTO>> GetUsersCountAsync()
    {
        try
        {
            var data = await _userRepository.GetUsersCountAsync();

            return Result<UserDashboardDTO>.Ok(data);
        }
        catch (Exception ex)
        {
            return Result<UserDashboardDTO>.ServerError($"Lỗi khi lấy dữ liệu cho dashboard admin {ex.Message}");
        }
    }

    public async Task<Result<IEnumerable<UserSearchDto>>> SearchUsersAsync(
        string keyword,
        string? currentUserId)
    {
        if (string.IsNullOrWhiteSpace(keyword))
            return Result<IEnumerable<UserSearchDto>>.Ok(Enumerable.Empty<UserSearchDto>());

        var result = await _userRepository.SearchUsersAsync(keyword, currentUserId);
        return Result<IEnumerable<UserSearchDto>>.Ok(result);
    }




}