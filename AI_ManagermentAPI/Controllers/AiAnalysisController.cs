using BusinessObject.DTOs;
using Microsoft.AspNetCore.Mvc;
using Repository.I_Repository;
using Services.I_Services;

namespace AI_ManagermentAPI.Controllers;

[Route("api/ai-analysis")]
[ApiController]
public class AiAnalysisController : ControllerBase
{
    private readonly IAiAnalysisService _aiAnalysisService;
    private readonly IAiAnalysisRepository _aiAnalysisRepository;
    private readonly ILogger<AiAnalysisController> _logger;

    public AiAnalysisController(
        IAiAnalysisService aiAnalysisService,
        IAiAnalysisRepository aiAnalysisRepository,
        ILogger<AiAnalysisController> logger)
    {
        _aiAnalysisService = aiAnalysisService;
        _aiAnalysisRepository = aiAnalysisRepository;
        _logger = logger;
    }

    /// <summary>
    /// Run AI risk analysis on a task
    /// </summary>
    [HttpPost("{taskId}/risk")]
    public async Task<IActionResult> RunRiskAnalysis(int taskId)
    {
        try
        {
            await _aiAnalysisService.AnalyzeTaskRiskAsync(taskId);
            return Ok(new { message = "Risk analysis generated successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error running risk analysis for TaskId: {TaskId}", taskId);
            return StatusCode(500, new { message = "An error occurred during risk analysis." });
        }
    }

    /// <summary>
    /// Run AI risk analysis on all active tasks in a project
    /// </summary>
    [HttpPost("project/{projectId}/analyze-all")]
    public async Task<IActionResult> RunProjectRiskAnalysis(int projectId)
    {
        try
        {
            var summary = await _aiAnalysisService.AnalyzeProjectRisksAsync(projectId);
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error running project-wide risk analysis for ProjectId: {ProjectId}", projectId);
            return StatusCode(500, new { message = "An error occurred during project risk analysis." });
        }
    }

    /// <summary>
    /// Generate an AI summary for a task
    /// </summary>
    [HttpPost("{taskId}/summary")]
    public async Task<IActionResult> GenerateSummary(int taskId)
    {
        try
        {
            await _aiAnalysisService.GenerateTaskSummaryAsync(taskId);
            return Ok(new { message = "Task summary generated successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating summary for TaskId: {TaskId}", taskId);
            return StatusCode(500, new { message = "An error occurred while generating task summary." });
        }
    }

    /// <summary>
    /// Predict task type and difficulty using AI Classification
    /// </summary>
    [HttpPost("{taskId}/classify")]
    public async Task<IActionResult> ClassifyTask(int taskId)
    {
        try
        {
            await _aiAnalysisService.ClassifyAndAnalyzeTaskAsync(taskId);
            return Ok(new { message = "Task classification and analysis completed successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error classifying task for TaskId: {TaskId}", taskId);
            return StatusCode(500, new { message = "An error occurred during task classification." });
        }
    }

    /// <summary>
    /// Get AI-driven task distribution (splitting) suggestions for a project
    /// </summary>
    [HttpGet("project/{projectId}/workload")]
    public async Task<ActionResult<WorkloadSuggestionResponse>> GetWorkloadSuggestions(int projectId, [FromServices] ITextGenerationService textGenerationService)
    {
        try
        {
            var suggestions = await textGenerationService.SuggestWorkloadAsync(projectId);
            return Ok(suggestions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating workload suggestions for ProjectId: {ProjectId}", projectId);
            return StatusCode(500, new { message = "An error occurred while generating workload suggestions." });
        }
    }

    /// <summary>
    /// Get all AI analyses (risk, summary) for a task
    /// </summary>
    [HttpGet("{taskId}")]
    public async Task<ActionResult<List<AiAnalysisResponse>>> GetAnalysis(int taskId)
    {
        try
        {
            var analyses = await _aiAnalysisRepository.GetByTaskIdAsync(taskId);
            
            var response = analyses.Select(a => new AiAnalysisResponse
            {
                Id = a.Id,
                TaskId = a.TaskId,
                AnalysisType = a.AnalysisType,
                Content = a.Content,
                CreatedAt = a.CreatedAt
            }).ToList();

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving analyses for TaskId: {TaskId}", taskId);
            return StatusCode(500, new { message = "An error occurred while retrieving Task analyses." });
        }
    }
}
