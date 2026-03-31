using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface ITaskCommentRepository
{
    Task<TaskComment?> GetByIdAsync(int commentId);
    Task<List<TaskComment>> GetByTaskIdAsync(int taskId);
    Task AddAsync(TaskComment comment);
    Task UpdateAsync(TaskComment comment);
    Task DeleteAsync(int commentId);
}
