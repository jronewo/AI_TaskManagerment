using BusinessObject.DTOs;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using Services.I_Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Services.Services;

public class OrganizationService : IOrganizationService
{
    private readonly IOrganizationRepository _organizationRepo;
    private readonly ITaskRepository _taskRepo;
    private readonly AppDbContext _context; // For advanced queries if needed

    public OrganizationService(
        IOrganizationRepository organizationRepo,
        ITaskRepository taskRepo,
        AppDbContext context)
    {
        _organizationRepo = organizationRepo;
        _taskRepo = taskRepo;
        _context = context;
    }

    public async Task<List<OrganizationDto>> GetAllOrganizationsAsync()
    {
        var orgs = await _organizationRepo.GetAllAsync();
        return orgs.Select(org => new OrganizationDto
        {
            OrganizationId = org.OrganizationId,
            Name = org.Name,
            Description = org.Description,
            Logo = org.Logo,
            OwnerId = org.OwnerId,
            OwnerName = org.Owner?.Name,
            CreatedAt = org.CreatedAt
        }).ToList();
    }

    public async Task<OrganizationDto?> GetOrganizationAsync(int orgId)
    {
        var org = await _organizationRepo.GetByIdAsync(orgId);
        if (org == null) return null;

        return new OrganizationDto
        {
            OrganizationId = org.OrganizationId,
            Name = org.Name,
            Description = org.Description,
            Logo = org.Logo,
            OwnerId = org.OwnerId,
            OwnerName = org.Owner?.Name,
            CreatedAt = org.CreatedAt
        };
    }

    public async Task<List<OrganizationProjectDto>> GetOrganizationProjectsAsync(int orgId)
    {
        var projects = await _organizationRepo.GetProjectsByOrganizationIdAsync(orgId);
        var result = new List<OrganizationProjectDto>();

        foreach (var p in projects)
        {
            int totalTasks = p.Tasks.Count;
            int doneTasks = p.Tasks.Count(t => t.Status == "Done" || t.Status == "Hoàn thành");
            int calculatedProgress = totalTasks == 0 ? 0 : (int)Math.Round(((double)doneTasks / totalTasks) * 100);

            // Find Project Manager
            var pm = p.Team?.TeamMembers?.FirstOrDefault(tm => tm.Role == "LEADER")?.User;

            result.Add(new OrganizationProjectDto
            {
                ProjectId = p.ProjectId,
                Name = p.Name ?? "Untitled",
                Description = p.Description,
                Status = p.Status,
                Deadline = p.Deadline,
                Progress = calculatedProgress,
                PredictedEndDate = p.PredictedEndDate,
                RiskLevel = DetermineProjectRiskLevel(p),
                PmId = pm?.UserId,
                PmName = pm?.Name,
                IsEvaluated = p.ProjectEvaluations.Any(),
                TeamId = p.TeamId,
                TeamMemberCount = p.Team?.TeamMembers.Count ?? 0
            });
        }

        return result;
    }

    public async Task<OrganizationProjectDto?> GetProjectDetailAsync(int orgId, int projectId)
    {
        var projects = await GetOrganizationProjectsAsync(orgId);
        return projects.FirstOrDefault(p => p.ProjectId == projectId);
    }

    public async Task CalculateProjectProgressAsync(int projectId)
    {
        var project = await _context.Projects
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.ProjectId == projectId);

        if (project == null) return;

        int totalTasks = project.Tasks.Count;
        int avgProgress = 0;

        if (totalTasks > 0)
        {
            int doneTasks = project.Tasks.Count(t => t.Status == "Done" || t.Status == "Hoàn thành");
            avgProgress = (int)Math.Round(((double)doneTasks / totalTasks) * 100);
        }

        project.Progress = avgProgress;
        project.UpdatedAt = DateTime.UtcNow;
        
        // Auto update project status based on progress
        if (avgProgress == 100 && project.Status != "Completed")
        {
            project.Status = "Completed";
        }
        else if (avgProgress > 0 && avgProgress < 100 && project.Status == "Not Started")
        {
            project.Status = "In Progress";
        }

        _context.Projects.Update(project);
        // Save changes later if needed, but context here tracking it
        await _context.SaveChangesAsync();
    }

    public async Task PredictCompletionDateAsync(int projectId)
    {
        var project = await _context.Projects
            .Include(p => p.Tasks)
            .ThenInclude(t => t.TaskLogs)
            .FirstOrDefaultAsync(p => p.ProjectId == projectId);

        if (project == null || !project.Tasks.Any() || project.Progress == 100 || !project.CreatedAt.HasValue) 
            return;

        var totalTasks = project.Tasks.Count;
        var completedTasks = project.Tasks.Count(t => t.Status == "Done");
        
        if (completedTasks == 0) return; // Cannot predict without any completed tasks

        var timeElapsedDays = (DateTime.UtcNow - project.CreatedAt.Value).TotalDays;
        if (timeElapsedDays < 1) timeElapsedDays = 1; // Minimum 1 day to avoid div/0

        var taskVelocityPerDay = completedTasks / timeElapsedDays;
        var remainingTasks = totalTasks - completedTasks;
        
        var predictedDaysRemaining = remainingTasks / taskVelocityPerDay;
        
        // Update prediction
        project.PredictedEndDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(predictedDaysRemaining));
        _context.Projects.Update(project);
        await _context.SaveChangesAsync();
    }

    private string DetermineProjectRiskLevel(Project p)
    {
        if (p.Status == "Completed" || p.Progress == 100) return "LOW";
        if (!p.Deadline.HasValue) return "LOW";

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var daysUntilDeadline = p.Deadline.Value.DayNumber - today.DayNumber;

        // Overall risk based on individual task risks
        var highRiskTasks = p.Tasks.Count(t => t.RiskLevel == "HIGH");
        if (highRiskTasks > 0) return "HIGH";

        // Risk based on project deadline
        if (daysUntilDeadline < 0) return "HIGH"; // Overdue
        if (daysUntilDeadline <= 5 && (p.Progress ?? 0) < 50) return "HIGH";
        if (daysUntilDeadline <= 10 && (p.Progress ?? 0) < 70) return "MEDIUM";

        // Risk based on AI prediction
        if (p.PredictedEndDate.HasValue && p.PredictedEndDate.Value > p.Deadline.Value)
        {
             return "HIGH"; // Predicted to finish after deadline
        }

        return "LOW";
    }
}
