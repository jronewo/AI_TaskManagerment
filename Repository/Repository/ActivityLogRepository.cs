using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class ActivityLogRepository : IActivityLogRepository
{
    private readonly AppDbContext _context;

    public ActivityLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ActivityLog?> GetByIdAsync(int logId)
    {
        return await _context.ActivityLogs
            .FirstOrDefaultAsync(l => l.LogId == logId);
    }

    public async Task<List<ActivityLog>> GetByUserIdAsync(int userId)
    {
        return await _context.ActivityLogs
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<ActivityLog>> GetByEntityAsync(string entityType, int entityId)
    {
        return await _context.ActivityLogs
            .Where(l => l.EntityType == entityType && l.EntityId == entityId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<ActivityLog>> GetAllAsync(int limit = 50)
    {
        return await _context.ActivityLogs
            .OrderByDescending(l => l.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<List<ActivityLog>> GetByProjectAsync(int projectId, int limit = 50)
    {
        var taskIds = await _context.Tasks
            .Where(t => t.ProjectId == projectId)
            .Select(t => t.TaskId)
            .ToListAsync();

        return await _context.ActivityLogs
            .Where(l => 
                (l.EntityType == "Project" && l.EntityId == projectId) ||
                (l.EntityType == "Task" && taskIds.Contains(l.EntityId ?? 0))
            )
            .OrderByDescending(l => l.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task AddAsync(ActivityLog log)
    {
        await _context.ActivityLogs.AddAsync(log);
        await _context.SaveChangesAsync();
    }
}
