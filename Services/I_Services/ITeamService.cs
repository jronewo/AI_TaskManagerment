using BusinessObject.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.I_Services;

public interface ITeamService
{
    Task<TeamDto?> GetTeamByIdAsync(int teamId);
    Task<List<TeamDto>> GetAllTeamsAsync();
    Task<List<TeamDto>> GetTeamsByCreatorIdAsync(int userId);
    Task<TeamDto> CreateTeamAsync(CreateTeamDto request);
    Task<bool> AddMemberToTeamAsync(AddTeamMemberDto request);
    Task<bool> RemoveMemberFromTeamAsync(int memberId);
    Task<bool> DeleteTeamAsync(int teamId);
}
