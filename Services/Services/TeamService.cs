using BusinessObject.DTOs;
using BusinessObject.Models;
using Repository.I_Repository;
using Services.I_Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Services.Services;

public class TeamService : ITeamService
{
    private readonly ITeamRepository _teamRepo;
    private readonly ITeamMemberRepository _memberRepo;

    public TeamService(ITeamRepository teamRepo, ITeamMemberRepository memberRepo)
    {
        _teamRepo = teamRepo;
        _memberRepo = memberRepo;
    }

    public async Task<TeamDto?> GetTeamByIdAsync(int teamId)
    {
        var team = await _teamRepo.GetByIdAsync(teamId);
        if (team == null) return null;

        return MapToDto(team);
    }

    public async Task<List<TeamDto>> GetAllTeamsAsync()
    {
        var teams = await _teamRepo.GetAllAsync();
        return teams.Select(MapToDto).ToList();
    }

    public async Task<List<TeamDto>> GetTeamsByCreatorIdAsync(int userId)
    {
        var teams = await _teamRepo.GetTeamsByCreatorIdAsync(userId);
        return teams.Select(MapToDto).ToList();
    }

    public async Task<TeamDto> CreateTeamAsync(CreateTeamDto request)
    {
        var team = new Team
        {
            Name = request.Name,
            Description = request.Description,
            CreatedBy = request.CreatedBy
        };

        await _teamRepo.AddAsync(team);
        
        // Add creator as leader
        await _memberRepo.AddAsync(new TeamMember 
        { 
            TeamId = team.TeamId, 
            UserId = request.CreatedBy, 
            Role = "LEADER" 
        });

        var newTeam = await _teamRepo.GetByIdAsync(team.TeamId);
        return MapToDto(newTeam!);
    }

    public async Task<bool> AddMemberToTeamAsync(AddTeamMemberDto request)
    {
        // Check if member already exists
        var existing = await _memberRepo.GetByTeamIdAsync(request.TeamId);
        if (existing.Any(m => m.UserId == request.UserId)) return false;

        await _memberRepo.AddAsync(new TeamMember
        {
            TeamId = request.TeamId,
            UserId = request.UserId,
            Role = request.Role
        });
        return true;
    }

    public async Task<bool> RemoveMemberFromTeamAsync(int memberId)
    {
        await _memberRepo.DeleteAsync(memberId);
        return true;
    }

    public async Task<bool> DeleteTeamAsync(int teamId)
    {
        await _teamRepo.DeleteAsync(teamId);
        return true;
    }

    private TeamDto MapToDto(Team team)
    {
        return new TeamDto
        {
            TeamId = team.TeamId,
            Name = team.Name ?? "Untitled Team",
            Description = team.Description,
            CreatedBy = team.CreatedBy,
            CreatorName = team.CreatedByNavigation?.Name,
            Members = team.TeamMembers.Select(tm => new TeamMemberDto
            {
                Id = tm.Id,
                TeamId = tm.TeamId ?? 0,
                UserId = tm.UserId ?? 0,
                UserName = tm.User?.Name,
                UserEmail = tm.User?.Email,
                Role = tm.Role
            }).ToList()
        };
    }
}
