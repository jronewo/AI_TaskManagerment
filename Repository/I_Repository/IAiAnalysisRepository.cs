using BusinessObject.Models;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface IAiAnalysisRepository
{
    Task AddAsync(AiAnalysis analysis);
    Task<List<AiAnalysis>> GetByTaskIdAsync(int taskId);
    Task<AiAnalysis?> GetByTypeAsync(int taskId, string analysisType);
}
