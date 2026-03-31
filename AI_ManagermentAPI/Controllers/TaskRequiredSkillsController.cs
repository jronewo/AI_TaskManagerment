using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.DTOs;
using BusinessObject.Models;
using Microsoft.AspNetCore.Mvc;
using Services.I_Services;

namespace AI_ManagermentAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TaskRequiredSkillsController : ControllerBase
{
    private readonly ITaskRequiredSkillService _taskRequiredSkillService;

    public TaskRequiredSkillsController(ITaskRequiredSkillService taskRequiredSkillService)
    {
        _taskRequiredSkillService = taskRequiredSkillService;
    }

    [HttpGet("{taskId}")]
    public async Task<IActionResult> GetTaskSkills(int taskId)
    {
        var skills = await _taskRequiredSkillService.GetTaskSkillsAsync(taskId);
        var result = skills.Select(s => new
        {
            s.Id,
            s.TaskId,
            s.SkillId,
            s.RequiredLevel,
            SkillName = s.Skill?.SkillName
        });
        return Ok(result);
    }

    [HttpPost("{taskId}")]
    public async Task<IActionResult> UpdateTaskSkills(int taskId, [FromBody] TaskSkillRequest request)
    {
        try
        {
            await _taskRequiredSkillService.ReplaceTaskSkillsAsync(taskId, request.SkillIds);
            return Ok(new { message = "Cập nhật kỹ năng yêu cầu thành công." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi cập nhật kỹ năng: " + ex.Message });
        }
    }
}
