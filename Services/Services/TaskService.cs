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
using TaskModel = BusinessObject.Models.Task;

namespace Services.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepo;
    private readonly IProjectRepository _projectRepo;
    private readonly ITeamRepository _teamRepo;
    private readonly ITextGenerationService _textGenService;
    private readonly IActivityLogService _activityLogService;
    private readonly AppDbContext _context;

    public TaskService(
        ITaskRepository taskRepo,
        IProjectRepository projectRepo,
        ITeamRepository teamRepo,
        ITextGenerationService textGenService,
        IActivityLogService activityLogService,
        AppDbContext context)
    {
        _taskRepo = taskRepo;
        _projectRepo = projectRepo;
        _teamRepo = teamRepo;
        _textGenService = textGenService;
        _activityLogService = activityLogService;
        _context = context;
    }

    private async Task<bool> IsProjectLeaderAsync(int projectId, int userId)
    {
        var project = await _projectRepo.GetByIdAsync(projectId);
        if (project == null) return false;
        
        if (project.CreatedBy == userId) return true;

        if (project.TeamId == null) return false;
        
        var team = await _teamRepo.GetByIdAsync(project.TeamId.Value);
        if (team == null) return false;
        
        return team.TeamMembers.Any(tm => tm.UserId == userId && tm.Role != null && tm.Role.Trim().ToUpper() == "LEADER");
    }

    private async Task<bool> IsProjectMemberAsync(int projectId, int userId)
    {
        var project = await _projectRepo.GetByIdAsync(projectId);
        if (project == null || project.TeamId == null) return false;
        
        var team = await _teamRepo.GetByIdAsync(project.TeamId.Value);
        if (team == null) return false;
        
        return team.TeamMembers.Any(tm => tm.UserId == userId);
    }

    public async Task<List<TaskDetailDto>> GetTasksByProjectIdAsync(int projectId)
    {
        var tasks = await _taskRepo.GetByProjectIdWithDetailsAsync(projectId);
        return tasks.Select(MapToDto).ToList();
    }

    public async Task<TaskDetailDto?> GetTaskByIdAsync(int taskId)
    {
        var task = await _context.Tasks
            .Include(t => t.Project)
            .Include(t => t.TaskAssignees)
                .ThenInclude(ta => ta.User)
            .Include(t => t.TaskDependencies)
                .ThenInclude(td => td.DependsOnTask)
            .Include(t => t.TaskRequiredSkills)
            .FirstOrDefaultAsync(t => t.TaskId == taskId);
            
        if (task == null) return null;
        return MapToDto(task);
    }

    public async Task<TaskDetailDto> CreateTaskAsync(CreateTaskDto request, int currentUserId)
    {
        // Removed security check per user request

        var task = new TaskModel
        {
            ProjectId = request.ProjectId,
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority ?? "Medium",
            Status = "Todo",
            Deadline = !string.IsNullOrEmpty(request.Deadline) && DateOnly.TryParse(request.Deadline, out var dl) ? dl : null,
            Difficulty = request.Difficulty,
            CreatedBy = currentUserId,
            CreatedAt = DateTime.UtcNow,
            Progress = 0,
            RiskLevel = "LOW"
        };

        await _taskRepo.AddAsync(task);
        
        await _activityLogService.LogActionAsync(currentUserId, $"Đã tạo task mới: {task.Title}", "Task", task.TaskId);
        
        return await GetTaskByIdAsync(task.TaskId) ?? MapToDto(task);
    }

    public async Task<bool> UpdateTaskAsync(int taskId, UpdateTaskDto request, int currentUserId)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId);
        if (task == null || task.ProjectId == null) return false;

        // Security check removed per user request

        task.Title = request.Title ?? task.Title;
        task.Description = request.Description ?? task.Description;
        task.Status = request.Status ?? task.Status;
        task.Priority = request.Priority ?? task.Priority;
        task.Deadline = !string.IsNullOrEmpty(request.Deadline) && DateOnly.TryParse(request.Deadline, out var udl) ? udl : task.Deadline;
        task.EstimatedTime = request.EstimatedTime ?? task.EstimatedTime;
        task.ActualTime = request.ActualTime ?? task.ActualTime;
        task.Difficulty = request.Difficulty ?? task.Difficulty;

        await _taskRepo.UpdateAsync(task);
        await _activityLogService.LogActionAsync(currentUserId, $"Đã cập nhật thông tin task: {task.Title}", "Task", task.TaskId);
        return true;
    }

    public async Task<bool> DeleteTaskAsync(int taskId, int currentUserId)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task == null || task.ProjectId == null) return false;

        // Security check removed per user request

        await _taskRepo.DeleteAsync(taskId);
        await _activityLogService.LogActionAsync(currentUserId, $"Đã xóa task #{taskId}", "Project", task.ProjectId.Value);
        return true;
    }

    public async Task<bool> UpdateTaskProgressAsync(int taskId, UpdateProgressDto req, int currentUserId)
    {
        var task = await _context.Tasks
            .Include(t => t.TaskDependencies)
            .FirstOrDefaultAsync(t => t.TaskId == taskId);
            
        if (task == null || task.ProjectId == null) return false;

        // Security check removed per user request

        if (req.Status == "Done")
        {
            var dependencies = await _context.TaskDependencies
                .Include(td => td.DependsOnTask)
                .Where(td => td.TaskId == taskId)
                .ToListAsync();
                
            foreach (var dep in dependencies)
            {
                if (dep.DependsOnTask != null && dep.DependsOnTask.Status != "Done")
                {
                    throw new InvalidOperationException($"Không thể hoàn thành vì task này phụ thuộc vào '{dep.DependsOnTask.Title}' chưa hoàn thành.");
                }
            }
        }

        if (!string.IsNullOrEmpty(req.Status)) task.Status = req.Status;
        if (req.Progress.HasValue) task.Progress = req.Progress.Value;
        if (!string.IsNullOrEmpty(req.RiskLevel)) task.RiskLevel = req.RiskLevel;
        if (req.ActualTime.HasValue) task.ActualTime = req.ActualTime.Value;
        
        if (req.Status == "Done") task.Progress = 100;
        
        await _taskRepo.UpdateAsync(task);
        
        await _activityLogService.LogActionAsync(
            currentUserId, 
            $"Cập nhật tiến độ task '{task.Title}' thành {task.Status} (Risk: {task.RiskLevel})", 
            "Task", 
            task.TaskId);
            
        return true;
    }

    public async Task<bool> AddDependencyAsync(int taskId, AddDependencyDto request, int currentUserId)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task == null || task.ProjectId == null) return false;

        // Security check removed per user request

        var dep = new TaskDependency
        {
            TaskId = taskId,
            DependsOnTaskId = request.DependsOnTaskId
        };
        _context.TaskDependencies.Add(dep);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveDependencyAsync(int taskId, int dependencyId, int currentUserId)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task == null || task.ProjectId == null) return false;

        // Security check removed per user request

        var dep = await _context.TaskDependencies.FindAsync(dependencyId);
        if (dep != null && dep.TaskId == taskId)
        {
            _context.TaskDependencies.Remove(dep);
            await _context.SaveChangesAsync();
        }
        return true;
    }

    public async Task<DependencyGraphDto> GetDependencyGraphAsync(int projectId)
    {
        var tasks = await _context.Tasks
            .Where(t => t.ProjectId == projectId)
            .ToListAsync();
            
        var dependencies = await _context.TaskDependencies
            .Include(td => td.Task)
            .Where(td => td.Task != null && td.Task.ProjectId == projectId)
            .ToListAsync();

        var graph = new DependencyGraphDto();
        
        foreach (var t in tasks)
        {
            graph.Nodes.Add(new GraphNodeDto
            {
                Id = t.TaskId.ToString(),
                Title = t.Title ?? "Untitle",
                Status = t.Status
            });
        }
        
        foreach (var d in dependencies)
        {
            graph.Edges.Add(new GraphEdgeDto
            {
                Id = $"e_{d.DependsOnTaskId}_{d.TaskId}",
                Source = d.DependsOnTaskId.ToString(),
                Target = d.TaskId.ToString()
            });
        }

        return graph;
    }

    public async Task<TaskDetailDto?> SuggestEstimatedTimeAsync(int taskId, int currentUserId)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task == null || task.ProjectId == null) return null;

        // Security check removed per user request

        var prompt = $"Estimate the time required in hours for this task based on its title and description. Ensure you output a single number representing hours.\nTitle: {task.Title}\nDescription: {task.Description}\nDifficulty (1-10): {task.Difficulty}";
        
        var aiResponse = await _textGenService.GenerateTextAsync(prompt, maxTokens: 10);
        
        int hours = 4; // Default
        var numberMatch = System.Text.RegularExpressions.Regex.Match(aiResponse, @"\d+");
        if (numberMatch.Success)
        {
            int.TryParse(numberMatch.Value, out hours);
        }

        task.AiEstimatedTime = hours;
        await _taskRepo.UpdateAsync(task);

        return await GetTaskByIdAsync(taskId);
    }

    public async Task<List<TaskDetailDto>> GetTasksByAssigneeAsync(int userId)
    {
        var tasks = await _context.Tasks
            .Include(t => t.Project)
            .Include(t => t.TaskAssignees)
                .ThenInclude(ta => ta.User)
            .Include(t => t.TaskDependencies)
                .ThenInclude(td => td.DependsOnTask)
            .Where(t => t.TaskAssignees.Any(ta => ta.UserId == userId))
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return tasks.Select(MapToDto).ToList();
    }

    private TaskDetailDto MapToDto(TaskModel t)
    {
        var dto = new TaskDetailDto
        {
            TaskId = t.TaskId,
            ProjectId = t.ProjectId,
            Title = t.Title,
            Description = t.Description,
            Status = t.Status,
            Priority = t.Priority,
            Deadline = t.Deadline,
            EstimatedTime = t.EstimatedTime,
            AiEstimatedTime = t.AiEstimatedTime,
            ActualTime = t.ActualTime,
            Progress = t.Progress,
            RiskLevel = t.RiskLevel,
            AiSummary = t.AiSummary,
            CreatedAt = t.CreatedAt,
            CreatedBy = t.CreatedBy
        };

        if (t.TaskAssignees != null)
        {
            dto.Assignees = t.TaskAssignees.Select(ta => new TaskAssigneeDto
            {
                UserId = ta.User?.UserId ?? 0,
                UserName = ta.User?.Name,
                Avatar = ta.User?.Avatar
            }).ToList();
        }

        if (t.TaskDependencies != null)
        {
            dto.Dependencies = t.TaskDependencies.Select(td => new TaskDependencyDto
            {
                DependencyId = td.DependencyId,
                DependsOnTaskId = td.DependsOnTaskId,
                DependsOnTaskTitle = td.DependsOnTask?.Title,
                Status = td.DependsOnTask?.Status
            }).ToList();
        }

        if (t.TaskRequiredSkills != null)
        {
            dto.RequiredSkillIds = t.TaskRequiredSkills.Select(s => s.SkillId.Value).ToList();
        }

        return dto;
    }
}
