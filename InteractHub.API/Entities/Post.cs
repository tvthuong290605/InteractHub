using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.API.Entities;

[Table("Post")]
public class Post
{
    [Key]
    public int Id { get; set; }

    public string? Title { get; set; }

    public string? Content { get; set; }

    public string? UserId { get; set; }           // FK → AspNetUsers

    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Trạng thái bài viết: -1=Deleted, 0=Hidden, 1=Public, 2=Friends, 3=Private
    public int? Status { get; set; } = 1;

    // ====================== SHARE / REPOST ======================
    public int? OriginalPostId { get; set; }      // FK trỏ đến bài viết gốc

    // ====================== NAVIGATION PROPERTIES ======================
    [ForeignKey("UserId")]
    public User? User { get; set; }

    [ForeignKey("OriginalPostId")]
    public Post? OriginalPost { get; set; }       // Bài viết gốc (nếu là bài share)

    public ICollection<Post> SharedPosts { get; set; } = new List<Post>(); // Các bài share từ bài này

    public ICollection<Like>? Likes { get; set; }
    public ICollection<Comment>? Comments { get; set; }
    public ICollection<PostReport>? Reports { get; set; }
    public ICollection<Post_Hashtag>? Post_Hashtags { get; set; }
    public ICollection<PostMedia> PostMedias { get; set; } = new List<PostMedia>();

    // Bonus: đếm số lượt share (tùy chọn)
    public int ShareCount { get; set; } = 0;
}