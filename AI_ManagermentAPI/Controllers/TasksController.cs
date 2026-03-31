using BusinessObject.DTOs;
using Microsoft.AspNetCore.Mvc;
using Services.I_Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace AI_ManagermentAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    private int GetCurrentUserId()
    {
        var userIdHeader = Request.Headers["X-User-Id"].FirstOrDefault();
        if (userIdHeader != null && int.TryParse(userIdHeader, out var id))
        {
            return id;
        }
        return 0;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyTasks()
    {
        int currentUserId = GetCurrentUserId();
        if (currentUserId == 0)
            return Unauthorized(new { message = "Chưa đăng nhập." });
        var tasks = await _taskService.GetTasksByAssigneeAsync(currentUserId);
        return Ok(tasks);
    }

    [HttpGet]
    public async Task<IActionResult> GetByProject([FromQuery] int projectId)
    {
        if (projectId <= 0) return BadRequest("projectId is required.");
        var tasks = await _taskService.GetTasksByProjectIdAsync(projectId);
        return Ok(tasks);
    }

    [HttpGet("template-csv")]
    public IActionResult DownloadTemplateCsv()
    {
        const string template = "Title,Description,Priority,EstimatedTime,Deadline\nTask mau 1,Mo ta task mau,High,4,2023-12-31\nTask mau 2,Mo ta khac,Medium,8,";
        var bytes = System.Text.Encoding.UTF8.GetBytes(template);
        // Include BOM for Excel to recognize UTF-8
        var bom = new byte[] { 0xEF, 0xBB, 0xBF };
        var result = new byte[bom.Length + bytes.Length];
        Buffer.BlockCopy(bom, 0, result, 0, bom.Length);
        Buffer.BlockCopy(bytes, 0, result, bom.Length, bytes.Length);

        return File(result, "text/csv", "Template.csv");
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await _taskService.GetTaskByIdAsync(id);
        if (task == null) return NotFound();
        return Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskDto request)
    {
        try
        {
            int currentUserId = GetCurrentUserId();
            if (currentUserId == 0)
                return Unauthorized(new { message = "Chưa đăng nhập hoặc User ID không hợp lệ." });
            var task = await _taskService.CreateTaskAsync(request, currentUserId);
            return CreatedAtAction(nameof(GetById), new { id = task.TaskId }, task);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            var msg = ex.Message;
            if (ex.InnerException != null)
                msg += " | Inner: " + ex.InnerException.Message;
            return BadRequest(new { message = msg });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskDto request)
    {
        try
        {
            int currentUserId = GetCurrentUserId();
            var success = await _taskService.UpdateTaskAsync(id, request, currentUserId);
            if (!success) return NotFound();
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            int currentUserId = GetCurrentUserId();
            var success = await _taskService.DeleteTaskAsync(id, currentUserId);
            if (!success) return NotFound();
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpPut("{id}/progress")]
    public async Task<IActionResult> UpdateProgress(int id, [FromBody] UpdateProgressDto request)
    {
        try
        {
            int currentUserId = GetCurrentUserId();
            var success = await _taskService.UpdateTaskProgressAsync(id, request, currentUserId);
            if (!success) return NotFound();
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/estimate")]
    public async Task<IActionResult> SuggestEstimate(int id)
    {
        try
        {
            int currentUserId = GetCurrentUserId();
            var taskInfo = await _taskService.SuggestEstimatedTimeAsync(id, currentUserId);
            if (taskInfo == null) return NotFound();
            return Ok(taskInfo);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    // Dependencies endpoints
    [HttpPost("{id}/dependencies")]
    public async Task<IActionResult> AddDependency(int id, [FromBody] AddDependencyDto request)
    {
        try
        {
            int currentUserId = GetCurrentUserId();
            var success = await _taskService.AddDependencyAsync(id, request, currentUserId);
            if (!success) return NotFound();
            return Ok(new { success = true });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpDelete("{id}/dependencies/{dependencyId}")]
    public async Task<IActionResult> RemoveDependency(int id, int dependencyId)
    {
        try
        {
            int currentUserId = GetCurrentUserId();
            var success = await _taskService.RemoveDependencyAsync(id, dependencyId, currentUserId);
            if (!success) return NotFound();
            return Ok(new { success = true });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpGet("project/{projectId}/dependency-graph")]
    public async Task<IActionResult> GetDependencyGraph(int projectId)
    {
        var graph = await _taskService.GetDependencyGraphAsync(projectId);
        return Ok(graph);
    }
}
