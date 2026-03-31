using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class TeamMemberRepository : ITeamMemberRepository
{
    private readonly AppDbContext _context;

    public TeamMemberRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TeamMember?> GetByIdAsync(int id)
    {
        return await _context.TeamMembers
            .Include(tm => tm.User)
            .Include(tm => tm.Team)
            .FirstOrDefaultAsync(tm => tm.Id == id);
    }

    public async Task<List<TeamMember>> GetByTeamIdAsync(int teamId)
    {
        return await _context.TeamMembers
            .Where(tm => tm.TeamId == teamId)
            .Include(tm => tm.User)
            .ToListAsync();
    }

    public async Task<List<TeamMember>> GetByUserIdAsync(int userId)
    {
        return await _context.TeamMembers
            .Where(tm => tm.UserId == userId)
            .Include(tm => tm.Team)
            .ToListAsync();
    }

    public async Task AddAsync(TeamMember teamMember)
    {
        await _context.TeamMembers.AddAsync(teamMember);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(TeamMember teamMember)
    {
        _context.TeamMembers.Update(teamMember);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var teamMember = await _context.TeamMembers.FindAsync(id);
        if (teamMember != null)
        {
            _context.TeamMembers.Remove(teamMember);
            await _context.SaveChangesAsync();
        }
    }
}
