using BusinessObject.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.I_Services;

public interface IProjectService
{
    Task<ProjectDto?> GetProjectByIdAsync(int projectId);
    Task<List<ProjectDto>> GetAllProjectsAsync();
    Task<List<ProjectDto>> GetProjectsByUserIdAsync(int userId);
    Task<List<ProjectDto>> GetProjectsByOrgIdAsync(int orgId);
    Task<ProjectDto> CreateProjectAsync(CreateProjectDto request);
    Task<bool> UpdateProjectAsync(int projectId, UpdateProjectDto request);
    Task<bool> DeleteProjectAsync(int projectId);
    Task<bool> AddMemberByEmailAsync(int projectId, string email, string role);
}
