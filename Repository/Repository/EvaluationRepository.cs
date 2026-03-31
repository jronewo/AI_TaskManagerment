using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class EvaluationRepository : IEvaluationRepository
{
    private readonly AppDbContext _context;

    public EvaluationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Evaluation?> GetByIdAsync(int evaluationId)
    {
        return await _context.Evaluations
            .Include(e => e.User)
            .Include(e => e.Leader)
            .FirstOrDefaultAsync(e => e.EvaluationId == evaluationId);
    }

    public async Task<List<Evaluation>> GetByUserIdAsync(int userId)
    {
        return await _context.Evaluations
            .Where(e => e.UserId == userId)
            .Include(e => e.Leader)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Evaluation>> GetByLeaderIdAsync(int leaderId)
    {
        return await _context.Evaluations
            .Where(e => e.LeaderId == leaderId)
            .Include(e => e.User)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(Evaluation evaluation)
    {
        await _context.Evaluations.AddAsync(evaluation);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Evaluation evaluation)
    {
        _context.Evaluations.Update(evaluation);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int evaluationId)
    {
        var evaluation = await _context.Evaluations.FindAsync(evaluationId);
        if (evaluation != null)
        {
            _context.Evaluations.Remove(evaluation);
            await _context.SaveChangesAsync();
        }
    }
}
