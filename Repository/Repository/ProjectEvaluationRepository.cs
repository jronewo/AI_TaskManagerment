using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class ProjectEvaluationRepository : IProjectEvaluationRepository
{
    private readonly AppDbContext _context;

    public ProjectEvaluationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ProjectEvaluation?> GetByProjectIdAsync(int projectId)
    {
        return await _context.ProjectEvaluations
            .Include(pe => pe.Evaluator)
            .FirstOrDefaultAsync(pe => pe.ProjectId == projectId);
    }

    public async Task<ProjectEvaluation?> GetByIdAsync(int evaluationId)
    {
        return await _context.ProjectEvaluations
            .Include(pe => pe.Evaluator)
            .FirstOrDefaultAsync(pe => pe.EvaluationId == evaluationId);
    }

    public async Task<bool> ExistsByProjectIdAsync(int projectId)
    {
        return await _context.ProjectEvaluations.AnyAsync(pe => pe.ProjectId == projectId);
    }

    public async Task AddAsync(ProjectEvaluation evaluation)
    {
        await _context.ProjectEvaluations.AddAsync(evaluation);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(ProjectEvaluation evaluation)
    {
        _context.ProjectEvaluations.Update(evaluation);
        await _context.SaveChangesAsync();
    }
}
