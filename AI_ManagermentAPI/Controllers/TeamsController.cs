using BusinessObject.DTOs;
using Microsoft.AspNetCore.Mvc;
using Services.I_Services;
using System.Threading.Tasks;

namespace AI_ManagermentAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TeamsController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamsController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyTeams()
    {
        var userIdHeader = Request.Headers["X-User-Id"].FirstOrDefault();
        if (userIdHeader == null || !int.TryParse(userIdHeader, out var userId))
            return Unauthorized(new { message = "User ID is required." });

        var allTeams = await _teamService.GetAllTeamsAsync();
        var myTeams = allTeams.Where(t => 
            t.CreatedBy == userId || 
            t.Members.Any(m => m.UserId == userId)
        ).ToList();
        return Ok(myTeams);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var teams = await _teamService.GetAllTeamsAsync();
        return Ok(teams);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var team = await _teamService.GetTeamByIdAsync(id);
        if (team == null) return NotFound();
        return Ok(team);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeamDto request)
    {
        var team = await _teamService.CreateTeamAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = team.TeamId }, team);
    }

    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddMember(int id, [FromBody] AddTeamMemberDto request)
    {
        request.TeamId = id;
        var success = await _teamService.AddMemberToTeamAsync(request);
        if (!success) return BadRequest("Member already exists or team not found.");
        return Ok("Member added to team.");
    }

    [HttpDelete("members/{memberId}")]
    public async Task<IActionResult> RemoveMember(int memberId)
    {
        await _teamService.RemoveMemberFromTeamAsync(memberId);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _teamService.DeleteTeamAsync(id);
        return NoContent();
    }
}
