using Microsoft.AspNetCore.Mvc;
using Services.I_Services;

namespace AI_ManagermentAPI.Controllers;

[Route("api/health")]
[ApiController]
public class HealthCheckController : ControllerBase
{
    private readonly IHuggingFaceService _huggingFaceService;

    public HealthCheckController(IHuggingFaceService huggingFaceService)
    {
        _huggingFaceService = huggingFaceService;
    }

    /// <summary>
    /// Test HuggingFace API key connectivity using Sentence Similarity
    /// </summary>
    [HttpGet("huggingface")]
    public async Task<IActionResult> TestHuggingFace()
    {
        try
        {
            var scores = await _huggingFaceService.ComputeSimilarityBatchAsync(
                "A developer skilled in C# and .NET",
                new List<string>
                {
                    "A programmer experienced with C# backend development",
                    "A designer who creates UI mockups"
                });

            return Ok(new
            {
                status = "✅ SUCCESS",
                message = "HuggingFace API key is valid and working!",
                testResults = new
                {
                    sourceSentence = "A developer skilled in C# and .NET",
                    comparisons = new[]
                    {
                        new { sentence = "A programmer experienced with C# backend development", similarityScore = scores[0] },
                        new { sentence = "A designer who creates UI mockups", similarityScore = scores[1] }
                    }
                }
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("ApiKey"))
        {
            return BadRequest(new
            {
                status = "❌ NOT CONFIGURED",
                message = "HuggingFace API key is not set in appsettings.json.",
                detail = ex.Message
            });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(502, new
            {
                status = "❌ FAILED",
                message = "HuggingFace API call failed. Key might be invalid or expired.",
                detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = "❌ ERROR",
                message = ex.Message
            });
        }
    }
}
