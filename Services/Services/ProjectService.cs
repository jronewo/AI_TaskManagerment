using BusinessObject.DTOs;
using BusinessObject.Models;
using Repository.I_Repository;
using Services.I_Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Services.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepo;
    private readonly IUserRepository _userRepo;
    private readonly ITeamRepository _teamRepo;
    private readonly ITeamMemberRepository _teamMemberRepo;

    public ProjectService(
        IProjectRepository projectRepo,
        IUserRepository userRepo,
        ITeamRepository teamRepo,
        ITeamMemberRepository teamMemberRepo)
    {
        _projectRepo = projectRepo;
        _userRepo = userRepo;
        _teamRepo = teamRepo;
        _teamMemberRepo = teamMemberRepo;
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(int projectId)
    {
        var project = await _projectRepo.GetByIdAsync(projectId);
        if (project == null) return null;
        return MapToDto(project);
    }

    public async Task<List<ProjectDto>> GetAllProjectsAsync()
    {
        var projects = await _projectRepo.GetAllAsync();
        return projects.Select(MapToDto).ToList();
    }

    public async Task<List<ProjectDto>> GetProjectsByUserIdAsync(int userId)
    {
        var projects = await _projectRepo.GetProjectsByUserIdAsync(userId);
        return projects.Select(MapToDto).ToList();
    }

    public async Task<List<ProjectDto>> GetProjectsByOrgIdAsync(int orgId)
    {
        var projects = await _projectRepo.GetProjectsByOrgIdAsync(orgId);
        return projects.Select(MapToDto).ToList();
    }

    public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto request)
    {
        var project = new Project
        {
            Name = request.Name,
            Description = request.Description,
            CreatedBy = request.CreatedBy,
            OrganizationId = request.OrganizationId,
            Deadline = request.Deadline,
            Status = "Planning",
            Progress = 0,
            CreatedAt = System.DateTime.UtcNow
        };

        // Always create a 1:1 mapped Team for this Project
        var newTeam = new Team
        {
            Name = $"Team Project: {project.Name}",
            Description = $"Đội tập thể cho dự án {project.Name}",
            CreatedBy = request.CreatedBy 
        };
        await _teamRepo.AddAsync(newTeam);
        project.TeamId = newTeam.TeamId;

        // Add creator as LEADER
        var teamMember = new TeamMember
        {
            TeamId = newTeam.TeamId,
            UserId = request.CreatedBy,
            Role = "LEADER"
        };
        await _teamMemberRepo.AddAsync(teamMember);

        // Save Project to DB
        await _projectRepo.AddAsync(project);
        
        var newProject = await _projectRepo.GetByIdAsync(project.ProjectId);
        return MapToDto(newProject!);
    }

    public async Task<bool> UpdateProjectAsync(int projectId, UpdateProjectDto request)
    {
        var p = await _projectRepo.GetByIdAsync(projectId);
        if (p == null) return false;

        p.Name = request.Name ?? p.Name;
        p.Description = request.Description ?? p.Description;
        p.Status = request.Status ?? p.Status;
        p.TeamId = request.TeamId ?? p.TeamId;
        p.Deadline = request.Deadline ?? p.Deadline;
        p.UpdatedAt = System.DateTime.UtcNow;

        await _projectRepo.UpdateAsync(p);
        return true;
    }

    public async Task<bool> DeleteProjectAsync(int projectId)
    {
        await _projectRepo.DeleteAsync(projectId);
        return true;
    }

    public async Task<bool> AddMemberByEmailAsync(int projectId, string email, string role)
    {
        var project = await _projectRepo.GetByIdAsync(projectId);
        if (project == null) return false;

        var user = await _userRepo.GetByEmailAsync(email);
        if (user == null) return false;

        // If project doesn't have a team, create one
        if (project.TeamId == null || project.TeamId == 0)
        {
            var newTeam = new Team
            {
                Name = $"Team Project: {project.Name}",
                Description = $"Đội tập thể cho dự án {project.Name}",
                CreatedBy = user.UserId 
            };
            await _teamRepo.AddAsync(newTeam);
            project.TeamId = newTeam.TeamId;
            await _projectRepo.UpdateAsync(project);
        }

        // Add to team_members
        var existingMember = (await _teamRepo.GetByIdAsync(project.TeamId.Value))?.TeamMembers.FirstOrDefault(m => m.UserId == user.UserId);
        if (existingMember != null) return true; // Already a member

        var teamMember = new TeamMember
        {
            TeamId = project.TeamId.Value,
            UserId = user.UserId,
            Role = role ?? "MEMBER"
        };
        await _teamMemberRepo.AddAsync(teamMember);
        return true;
    }

    private ProjectDto MapToDto(Project p)
    {
        return new ProjectDto
        {
            ProjectId = p.ProjectId,
            CreatedBy = p.CreatedBy,
            Name = p.Name ?? "Untitled Project",
            Description = p.Description,
            Status = p.Status,
            OrganizationId = p.OrganizationId,
            OrganizationName = p.Organization?.Name,
            TeamId = p.TeamId ?? 0,
            TeamName = p.Team?.Name,
            Deadline = p.Deadline,
            Progress = p.Progress ?? 0,
            PredictedEndDate = p.PredictedEndDate,
            RiskLevel = "LOW", // To be calculated by AiService
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }
}
