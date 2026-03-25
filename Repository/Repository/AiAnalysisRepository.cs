using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class AiAnalysisRepository : IAiAnalysisRepository
{
    private readonly AppDbContext _context;

    public AiAnalysisRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(AiAnalysis analysis)
    {
        _context.AiAnalyses.Add(analysis);
        await _context.SaveChangesAsync();
    }

    public async Task<List<AiAnalysis>> GetByTaskIdAsync(int taskId)
    {
        return await _context.AiAnalyses
            .Where(a => a.TaskId == taskId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<AiAnalysis?> GetByTypeAsync(int taskId, string analysisType)
    {
        return await _context.AiAnalyses
            .Where(a => a.TaskId == taskId && a.AnalysisType == analysisType)
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync();
    }
}
