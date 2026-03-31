using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class SkillRepository : ISkillRepository
{
    private readonly AppDbContext _context;

    public SkillRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Skill?> GetByIdAsync(int skillId)
    {
        return await _context.Skills
            .Include(s => s.UserSkills)
            .Include(s => s.TaskRequiredSkills)
            .FirstOrDefaultAsync(s => s.SkillId == skillId);
    }

    public async Task<List<Skill>> GetAllAsync()
    {
        return await _context.Skills.ToListAsync();
    }

    public async Task<Skill?> GetByNameAsync(string skillName)
    {
        return await _context.Skills
            .FirstOrDefaultAsync(s => s.SkillName.ToLower() == skillName.ToLower());
    }

    public async Task AddAsync(Skill skill)
    {
        await _context.Skills.AddAsync(skill);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Skill skill)
    {
        _context.Skills.Update(skill);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int skillId)
    {
        var skill = await _context.Skills.FindAsync(skillId);
        if (skill != null)
        {
            _context.Skills.Remove(skill);
            await _context.SaveChangesAsync();
        }
    }
}
