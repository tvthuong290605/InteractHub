using System;

namespace InteractHub.API.DTOs.User;

public class UserAdminDTO
{
    public string Id { get; set; } = "";

    public string Username { get; set; } = "";

    public int Status { get; set; } // 1: active, 2: banned, 3: deactivated

    public string Email { get; set; } = "";
    public string? Phone { get; set; } = "";
    public string? CoverUrl { get; set; }

    public string? AvatarUrl { get; set; }

    public string? Bio { get; set; }

    public DateTime? DateOfBirth { get; set; }
    public DateTime? CreatedAt { get; set; }

    public string? Gender { get; set; }

    public List<string> Roles { get; set; } = new();

    public int PostCount { get; set; }    // Số lượng bài viết của user

}


// dùng cho vẽ biểu đồ admin
public class UserGrowthDTO
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int Users { get; set; }
}

public class UserDashboardDTO
{
    public int TotalUsers { get; set; }
    public List<UserGrowthDTO> Growth { get; set; } = new();
}
