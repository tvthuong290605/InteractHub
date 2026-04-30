using InteractHub.API.Entities;
using InteractHub.API.DTOs.User;
using static InteractHub.API.DTOs.User.UserDto;


namespace InteractHub.API.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<bool> ExistsByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task<User?> GetByIdAsync(string id);
    Task<List<User>?> GetAllAsync();
    Task<bool> UpdateStatusAsync(string userId, int newStatus);
    Task<UserDashboardDTO> GetUsersCountAsync();

Task<IEnumerable<UserSearchDto>> SearchUsersAsync(string keyword, string? currentUserId);
}