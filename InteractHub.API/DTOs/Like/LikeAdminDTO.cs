using System;

namespace InteractHub.API.DTOs.Like;

// DTO này đại diện cho danh sách người like 1 bài viết
public class LikeAdminDTO
{

    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public string Type { get; set; } = null!; // like, love, haha...
    public string UserName{ get; set; } = null!;
    public string? Avatar { get; set; }
}
