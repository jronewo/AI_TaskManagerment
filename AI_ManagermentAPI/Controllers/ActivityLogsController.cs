using Microsoft.AspNetCore.Mvc;
using Services.I_Services;
using System.Threading.Tasks;

namespace AI_ManagermentAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ActivityLogsController : ControllerBase
{
    private readonly IActivityLogService _logService;

    public ActivityLogsController(IActivityLogService logService)
    {
        _logService = logService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int limit = 50)
    {
        var logs = await _logService.GetAllActivitiesAsync(limit);
        return Ok(logs);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserActivities(int userId)
    {
        var logs = await _logService.GetUserActivitiesAsync(userId);
        return Ok(logs);
    }

    [HttpGet("entity/{entityType}/{entityId}")]
    public async Task<IActionResult> GetEntityActivities(string entityType, int entityId)
    {
        var logs = await _logService.GetEntityActivitiesAsync(entityType, entityId);
        return Ok(logs);
    }

    [HttpGet("project/{projectId}")]
    public async Task<IActionResult> GetProjectActivities(int projectId, [FromQuery] int limit = 50)
    {
        var logs = await _logService.GetProjectActivitiesAsync(projectId, limit);
        return Ok(logs);
    }
}
