using BusinessObject.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.I_Services;

public interface ITaskService
{
    Task<List<TaskDetailDto>> GetTasksByProjectIdAsync(int projectId);
    Task<TaskDetailDto?> GetTaskByIdAsync(int taskId);
    Task<TaskDetailDto> CreateTaskAsync(CreateTaskDto request, int currentUserId);
    Task<bool> UpdateTaskAsync(int taskId, UpdateTaskDto request, int currentUserId);
    Task<bool> DeleteTaskAsync(int taskId, int currentUserId);
    
    // Member only progress
    Task<bool> UpdateTaskProgressAsync(int taskId, UpdateProgressDto request, int currentUserId);

    // Dependencies
    Task<bool> AddDependencyAsync(int taskId, AddDependencyDto request, int currentUserId);
    Task<bool> RemoveDependencyAsync(int taskId, int dependencyId, int currentUserId);
    Task<DependencyGraphDto> GetDependencyGraphAsync(int projectId);

    // AI Time Estimation
    Task<TaskDetailDto?> SuggestEstimatedTimeAsync(int taskId, int currentUserId);

    // My tasks
    Task<List<TaskDetailDto>> GetTasksByAssigneeAsync(int userId);
}
