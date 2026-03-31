using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Models;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface ITaskRequiredSkillRepository
{
    Task<List<TaskRequiredSkill>> GetByTaskIdAsync(int taskId);
    Task ReplaceTaskSkillsAsync(int taskId, List<int> skillIds);
}
