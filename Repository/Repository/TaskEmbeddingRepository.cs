using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class TaskEmbeddingRepository : ITaskEmbeddingRepository
{
    private readonly AppDbContext _context;

    public TaskEmbeddingRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task UpsertAsync(TaskEmbedding embedding)
    {
        var existing = await _context.TaskEmbeddings.FirstOrDefaultAsync(e => e.TaskId == embedding.TaskId);
        if (existing == null)
        {
            _context.TaskEmbeddings.Add(embedding);
        }
        else
        {
            existing.Embedding = embedding.Embedding;
            _context.TaskEmbeddings.Update(existing);
        }
        await _context.SaveChangesAsync();
    }

    public async Task<TaskEmbedding?> GetByTaskIdAsync(int taskId)
    {
        return await _context.TaskEmbeddings.FirstOrDefaultAsync(e => e.TaskId == taskId);
    }
}
