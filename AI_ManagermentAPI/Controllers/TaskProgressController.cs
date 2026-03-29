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

    [HttpPut("{taskId}")]
    public async Task<IActionResult> UpdateProgress(int taskId, [FromBody] UpdateProgressRequest request)
    {
        try
        {
            await _taskProgressService.UpdateProgressAsync(taskId, request.Progress, request.Note);
            return Ok(new { message = "Progress updated successfully." });
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
