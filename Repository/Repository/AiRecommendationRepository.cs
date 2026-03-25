using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class AiRecommendationRepository : IAiRecommendationRepository
{
    private readonly AppDbContext _context;

    public AiRecommendationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(AiRecommendation recommendation)
    {
        _context.AiRecommendations.Add(recommendation);
        await _context.SaveChangesAsync();
    }

    public async Task AddRangeAsync(List<AiRecommendation> recommendations)
    {
        _context.AiRecommendations.AddRange(recommendations);
        await _context.SaveChangesAsync();
    }

    public async Task<List<AiRecommendation>> GetByTaskIdAsync(int taskId)
    {
        return await _context.AiRecommendations
            .Where(ar => ar.TaskId == taskId)
            .Include(ar => ar.SuggestedUser)
            .OrderByDescending(ar => ar.Score)
            .ToListAsync();
    }

    public async Task DeleteByTaskIdAsync(int taskId)
    {
        var existing = await _context.AiRecommendations
            .Where(ar => ar.TaskId == taskId)
            .ToListAsync();

        if (existing.Count > 0)
        {
            _context.AiRecommendations.RemoveRange(existing);
            await _context.SaveChangesAsync();
        }
    }
}
