using BusinessObject.Models;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface ITaskLogRepository
{
    Task AddAsync(TaskLog log);
    Task<List<TaskLog>> GetByTaskIdAsync(int taskId);
}
