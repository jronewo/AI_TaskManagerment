using BusinessObject.Models;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface ITaskRepository
{
    Task<BusinessObject.Models.Task?> GetByIdAsync(int taskId);
    Task<List<BusinessObject.Models.Task>> GetByProjectIdAsync(int projectId);
    Task<List<TaskAssignee>> GetTaskAssigneesAsync(int taskId);
    Task ClearTaskAssigneesAsync(int taskId);
    Task AddTaskAssigneeAsync(TaskAssignee assignee);
    Task UpdateProgressAsync(int taskId, int progress, string riskLevel);
    Task<int> GetCompletedTaskCountByProjectAsync(int projectId);
    Task<int> GetTotalTaskCountByProjectAsync(int projectId);

    Task<BusinessObject.Models.Task> AddAsync(BusinessObject.Models.Task task);
    Task UpdateAsync(BusinessObject.Models.Task task);
    Task DeleteAsync(int taskId);
    Task<List<BusinessObject.Models.Task>> GetByProjectIdWithDetailsAsync(int projectId);
}
