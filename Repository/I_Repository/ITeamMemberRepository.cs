using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface ITeamMemberRepository
{
    Task<TeamMember?> GetByIdAsync(int id);
    Task<List<TeamMember>> GetByTeamIdAsync(int teamId);
    Task<List<TeamMember>> GetByUserIdAsync(int userId);
    Task AddAsync(TeamMember teamMember);
    Task UpdateAsync(TeamMember teamMember);
    Task DeleteAsync(int id);
}
