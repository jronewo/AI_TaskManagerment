using BusinessObject.DTOs;
using Microsoft.AspNetCore.Mvc;
using Services.I_Services;
using System.Threading.Tasks;

namespace AI_ManagermentAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SkillsController : ControllerBase
{
    private readonly ISkillService _skillService;

    public SkillsController(ISkillService skillService)
    {
        _skillService = skillService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var skills = await _skillService.GetAllSkillsAsync();
        return Ok(skills);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var skill = await _skillService.GetSkillByIdAsync(id);
        if (skill == null) return NotFound();
        return Ok(skill);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSkillDto request)
    {
        var skill = await _skillService.CreateSkillAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = skill.SkillId }, skill);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserSkills(int userId)
    {
        var skills = await _skillService.GetUserSkillsAsync(userId);
        return Ok(skills);
    }

    [HttpPost("user")]
    public async Task<IActionResult> AddUserSkill([FromBody] AddUserSkillDto request)
    {
        var success = await _skillService.AddUserSkillAsync(request);
        if (!success) return BadRequest("Skill already assigned to user.");
        return Ok("Skill added to user profile.");
    }

    [HttpPut("user/{userSkillId}")]
    public async Task<IActionResult> UpdateSkillLevel(int userSkillId, [FromBody] int level)
    {
        var success = await _skillService.UpdateUserSkillLevelAsync(userSkillId, level);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("user/{userSkillId}")]
    public async Task<IActionResult> RemoveUserSkill(int userSkillId)
    {
        var success = await _skillService.RemoveUserSkillAsync(userSkillId);
        if (!success) return NotFound();
        return NoContent();
    }
}
