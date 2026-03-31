using BusinessObject.DTOs;
using Microsoft.AspNetCore.Mvc;
using Services.I_Services;
using System.Threading.Tasks;

namespace AI_ManagermentAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class InvitationsController : ControllerBase
{
    private readonly IInvitationService _invitationService;

    public InvitationsController(IInvitationService invitationService)
    {
        _invitationService = invitationService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var invitation = await _invitationService.GetInvitationByIdAsync(id);
        if (invitation == null) return NotFound();
        return Ok(invitation);
    }

    [HttpGet("team/{teamId}")]
    public async Task<IActionResult> GetTeamInvitations(int teamId)
    {
        var invitations = await _invitationService.GetTeamInvitationsAsync(teamId);
        return Ok(invitations);
    }

    [HttpGet("user/{email}")]
    public async Task<IActionResult> GetUserInvitations(string email)
    {
        var invitations = await _invitationService.GetUserInvitationsAsync(email);
        return Ok(invitations);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInvitationDto request)
    {
        var invitation = await _invitationService.CreateInvitationAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = invitation.InvitationId }, invitation);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateInvitationStatusDto request)
    {
        var success = await _invitationService.UpdateInvitationStatusAsync(id, request.Status);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _invitationService.DeleteInvitationAsync(id);
        return NoContent();
    }
}
