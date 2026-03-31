using BusinessObject.DTOs;
using BusinessObject.Models;
using Repository.I_Repository;
using Services.I_Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Services.Services;

public class InvitationService : IInvitationService
{
    private readonly IInvitationRepository _invitationRepo;
    private readonly ITeamRepository _teamRepo;
    private readonly ITeamMemberRepository _memberRepo;
    private readonly IUserRepository _userRepo;

    public InvitationService(
        IInvitationRepository invitationRepo,
        ITeamRepository teamRepo,
        ITeamMemberRepository memberRepo,
        IUserRepository userRepo)
    {
        _invitationRepo = invitationRepo;
        _teamRepo = teamRepo;
        _memberRepo = memberRepo;
        _userRepo = userRepo;
    }

    public async Task<InvitationDto?> GetInvitationByIdAsync(int invitationId)
    {
        var i = await _invitationRepo.GetByIdAsync(invitationId);
        if (i == null) return null;
        return MapToDto(i);
    }

    public async Task<List<InvitationDto>> GetTeamInvitationsAsync(int teamId)
    {
        var invitations = await _invitationRepo.GetByTeamIdAsync(teamId);
        return invitations.Select(MapToDto).ToList();
    }

    public async Task<List<InvitationDto>> GetUserInvitationsAsync(string email)
    {
        var invitations = await _invitationRepo.GetByEmailAsync(email);
        return invitations.Select(MapToDto).ToList();
    }

    public async Task<InvitationDto> CreateInvitationAsync(CreateInvitationDto request)
    {
        var invitation = new Invitation
        {
            TeamId = request.TeamId,
            Email = request.Email,
            Status = "Pending"
        };

        await _invitationRepo.AddAsync(invitation);
        
        var i = await _invitationRepo.GetByIdAsync(invitation.InvitationId);
        return MapToDto(i!);
    }

    public async Task<bool> UpdateInvitationStatusAsync(int invitationId, string status)
    {
        var i = await _invitationRepo.GetByIdAsync(invitationId);
        if (i == null) return false;

        i.Status = status;
        await _invitationRepo.UpdateAsync(i);

        // If accepted, add user to team
        if (status == "Accepted")
        {
            var user = await _userRepo.GetByEmailAsync(i.Email ?? "");
            if (user != null && i.TeamId.HasValue)
            {
                await _memberRepo.AddAsync(new TeamMember
                {
                    TeamId = i.TeamId.Value,
                    UserId = user.UserId,
                    Role = "MEMBER"
                });
            }
        }

        return true;
    }

    public async Task<bool> DeleteInvitationAsync(int invitationId)
    {
        await _invitationRepo.DeleteAsync(invitationId);
        return true;
    }

    private InvitationDto MapToDto(Invitation i)
    {
        return new InvitationDto
        {
            InvitationId = i.InvitationId,
            TeamId = i.TeamId,
            TeamName = i.Team?.Name,
            Email = i.Email,
            Status = i.Status
        };
    }
}
