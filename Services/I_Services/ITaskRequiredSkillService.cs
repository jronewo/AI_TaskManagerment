using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Models;
using Task = System.Threading.Tasks.Task;

namespace Services.I_Services;

public interface ITaskRequiredSkillService
{
    Task<List<TaskRequiredSkill>> GetTaskSkillsAsync(int taskId);
    Task ReplaceTaskSkillsAsync(int taskId, List<int> skillIds);
}
