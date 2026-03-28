using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;

namespace Repository.Repository;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int userId)
    {
        return await _context.Users.FindAsync(userId);
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _context.Users
            .Where(u => u.Status == 1 && u.DeletedAt == null)
            .ToListAsync();
    }
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.SingleOrDefaultAsync(u =>u.Email == email && u.Status == 1 && u.DeletedAt == null);
    }
    public async System.Threading.Tasks.Task AddUserAsync(User user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
    }

    public async Task<List<User>> GetByTeamIdAsync(int teamId)
    {
        return await _context.TeamMembers
            .Where(tm => tm.TeamId == teamId)
            .Include(tm => tm.User)
            .Select(tm => tm.User!)
            .Where(u => u.Status == 1 && u.DeletedAt == null)
            .ToListAsync();
    }

    public async Task<List<UserSkill>> GetUserSkillsAsync(int userId)
    {
        return await _context.UserSkills
            .Where(us => us.UserId == userId)
            .Include(us => us.Skill)
            .ToListAsync();
    }

    public async Task<List<UserAvailability>> GetUserAvailabilityAsync(int userId)
    {
        return await _context.UserAvailabilities
            .Where(ua => ua.UserId == userId)
            .ToListAsync();
    }

    public async Task<List<Evaluation>> GetUserEvaluationsAsync(int userId)
    {
        return await _context.Evaluations
            .Where(e => e.UserId == userId)
            .ToListAsync();
    }

    public async Task<int> CountActiveTasksByUserAsync(int userId)
    {
        return await _context.TaskAssignees
            .Where(ta => ta.UserId == userId)
            .Include(ta => ta.Task)
            .CountAsync(ta => ta.Task != null && ta.Task.Status != "Done" && ta.Task.Status != "Cancelled");
    }
}
