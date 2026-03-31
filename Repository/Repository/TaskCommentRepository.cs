using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class TaskCommentRepository : ITaskCommentRepository
{
    private readonly AppDbContext _context;

    public TaskCommentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TaskComment?> GetByIdAsync(int commentId)
    {
        return await _context.TaskComments
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.CommentId == commentId);
    }

    public async Task<List<TaskComment>> GetByTaskIdAsync(int taskId)
    {
        return await _context.TaskComments
            .Where(c => c.TaskId == taskId)
            .Include(c => c.User)
            .OrderByDescending(c => c.CommentId)
            .ToListAsync();
    }

    public async Task AddAsync(TaskComment comment)
    {
        await _context.TaskComments.AddAsync(comment);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(TaskComment comment)
    {
        _context.TaskComments.Update(comment);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int commentId)
    {
        var comment = await _context.TaskComments.FindAsync(commentId);
        if (comment != null)
        {
            _context.TaskComments.Remove(comment);
            await _context.SaveChangesAsync();
        }
    }
}
