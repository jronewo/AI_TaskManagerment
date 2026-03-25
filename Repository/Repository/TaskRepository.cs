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

    public async Task<List<TaskRequiredSkill>> GetTaskRequiredSkillsAsync(int taskId)
    {
        return await _context.Set<TaskRequiredSkill>()
            .Where(trs => trs.TaskId == taskId)
            .Include(trs => trs.Skill)
            .ToListAsync();
    }

    public async Task<List<TaskAssignee>> GetTaskAssigneesAsync(int taskId)
    {
        return await _context.TaskAssignees
            .Where(ta => ta.TaskId == taskId)
            .Include(ta => ta.User)
            .ToListAsync();
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
}
