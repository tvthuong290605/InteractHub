namespace InteractHub.API.DTOs.PostHashtag;

public class PostHashtagDto
{
    public int PostId { get; set; }
    public int HashtagId { get; set; }
}

public class PostHashtagResponseDto
{
    public int HashtagId { get; set; }
    public string Tag { get; set; } = null!;
}

public class HashtagUsageDTO
{
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
}