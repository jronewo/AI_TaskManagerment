using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface ITeamRepository
{
    Task<Team?> GetByIdAsync(int teamId);
    Task<List<Team>> GetAllAsync();
    Task<List<Team>> GetTeamsByCreatorIdAsync(int userId);
    Task AddAsync(Team team);
    Task UpdateAsync(Team team);
    Task DeleteAsync(int teamId);
}
