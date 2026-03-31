using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface IUserSkillRepository
{
    Task<UserSkill?> GetByIdAsync(int id);
    Task<List<UserSkill>> GetByUserIdAsync(int userId);
    Task AddAsync(UserSkill userSkill);
    Task UpdateAsync(UserSkill userSkill);
    Task DeleteAsync(int id);
}
