using BusinessObject.DTOs;
using Microsoft.AspNetCore.Mvc;
using Services.I_Services;

namespace AI_ManagermentAPI.Controllers;

[Route("api/task-assignment")]
[ApiController]
public class TaskAssignmentController : ControllerBase
{
    private readonly ITaskAssignmentService _taskAssignmentService;
    private readonly ILogger<TaskAssignmentController> _logger;

    public TaskAssignmentController(ITaskAssignmentService taskAssignmentService, ILogger<TaskAssignmentController> logger)
    {
        _taskAssignmentService = taskAssignmentService;
        _logger = logger;
    }

    /// <summary>
    /// Generate AI recommendations for assigning a task
    /// </summary>
    [HttpPost("recommend")]
    public async Task<ActionResult<TaskAssignmentResponse>> GetRecommendations([FromBody] TaskAssignmentRequest request)
    {
        try
        {
            var response = await _taskAssignmentService.GetRecommendationsAsync(request.TaskId, request.ProjectId);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Task not found: {TaskId}", request.TaskId);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendations for TaskId: {TaskId}", request.TaskId);
            return StatusCode(500, new { message = "An error occurred while generating AI recommendations." });
        }
    }

    /// <summary>
    /// Accept an AI recommendation and assign the user to the task
    /// </summary>
    [HttpPost("accept")]
    public async Task<IActionResult> AcceptRecommendation([FromBody] AcceptRecommendationRequest request)
    {
        try
        {
            var success = await _taskAssignmentService.AcceptRecommendationAsync(request.TaskId, request.UserId);
            if (!success)
            {
                return Conflict(new { message = "User is already assigned to this task." });
            }

            return Ok(new { message = "Successfully assigned user to the task." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error accepting recommendation for TaskId: {TaskId}, UserId: {UserId}", request.TaskId, request.UserId);
            return StatusCode(500, new { message = "An error occurred while accepting the recommendation." });
        }
    }
}
