using InteractHub.API.Common.Responses;
using InteractHub.API.DTOs.Hashtag;
using InteractHub.API.DTOs.PostHashtag;


namespace InteractHub.API.Services.Interfaces;

public interface IHashtagService
{
    Task<Result<IEnumerable<HashtagResponseDto>>> GetAllAsync();
    Task<Result<HashtagResponseDto>> GetByTagAsync(string tag);
    Task<HashtagResponseDto> CreateIfNotExistsAsync(string tag);
    Task<List<HashtagResponseDto>> ExtractHashtagsAsync(string content);

    Task<Result<int>> GetHashtagsCountAsync();
    Task<Result<List<HashtagUsageDTO>>> GetHashtagUsageAsync();

}