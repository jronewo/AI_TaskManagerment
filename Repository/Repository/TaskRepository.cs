using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<BusinessObject.Models.Task?> GetByIdAsync(int taskId)
    {
        return await _context.Tasks
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.TaskId == taskId);
    }

    public async Task<List<BusinessObject.Models.Task>> GetByProjectIdAsync(int projectId)
    {
        return await _context.Tasks
            .Where(t => t.ProjectId == projectId)
            .ToListAsync();
    }

    public async Task<List<TaskAssignee>> GetTaskAssigneesAsync(int taskId)
    {
        return await _context.TaskAssignees
            .Where(ta => ta.TaskId == taskId)
            .Include(ta => ta.User)
            .ToListAsync();
    }

    public async Task ClearTaskAssigneesAsync(int taskId)
    {
        var assignees = await _context.TaskAssignees.Where(ta => ta.TaskId == taskId).ToListAsync();
        if (assignees.Any())
        {
            _context.TaskAssignees.RemoveRange(assignees);
            await _context.SaveChangesAsync();
        }
    }

    public async Task AddTaskAssigneeAsync(TaskAssignee assignee)
    {
        _context.TaskAssignees.Add(assignee);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateProgressAsync(int taskId, int progress, string riskLevel)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId);
        if (task != null)
        {
            task.Progress = progress;
            task.RiskLevel = riskLevel;
            _context.Tasks.Update(task);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<int> GetCompletedTaskCountByProjectAsync(int projectId)
    {
        return await _context.Tasks
            .Where(t => t.ProjectId == projectId && t.Status == "Done")
            .CountAsync();
    }

    public async Task<int> GetTotalTaskCountByProjectAsync(int projectId)
    {
        return await _context.Tasks
            .Where(t => t.ProjectId == projectId)
            .CountAsync();
    }

    public async Task<BusinessObject.Models.Task> AddAsync(BusinessObject.Models.Task task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }

    public async Task UpdateAsync(BusinessObject.Models.Task task)
    {
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int taskId)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task != null)
        {
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<BusinessObject.Models.Task>> GetByProjectIdWithDetailsAsync(int projectId)
    {
        return await _context.Tasks
            .Where(t => t.ProjectId == projectId)
            .Include(t => t.TaskAssignees)
                .ThenInclude(ta => ta.User)
            .Include(t => t.TaskDependencies) // The task depends on others
                .ThenInclude(td => td.DependsOnTask)
            .Include(t => t.DependentOnTasks) // Others depend on this task
            .ToListAsync();
    }
}
