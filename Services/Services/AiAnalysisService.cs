using BusinessObject.Models;
using Microsoft.Extensions.Logging;
using Repository.I_Repository;
using Services.I_Services;
using Task = System.Threading.Tasks.Task;

namespace Services.Services;

public class AiAnalysisService : IAiAnalysisService
{
    private readonly ITaskRepository _taskRepository;
    private readonly ITaskLogRepository _taskLogRepository;
    private readonly IAiAnalysisRepository _aiAnalysisRepository;
    private readonly ILogger<AiAnalysisService> _logger;

    public AiAnalysisService(
        ITaskRepository taskRepository,
        ITaskLogRepository taskLogRepository,
        IAiAnalysisRepository aiAnalysisRepository,
        ILogger<AiAnalysisService> logger)
    {
        _taskRepository = taskRepository;
        _taskLogRepository = taskLogRepository;
        _aiAnalysisRepository = aiAnalysisRepository;
        _logger = logger;
    }

    public async Task AnalyzeTaskRiskAsync(int taskId)
    {
        _logger.LogInformation("Analyzing risk for TaskId={TaskId}", taskId);
        
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) return;

        var logs = await _taskLogRepository.GetByTaskIdAsync(taskId);
        
        string content = $"Risk Analysis based on {logs.Count} logs: Current progress is {task.Progress}%. ";
        if (task.RiskLevel == "HIGH")
        {
            content += "Task is at high risk of delay. Recommend adding resources.";
        }
        else if (task.RiskLevel == "MEDIUM")
        {
            content += "Task has medium risk of delay. Monitor closely.";
        }
        else
        {
            content += "Task seems to be on track.";
        }

        var analysis = new AiAnalysis
        {
            TaskId = taskId,
            AnalysisType = "risk",
            Content = content
        };

        await _aiAnalysisRepository.AddAsync(analysis);
    }

    public async Task GenerateTaskSummaryAsync(int taskId)
    {
        _logger.LogInformation("Generating summary for TaskId={TaskId}", taskId);

        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) return;

        var assignees = await _taskRepository.GetTaskAssigneesAsync(taskId);
        
        string content = $"Task '{task.Title}' summary: Priority {task.Priority}, assigned to {assignees.Count} users. Overall progress: {task.Progress}%.";

        var analysis = new AiAnalysis
        {
            TaskId = taskId,
            AnalysisType = "summary",
            Content = content
        };

        await _aiAnalysisRepository.AddAsync(analysis);
    }
}
