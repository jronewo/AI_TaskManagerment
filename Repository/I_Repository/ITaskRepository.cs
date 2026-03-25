using BusinessObject.Models;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface ITaskRepository
{
    Task<BusinessObject.Models.Task?> GetByIdAsync(int taskId);
    Task<List<BusinessObject.Models.Task>> GetByProjectIdAsync(int projectId);
    Task<List<TaskRequiredSkill>> GetTaskRequiredSkillsAsync(int taskId);
    Task<List<TaskAssignee>> GetTaskAssigneesAsync(int taskId);
    Task AddTaskAssigneeAsync(TaskAssignee assignee);
    Task UpdateProgressAsync(int taskId, int progress, string riskLevel);
}
