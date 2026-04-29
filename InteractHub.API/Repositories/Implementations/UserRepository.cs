using InteractHub.API.Data;
using InteractHub.API.Entities;
using Microsoft.EntityFrameworkCore;
using InteractHub.API.Repositories.Interfaces;
using InteractHub.API.DTOs.User;
using static InteractHub.API.DTOs.User.UserDto;


namespace InteractHub.API.Repositories.Implementations;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db)
    {
        _db = db;
    }

    // Tìm user theo email
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _db.Users
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    // Kiểm tra email đã tồn tại chưa
    public async Task<bool> ExistsByEmailAsync(string email)
    {
        return await _db.Users
            .AnyAsync(u => u.Email == email);
    }

    // Thêm user mới vào database
    public async Task<User> CreateAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }
    public async Task<User?> GetByIdAsync(string id)
    {
        return await _db.Users
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    //-------------------admin-------------------
    // Lấy tất cả user (cho admin)
    public async Task<List<User>?> GetAllAsync()
    {
        return await _db.Users
        .ToListAsync();
    }

    // Cập nhật trạng thái user (dùng chung cho user và admin  - user: khóa, mở  - admin: cấm, khóa, mở)
    public async Task<bool> UpdateStatusAsync(string userId, int newStatus)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return false;

        user.Status = newStatus;
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<UserDashboardDTO> GetUsersCountAsync()
    {
        var totalUsers = await _db.Users.CountAsync();

        var growth = await _db.Users
            .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
            .Select(g => new UserGrowthDTO
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Users = g.Count()
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync();

        return new UserDashboardDTO
        {
            TotalUsers = totalUsers,
            Growth = growth
        };
    }














        public async Task<IEnumerable<UserSearchDto>> SearchUsersAsync(string keyword, string? currentUserId)
    {
        var lower = keyword.ToLower();

        return await _db.Users
            .Where(u =>
                (currentUserId == null || u.Id != currentUserId) &&
                u.Status == 1 &&
                (
                    (u.FullName != null && EF.Functions.Like(u.FullName.ToLower(), $"%{lower}%")) ||
                    (u.UserName != null && EF.Functions.Like(u.UserName.ToLower(), $"%{lower}%"))
                )
            )
            .Select(u => new UserSearchDto
            {
                Id = u.Id,
                Username = u.UserName ?? "",
                FullName = u.FullName,
                AvatarUrl = u.ProfilePicture,
                MutualFriends = 0,
                FriendshipStatus = "None"
            })
            .Take(20)
            .ToListAsync();
    }
}


