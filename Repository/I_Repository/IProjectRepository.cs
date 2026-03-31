using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface IProjectRepository
{
    Task<Project?> GetByIdAsync(int projectId);
    Task<List<Project>> GetAllAsync();
    Task<List<Project>> GetProjectsByUserIdAsync(int userId);
    Task<List<Project>> GetProjectsByOrgIdAsync(int orgId);
    Task AddAsync(Project project);
    Task UpdateAsync(Project project);
    Task DeleteAsync(int projectId);
}
