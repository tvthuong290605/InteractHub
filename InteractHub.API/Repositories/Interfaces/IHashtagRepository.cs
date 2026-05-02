using InteractHub.API.Entities;
using InteractHub.API.DTOs.PostHashtag;


namespace InteractHub.API.Repositories.Interfaces;

public interface IHashtagRepository
{
    Task<IEnumerable<Hashtag>> GetAllAsync();
    Task<Hashtag?> GetByIdAsync(int id);
    Task<Hashtag?> GetByTagAsync(string tag);

    Task AddAsync(Hashtag hashtag);
    void Update(Hashtag hashtag);
    void Delete(Hashtag hashtag);

    Task<bool> SaveChangesAsync();

    // lấy số lượng hashtag
    Task<int> GetHashtagsCountAsync();

    Task<List<HashtagUsageDTO>> GetHashtagUsageAsync();

}