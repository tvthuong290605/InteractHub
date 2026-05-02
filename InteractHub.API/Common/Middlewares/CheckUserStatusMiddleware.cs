using System.Security.Claims;
using InteractHub.API.Data;
using Microsoft.EntityFrameworkCore;

public class CheckUserStatusMiddleware
{
    private readonly RequestDelegate _next;

    public CheckUserStatusMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context, AppDbContext db)
    {
        Console.WriteLine("👉 Middleware RUNNING");

        Console.WriteLine("Authenticated: " + context.User.Identity?.IsAuthenticated);
        // Chỉ check khi đã đăng nhập
        var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user != null && user.Status == 3)
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "Tài khoản đã bị khóa"
                });
                return;
            }
        }

        await _next(context);
    }
}