using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class ProjectRepository : IProjectRepository
{
    private readonly AppDbContext _context;

    public ProjectRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Project?> GetByIdAsync(int projectId)
    {
        return await _context.Projects
            .Include(p => p.Team)
            .Include(p => p.Organization)
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.ProjectId == projectId);
    }

    public async Task<List<Project>> GetAllAsync()
    {
        return await _context.Projects
            .Include(p => p.Organization)
            .Include(p => p.Team)
            .ToListAsync();
    }

    public async Task<List<Project>> GetProjectsByUserIdAsync(int userId)
    {
        return await _context.Projects
            .Include(p => p.Organization)
            .Include(p => p.Team)
            .Where(p => p.CreatedBy == userId || (p.Team != null && p.Team.TeamMembers.Any(m => m.UserId == userId)))
            .ToListAsync();
    }

    public async Task<List<Project>> GetProjectsByOrgIdAsync(int orgId)
    {
        return await _context.Projects
            .Where(p => p.OrganizationId == orgId)
            .Include(p => p.Team)
            .ToListAsync();
    }

    public async Task AddAsync(Project project)
    {
        await _context.Projects.AddAsync(project);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Project project)
    {
        _context.Projects.Update(project);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int projectId)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project != null)
        {
            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
        }
    }
}
