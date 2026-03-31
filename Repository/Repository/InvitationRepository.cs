using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class InvitationRepository : IInvitationRepository
{
    private readonly AppDbContext _context;

    public InvitationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Invitation?> GetByIdAsync(int invitationId)
    {
        return await _context.Invitations
            .Include(i => i.Team)
            .FirstOrDefaultAsync(i => i.InvitationId == invitationId);
    }

    public async Task<List<Invitation>> GetByTeamIdAsync(int teamId)
    {
        return await _context.Invitations
            .Where(i => i.TeamId == teamId)
            .OrderByDescending(i => i.InvitationId)
            .ToListAsync();
    }

    public async Task<List<Invitation>> GetByEmailAsync(string email)
    {
        return await _context.Invitations
            .Where(i => i.Email == email)
            .Include(i => i.Team)
            .ToListAsync();
    }

    public async Task AddAsync(Invitation invitation)
    {
        await _context.Invitations.AddAsync(invitation);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Invitation invitation)
    {
        _context.Invitations.Update(invitation);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int invitationId)
    {
        var invitation = await _context.Invitations.FindAsync(invitationId);
        if (invitation != null)
        {
            _context.Invitations.Remove(invitation);
            await _context.SaveChangesAsync();
        }
    }
}
