using BusinessObject.DTOs;
using Microsoft.AspNetCore.Mvc;
using Services.I_Services;
using System.Threading.Tasks;

namespace AI_ManagermentAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userIdHeader = Request.Headers["X-User-Id"].FirstOrDefault();
        if (userIdHeader != null && int.TryParse(userIdHeader, out var userId))
        {
            var projects = await _projectService.GetProjectsByUserIdAsync(userId);
            return Ok(projects);
        }
        
        // Fallback for requests without user id
        return Unauthorized(new { message = "User ID is required to fetch projects." });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var project = await _projectService.GetProjectByIdAsync(id);
        if (project == null) return NotFound();
        return Ok(project);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectDto request)
    {
        var project = await _projectService.CreateProjectAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = project.ProjectId }, project);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectDto request)
    {
        var success = await _projectService.UpdateProjectAsync(id, request);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _projectService.DeleteProjectAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddMember(int id, [FromBody] AddProjectMemberDto request)
    {
        var success = await _projectService.AddMemberByEmailAsync(id, request.Email, request.Role);
        if (!success) return BadRequest("Không tìm thấy người dùng hoặc dự án.");
        return Ok("Đã thêm thành viên vào dự án.");
    }
}
