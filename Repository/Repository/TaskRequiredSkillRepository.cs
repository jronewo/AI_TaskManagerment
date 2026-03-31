using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repository.I_Repository;
using Task = System.Threading.Tasks.Task;

namespace Repository.Repository;

public class TaskRequiredSkillRepository : ITaskRequiredSkillRepository
{
    private readonly AppDbContext _context;

    public TaskRequiredSkillRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<TaskRequiredSkill>> GetByTaskIdAsync(int taskId)
    {
        return await _context.TaskRequiredSkills
            .Where(trs => trs.TaskId == taskId)
            .Include(trs => trs.Skill)
            .ToListAsync();
    }

    public async Task ReplaceTaskSkillsAsync(int taskId, List<int> skillIds)
    {
        var existing = await _context.TaskRequiredSkills.Where(trs => trs.TaskId == taskId).ToListAsync();
        _context.TaskRequiredSkills.RemoveRange(existing);
        
        var newSkills = skillIds.Select(skillId => new TaskRequiredSkill
        {
            TaskId = taskId,
            SkillId = skillId
        });
        
        await _context.TaskRequiredSkills.AddRangeAsync(newSkills);
        await _context.SaveChangesAsync();
    }
}
