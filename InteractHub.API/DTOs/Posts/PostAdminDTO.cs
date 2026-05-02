using System;
using LikeAdminDTO = InteractHub.API.DTOs.Like.LikeAdminDTO;
using CommentAdminDTO = InteractHub.API.DTOs.Comments.CommentAdminDTO;

namespace InteractHub.API.DTOs.Posts;

public class PostAdminDTO
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
    public string? UserId { get; set; }
    public int? Status { get; set; } 

    public string? AuthorName { get; set; }
    public string? AuthorAvatar { get; set; }
    public DateTime? CreatedAt { get; set; }

    public int LikeCount { get; set; }
    public List<LikeAdminDTO> UserLike { get; set; } = new(); // Danh sách người like kèm loại reaction

    public int CommentCount { get; set; }
    public List<CommentAdminDTO> Comments { get; set; } = new(); // Danh sách bình luận kèm theo bài viết

    
    // Danh sách URL ảnh/video để hiển thị
    public List<string> MediaUrls { get; set; } = new();
    public PostAdminDTO? SharedPost { get; set; }
}

public class UpdatePostStatusRequest
{
    public int Status { get; set; }
}


public class PostActivityStatDTO
{
    public string Month { get; set; } = "";
    public int Posts { get; set; }
    public int Comments { get; set; }
    public int Likes { get; set; }
}

public class PostDashboardDTO
{
    public int TotalPosts { get; set; }
    public List<PostActivityStatDTO> Activity { get; set; } = new();
}

public class PostReportDTO
{
    public string? Reason {get; set;}
    public int Count {get; set;}
}

public class PostReportDashboardDTO
{
    public int TotalReport {get; set;}
    public List<PostReportDTO> PostReports {get; set;} = new();
}

public class PostReportAdminDTO
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName {get; set;} = string .Empty;
    public string Type {get; set;} = string.Empty;
    public string? Content { get; set; } 
    public int Status { get; set; }
    public DateTime? CreatedAt {get; set;}

    public DateTime? ResolvedAt {get; set;}

    public string? AdminNote { get; set; }

    public PostAdminDTO Post{get; set;} = new PostAdminDTO();
    public PostAdminDTO? SharedPost { get; set; }

}

public class UpdateReportRequest
{
    public string? AdminNote { get; set; }
    public int status {get; set;}
    public string? userNameAuthor {get; set;}
}