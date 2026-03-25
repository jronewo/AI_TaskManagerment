using BusinessObject.Models;
using Microsoft.Extensions.Logging;
using Repository.I_Repository;
using Services.I_Services;
using Task = System.Threading.Tasks.Task;

namespace Services.Services;

public class TaskProgressService : ITaskProgressService
{
    private readonly ITaskRepository _taskRepository;
    private readonly ITaskLogRepository _taskLogRepository;
    private readonly ILogger<TaskProgressService> _logger;

    public TaskProgressService(
        ITaskRepository taskRepository,
        ITaskLogRepository taskLogRepository,
        ILogger<TaskProgressService> logger)
    {
        _taskRepository = taskRepository;
        _taskLogRepository = taskLogRepository;
        _logger = logger;
    }

    public async Task UpdateProgressAsync(int taskId, int progress, string? note)
    {
        _logger.LogInformation("Updating progress for TaskId={TaskId} to {Progress}%", taskId, progress);

        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null)
        {
            throw new ArgumentException($"Task with ID {taskId} not found");
        }

        string riskLevel = "LOW";
        if (task.Deadline.HasValue)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var daysUntilDeadline = task.Deadline.Value.DayNumber - today.DayNumber;

            if (daysUntilDeadline < 0 && progress < 100)
            {
                riskLevel = "HIGH"; // Overdue
            }
            else if (daysUntilDeadline <= 2 && progress < 80)
            {
                riskLevel = "HIGH";
            }
            else if (daysUntilDeadline <= 5 && progress < 50)
            {
                riskLevel = "MEDIUM";
            }
        }

        // Save log
        var log = new TaskLog
        {
            TaskId = taskId,
            Progress = progress,
            Note = note
        };
        await _taskLogRepository.AddAsync(log);

        // Update task
        await _taskRepository.UpdateProgressAsync(taskId, progress, riskLevel);
    }
}
