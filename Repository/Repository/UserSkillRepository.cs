using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class UserSkillRepository : IUserSkillRepository
{
    private readonly AppDbContext _context;

    public UserSkillRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UserSkill?> GetByIdAsync(int id)
    {
        return await _context.UserSkills
            .Include(us => us.Skill)
            .Include(us => us.User)
            .FirstOrDefaultAsync(us => us.Id == id);
    }

    public async Task<List<UserSkill>> GetByUserIdAsync(int userId)
    {
        return await _context.UserSkills
            .Where(us => us.UserId == userId)
            .Include(us => us.Skill)
            .ToListAsync();
    }

    public async Task AddAsync(UserSkill userSkill)
    {
        await _context.UserSkills.AddAsync(userSkill);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(UserSkill userSkill)
    {
        _context.UserSkills.Update(userSkill);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var userSkill = await _context.UserSkills.FindAsync(id);
        if (userSkill != null)
        {
            _context.UserSkills.Remove(userSkill);
            await _context.SaveChangesAsync();
        }
    }
}
