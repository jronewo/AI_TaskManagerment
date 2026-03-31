using BusinessObject.DTOs;
using Microsoft.AspNetCore.Mvc;
using Services.I_Services;
using System.Threading.Tasks;

namespace AI_ManagermentAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class EvaluationsController : ControllerBase
{
    private readonly IEvaluationService _evaluationService;

    public EvaluationsController(IEvaluationService evaluationService)
    {
        _evaluationService = evaluationService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var e = await _evaluationService.GetEvaluationByIdAsync(id);
        if (e == null) return NotFound();
        return Ok(e);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserEvaluations(int userId)
    {
        var evaluations = await _evaluationService.GetUserEvaluationsAsync(userId);
        return Ok(evaluations);
    }

    [HttpGet("leader/{leaderId}")]
    public async Task<IActionResult> GetLeaderEvaluations(int leaderId)
    {
        var evaluations = await _evaluationService.GetLeaderEvaluationsAsync(leaderId);
        return Ok(evaluations);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEvaluationDto request)
    {
        var e = await _evaluationService.CreateEvaluationAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = e.EvaluationId }, e);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _evaluationService.DeleteEvaluationAsync(id);
        return NoContent();
    }
}
