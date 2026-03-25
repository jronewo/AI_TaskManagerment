using BusinessObject.Models;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface ITaskEmbeddingRepository
{
    Task UpsertAsync(TaskEmbedding embedding);
    Task<TaskEmbedding?> GetByTaskIdAsync(int taskId);
}
