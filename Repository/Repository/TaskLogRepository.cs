using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class TaskLogRepository : ITaskLogRepository
{
    private readonly AppDbContext _context;

    public TaskLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(TaskLog log)
    {
        _context.TaskLogs.Add(log);
        await _context.SaveChangesAsync();
    }

    public async Task<List<TaskLog>> GetByTaskIdAsync(int taskId)
    {
        return await _context.TaskLogs
            .Where(tl => tl.TaskId == taskId)
            .OrderByDescending(tl => tl.CreatedAt)
            .ToListAsync();
    }
}
