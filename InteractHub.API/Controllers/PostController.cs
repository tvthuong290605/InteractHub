using System.Security.Claims;
using InteractHub.API.Common.Extensions;
using InteractHub.API.DTOs.Posts;
using InteractHub.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.API.Controllers;

[ApiController]
[Route("api/post")]
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;

    public PostsController(IPostService postService)
    {
        _postService = postService;
    }

    private string? GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    // =====================================================
    // CREATE POST
    // =====================================================

    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> CreatePost(
        [FromForm] PostCreateDto dto)
    {
        var userId = GetUserId();

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _postService
            .CreatePostAsync(userId, dto);

        return result.ToActionResult(this);
    }

    // =====================================================
    // GET TIMELINE
    // =====================================================

    [HttpGet("all")]
    public async Task<IActionResult> GetTimeline()
    {
        var result = await _postService
            .GetTimelineAsync();

        return result.ToActionResult(this);
    }

    // =====================================================
    // GET POSTS BY USER
    // =====================================================

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserPosts(string userId)
    {
        var result = await _postService
            .GetPostsByUserIdAsync(userId);

        return result.ToActionResult(this);
    }

    // =====================================================
    // GET POST BY ID
    // =====================================================

    [HttpGet("{postId}")]
    public async Task<IActionResult> GetPostById(int postId)
    {
        var result = await _postService
            .GetPostByIdAsync(postId);

        return result.ToActionResult(this);
    }

    // =====================================================
    // UPDATE POST
    // =====================================================

    [HttpPut("update/{postId}")]
    [Authorize]
    public async Task<IActionResult> UpdatePost(
        int postId,
        [FromForm] PostUpdateDto dto)
    {
        var userId = GetUserId();

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _postService
            .UpdatePostAsync(postId, userId, dto);

        return result.ToActionResult(this);
    }

    // =====================================================
    // DELETE POST
    // =====================================================

    [HttpDelete("delete/{postId}")]
    [Authorize]
    public async Task<IActionResult> DeletePost(int postId)
    {
        var userId = GetUserId();

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _postService
            .DeletePostAsync(postId, userId);

        return result.ToActionResult(this);
    }

    // =====================================================
    // HOME FEED
    // =====================================================

    [HttpGet("feed")]
    [Authorize]
    public async Task<IActionResult> GetHomeFeed(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _postService
            .GetHomeFeedAsync(userId, page, pageSize);

        return result.ToActionResult(this);
    }

    // =====================================================
    // SHARE POST
    // =====================================================

    [HttpPost("share")]
    [Authorize]
    public async Task<IActionResult> SharePost(
        [FromBody] SharePostRequest request)
    {
        var userId = GetUserId();

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _postService
            .SharePostAsync(userId, request);

        return result.ToActionResult(this);
    }

    // =====================================================
    // SEARCH POSTS
    // =====================================================

    [HttpGet("search")]
    public async Task<IActionResult> SearchPosts(
        [FromQuery] string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
        {
            return Ok(new List<PostResponseDto>());
        }

        var result = await _postService
            .SearchPostsAsync(keyword);

        return result.ToActionResult(this);
    }

    // =====================================================
    // ADMIN
    // =====================================================

    [HttpGet("admin/all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllPostsForAdmin()
    {
        var result = await _postService
            .GetAllPostsForAdminAsync();

        return result.ToActionResult(this);
    }

    [HttpPut("{postId}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(
        int postId,
        [FromBody] UpdatePostStatusRequest request)
    {
        var result = await _postService
            .UpdateStatusPostForAdminAsync(
                postId,
                request.Status
            );

        return result.ToActionResult(this);
    }

    [HttpGet("admin/dashboard")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPostsCountAsync()
    {
        var result = await _postService
            .GetPostsCountAsync();

        return result.ToActionResult(this);
    }
}