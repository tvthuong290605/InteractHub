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

        // ── 1. Lấy danh sách user khớp keyword ───────────────────────────
        var users = await _db.Users
            .Where(u =>
                (currentUserId == null || u.Id != currentUserId) &&
                u.Status == 1 &&
                (
                    (u.FullName != null && EF.Functions.Like(u.FullName.ToLower(), $"%{lower}%")) ||
                    (u.UserName != null && EF.Functions.Like(u.UserName.ToLower(), $"%{lower}%"))
                )
            )
            .Take(20)
            .ToListAsync();

        if (!users.Any())
            return Enumerable.Empty<UserSearchDto>();

        var userIds = users.Select(u => u.Id).ToList();

        // ── 2. Lấy tất cả friendship liên quan đến currentUser ───────────
        //    (chỉ cần khi có currentUserId)
        Dictionary<string, Friendship> friendshipMap = new();

        if (currentUserId != null)
        {
            var friendships = await _db.Friendships
                .Where(f =>
                    (f.RequesterId == currentUserId && userIds.Contains(f.ReceiverId!)) ||
                    (f.ReceiverId == currentUserId && userIds.Contains(f.RequesterId!))
                )
                .ToListAsync();

            foreach (var f in friendships)
            {
                // key = Id của user kia (không phải currentUser)
                var otherId = f.RequesterId == currentUserId ? f.ReceiverId! : f.RequesterId!;
                friendshipMap[otherId] = f;
            }
        }

        // ── 3. Tính MutualFriends: bạn bè chung của currentUser và từng user ──
        //    Bạn bè chung = Accepted với cả hai
        Dictionary<string, int> mutualMap = new();

        if (currentUserId != null)
        {
            // Tập bạn bè của currentUser (Status == 1 = Accepted)
            var myFriendIds = await _db.Friendships
                .Where(f =>
                    f.Status == 1 &&
                    (f.RequesterId == currentUserId || f.ReceiverId == currentUserId)
                )
                .Select(f => f.RequesterId == currentUserId ? f.ReceiverId! : f.RequesterId!)
                .ToListAsync();

            var myFriendSet = myFriendIds.ToHashSet();

            foreach (var targetId in userIds)
            {
                // Tập bạn bè của targetUser
                var targetFriendIds = await _db.Friendships
                    .Where(f =>
                        f.Status == 1 &&
                        (f.RequesterId == targetId || f.ReceiverId == targetId)
                    )
                    .Select(f => f.RequesterId == targetId ? f.ReceiverId! : f.RequesterId!)
                    .ToListAsync();

                // Giao của hai tập
                var mutual = targetFriendIds.Count(id => myFriendSet.Contains(id));
                mutualMap[targetId] = mutual;
            }
        }

        // ── 4. Map sang DTO ───────────────────────────────────────────────
        return users.Select(u =>
        {
            var status = "None";

            if (currentUserId != null && friendshipMap.TryGetValue(u.Id, out var f))
            {
                status = f.Status switch
                {
                    0 when f.RequesterId == currentUserId => "Pending",   // mình đã gửi
                    0 when f.ReceiverId == currentUserId => "Received",  // người kia gửi mình
                    1 => "Friend",
                    2 => "Blocked",
                    _ => "None"
                };
            }

            return new UserSearchDto
            {
                Id = u.Id,
                Username = u.UserName ?? "",
                FullName = u.FullName,
                AvatarUrl = u.ProfilePicture,
                FriendshipStatus = status,
                MutualFriends = mutualMap.TryGetValue(u.Id, out var m) ? m : 0
            };
        });
    }
}


