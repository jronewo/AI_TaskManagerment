using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BusinessObject.Models;
using System.Threading.Tasks;

namespace AI_ManagermentAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("platform-stats")]
    public async Task<IActionResult> GetPlatformStats()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalOrganizations = await _context.Organizations.CountAsync();
        var totalProjects = await _context.Projects.CountAsync();
        var totalTasks = await _context.Tasks.CountAsync();
        
        var totalTasksDone = await _context.Tasks.CountAsync(t => t.Status == "Done");

        return Ok(new
        {
            Users = totalUsers,
            Organizations = totalOrganizations,
            Projects = totalProjects,
            Tasks = totalTasks,
            TasksDone = totalTasksDone
        });
    }
}
