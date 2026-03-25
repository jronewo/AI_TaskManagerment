using BusinessObject.Models;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface IAiRecommendationRepository
{
    Task AddAsync(AiRecommendation recommendation);
    Task AddRangeAsync(List<AiRecommendation> recommendations);
    Task<List<AiRecommendation>> GetByTaskIdAsync(int taskId);
    Task DeleteByTaskIdAsync(int taskId);
}
