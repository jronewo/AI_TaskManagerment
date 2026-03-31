using BusinessObject.DTOs;
using Microsoft.AspNetCore.Mvc;
using Services.I_Services;

namespace AI_ManagermentAPI.Controllers;

[Route("api/classification")]
[ApiController]
public class ClassificationController : ControllerBase
{
    private readonly IClassificationService _classificationService;
    private readonly ILogger<ClassificationController> _logger;

    public ClassificationController(
        IClassificationService classificationService,
        ILogger<ClassificationController> logger)
    {
        _classificationService = classificationService;
        _logger = logger;
    }

    /// <summary>
    /// Classify a task by its ID (extracts type and difficulty)
    /// </summary>
    [HttpPost("{taskId}")]
    public async Task<ActionResult<TaskClassificationResponse>> ClassifyTask(int taskId)
    {
        try
        {
            var result = await _classificationService.ClassifyTaskAsync(taskId);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error classifying task {TaskId}", taskId);
            return StatusCode(500, new { message = "An error occurred during classification." });
        }
    }

    /// <summary>
    /// Classify free text
    /// </summary>
    [HttpPost("text")]
    public async Task<ActionResult<object>> ClassifyText([FromBody] ClassifyTextRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Text))
                return BadRequest("Text is required");

            var typeLabels = new[] { "frontend", "backend", "devops" };
            var typeResult = await _classificationService.ClassifyZeroShotAsync(request.Text, typeLabels);
            
            var difficultyLabels = new[] { "easy", "medium", "hard" };
            var difficultyResult = await _classificationService.ClassifyZeroShotAsync(request.Text, difficultyLabels);

            return Ok(new
            {
                taskTypeScores = typeResult,
                difficultyScores = difficultyResult
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error classifying text");
            return StatusCode(500, new { message = "An error occurred during classification." });
        }
    }
}
