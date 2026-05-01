namespace InteractHub.API.DTOs.Posts;

public class PostCreateDto
{
    public string? Title { get; set; }
    public string? Content { get; set; }

    // -1=Deleted, 0=Hidden, 1=Public, 2=Friends, 3=Private
    public int? Status { get; set; }

    // ================= SHARE =================
    public int? OriginalPostId { get; set; }

    // Upload media
    public List<IFormFile>? Files { get; set; }
}

public class PostResponseDto
{
    public int Id { get; set; }

    public string? Title { get; set; }
    public string? Content { get; set; }

    public string? UserId { get; set; }

    public int? Status { get; set; }

    public string? AuthorName { get; set; }
    public string? AuthorAvatar { get; set; }

    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // ================= SHARE =================
    public int? OriginalPostId { get; set; }

    // Nếu đây là bài share thì chứa bài gốc
    public SharedPostDto? OriginalPost { get; set; }

    public int ShareCount { get; set; }

    // ================= MEDIA =================
    public List<string> MediaUrls { get; set; } = new();

    // ================= COUNTS =================
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
}



public class PostUpdateDto
{
    public string? Title { get; set; }

    public string? Content { get; set; }

    public int? Status { get; set; }

    // URL media cần xóa
    public List<string>? DeleteMediaUrls { get; set; }

    // File upload thêm
    public List<IFormFile>? NewFiles { get; set; }
}

public class PostReportRequestDTO
{
    public int PostId { get; set; }

    public string Reason { get; set; } = string.Empty;
}

public class PostReportResponseDTO
{
    public int Id { get; set; }

    public int PostId { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string UserName { get; set; } = string.Empty;

    public string Reason { get; set; } = string.Empty;

    public int Status { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class PagedPostResponseDto
{
    public List<PostResponseDto> Posts { get; set; } = new();

    public int TotalCount { get; set; }

    public bool HasMore { get; set; }
}

// ================= SEARCH =================
public class PostSearchResponseDto
{
    public int Id { get; set; }

    public string? Content { get; set; }

    public string? Title { get; set; }

    public string AuthorName { get; set; } = "";

    public string AuthorAvatar { get; set; } = "";

    public string AuthorId { get; set; } = "";

    public DateTime CreatedAt { get; set; }

    public int LikeCount { get; set; }

    public int CommentCount { get; set; }

    public int ShareCount { get; set; }

    public List<string> MediaUrls { get; set; } = new();

    // SHARE
    public int? OriginalPostId { get; set; }

    public SharedPostDto? OriginalPost { get; set; }
}

// ================= SHARE REQUEST =================
public class SharePostRequest
{
    // Caption khi share
    public string? Content { get; set; }

    // ID bài gốc
    public int OriginalPostId { get; set; }

    // -1=Deleted, 0=Hidden, 1=Public, 2=Friends, 3=Private
    public int? Status { get; set; } = 1;
}
public class SharedPostDto
{
    public int Id { get; set; }

    public string? Title { get; set; }

    public string? Content { get; set; }

    public string? UserId { get; set; }

    public int? Status { get; set; }

    public string? AuthorName { get; set; }

    public string? AuthorAvatar { get; set; }

    public DateTime? CreatedAt { get; set; }

    public List<string> MediaUrls { get; set; } = new();

    // SHARE NESTED
    public int? OriginalPostId { get; set; }

    public SharedPostDto? OriginalPost { get; set; }
}