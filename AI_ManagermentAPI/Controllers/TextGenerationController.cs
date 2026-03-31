using BusinessObject.DTOs;
using Microsoft.AspNetCore.Mvc;
using Services.I_Services;

namespace AI_ManagermentAPI.Controllers;

[Route("api/text-generation")]
[ApiController]
public class TextGenerationController : ControllerBase
{
    private readonly ITextGenerationService _textGenerationService;
    private readonly ILogger<TextGenerationController> _logger;

    public TextGenerationController(
        ITextGenerationService textGenerationService,
        ILogger<TextGenerationController> logger)
    {
        _textGenerationService = textGenerationService;
        _logger = logger;
    }

    /// <summary>
    /// Generate free-form text using AI
    /// </summary>
    [HttpPost("generate")]
    public async Task<ActionResult<GenerateTextResponse>> GenerateText([FromBody] GenerateTextRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
                return BadRequest("Prompt is required");

            var result = await _textGenerationService.GenerateTextAsync(request.Prompt, request.MaxTokens > 0 ? request.MaxTokens : 200);
            return Ok(new GenerateTextResponse
            {
                GeneratedText = result,
                Model = "google/flan-t5-base"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating text");
            return StatusCode(500, new { message = "An error occurred during text generation." });
        }
    }

    /// <summary>
    /// Ask AI to explain assignment reasoning
    /// </summary>
    [HttpPost("assignment-reason")]
    public async Task<ActionResult<object>> GenerateAssignmentReason([FromBody] AssignmentReasonRequest request)
    {
        try
        {
            var reason = await _textGenerationService.GenerateAssignmentReasonAsync(request.TaskDescription, request.UserProfile);
            return Ok(new { reason = reason });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating assignment reason");
            return StatusCode(500, new { message = "An error occurred." });
        }
    }

    /// <summary>
    /// Request workload distribution suggestions for a project
    /// </summary>
    [HttpPost("workload/{projectId}")]
    public async Task<ActionResult<WorkloadSuggestionResponse>> SuggestWorkload(int projectId)
    {
        try
        {
            var response = await _textGenerationService.SuggestWorkloadAsync(projectId);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error suggesting workload for project {ProjectId}", projectId);
            return StatusCode(500, new { message = "An error occurred." });
        }
    }
}
