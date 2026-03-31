using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface ISkillRepository
{
    Task<Skill?> GetByIdAsync(int skillId);
    Task<List<Skill>> GetAllAsync();
    Task<Skill?> GetByNameAsync(string skillName);
    Task AddAsync(Skill skill);
    Task UpdateAsync(Skill skill);
    Task DeleteAsync(int skillId);
}
