using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class TeamRepository : ITeamRepository
{
    private readonly AppDbContext _context;

    public TeamRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Team?> GetByIdAsync(int teamId)
    {
        return await _context.Teams
            .Include(t => t.TeamMembers)
            .ThenInclude(tm => tm.User)
            .Include(t => t.Projects)
            .FirstOrDefaultAsync(t => t.TeamId == teamId);
    }

    public async Task<List<Team>> GetAllAsync()
    {
        return await _context.Teams
            .Include(t => t.CreatedByNavigation)
            .Include(t => t.TeamMembers)
            .ThenInclude(tm => tm.User)
            .ToListAsync();
    }

    public async Task<List<Team>> GetTeamsByCreatorIdAsync(int userId)
    {
        return await _context.Teams
            .Where(t => t.CreatedBy == userId)
            .Include(t => t.TeamMembers)
            .ToListAsync();
    }

    public async Task AddAsync(Team team)
    {
        await _context.Teams.AddAsync(team);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Team team)
    {
        _context.Teams.Update(team);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int teamId)
    {
        var team = await _context.Teams.FindAsync(teamId);
        if (team != null)
        {
            _context.Teams.Remove(team);
            await _context.SaveChangesAsync();
        }
    }
}
