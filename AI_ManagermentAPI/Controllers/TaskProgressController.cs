using BusinessObject.DTOs;
using Microsoft.AspNetCore.Mvc;
using Repository.I_Repository;
using Services.I_Services;

namespace AI_ManagermentAPI.Controllers;

[Route("api/task-progress")]
[ApiController]
public class TaskProgressController : ControllerBase
{
    private readonly ITaskProgressService _taskProgressService;
    private readonly ITaskLogRepository _taskLogRepository;
    private readonly ILogger<TaskProgressController> _logger;

    public TaskProgressController(
        ITaskProgressService taskProgressService,
        ITaskLogRepository taskLogRepository,
        ILogger<TaskProgressController> logger)
    {
        _taskProgressService = taskProgressService;
        _taskLogRepository = taskLogRepository;
        _logger = logger;
    }

    /// <summary>
    /// Update task progress with automatic risk calculation
    /// </summary>
    [HttpPut("{taskId}")]
    public async Task<IActionResult> UpdateProgress(int taskId, [FromBody] UpdateProgressRequest request)
    {
        try
        {
            await _taskProgressService.UpdateProgressAsync(taskId, request.Progress, request.Note, request.Risk);
            
            // Trigger AI to classify and analyze project risk in the background
            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = HttpContext.RequestServices.CreateScope();
                    var aiAnalysisService = scope.ServiceProvider.GetRequiredService<IAiAnalysisService>();
                    await aiAnalysisService.ClassifyAndAnalyzeTaskAsync(taskId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Background AI analysis failed for TaskId: {TaskId}", taskId);
                }
            });

            return Ok(new { message = "Progress updated successfully. AI analysis is running in background." });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Task not found: {TaskId}", taskId);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating progress for TaskId: {TaskId}", taskId);
            return StatusCode(500, new { message = "An error occurred while updating task progress." });
        }
    }

    /// <summary>
    /// Get progress history logs for a task
    /// </summary>
    [HttpGet("{taskId}/logs")]
    public async Task<ActionResult<List<TaskLogResponse>>> GetProgressLogs(int taskId)
    {
        try
        {
            var logs = await _taskLogRepository.GetByTaskIdAsync(taskId);
            
            var response = logs.Select(l => new TaskLogResponse
            {
                LogId = l.LogId,
                TaskId = l.TaskId,
                Progress = l.Progress,
                Note = l.Note,
                Risk = l.Risk,
                CreatedAt = l.CreatedAt
            }).OrderByDescending(l => l.CreatedAt).ToList();

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving progress logs for TaskId: {TaskId}", taskId);
            return StatusCode(500, new { message = "An error occurred while retrieving progress logs." });
        }
    }
}
