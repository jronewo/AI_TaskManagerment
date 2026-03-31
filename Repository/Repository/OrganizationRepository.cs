using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class OrganizationRepository : IOrganizationRepository
{
    private readonly AppDbContext _context;

    public OrganizationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Organization?> GetByIdAsync(int organizationId)
    {
        return await _context.Organizations
            .Include(o => o.Owner)
            .FirstOrDefaultAsync(o => o.OrganizationId == organizationId);
    }

    public async Task<Organization?> GetByOwnerIdAsync(int ownerId)
    {
        return await _context.Organizations
            .Include(o => o.Owner)
            .FirstOrDefaultAsync(o => o.OwnerId == ownerId);
    }

    public async Task<List<Organization>> GetAllAsync()
    {
        return await _context.Organizations
            .Include(o => o.Owner)
            .ToListAsync();
    }

    public async Task<List<Project>> GetProjectsByOrganizationIdAsync(int organizationId)
    {
        return await _context.Projects
            .Include(p => p.Team)
                .ThenInclude(t => t.TeamMembers)
                    .ThenInclude(tm => tm.User)
            .Include(p => p.Tasks)
            .Include(p => p.ProjectEvaluations)
            .Where(p => p.OrganizationId == organizationId)
            .ToListAsync();
    }

    public async Task AddAsync(Organization organization)
    {
        await _context.Organizations.AddAsync(organization);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Organization organization)
    {
        _context.Organizations.Update(organization);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int organizationId)
    {
        var org = await GetByIdAsync(organizationId);
        if (org != null)
        {
            _context.Organizations.Remove(org);
            await _context.SaveChangesAsync();
        }
    }
}
