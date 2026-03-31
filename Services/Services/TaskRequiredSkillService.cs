using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Models;
using Repository.I_Repository;
using Services.I_Services;
using Task = System.Threading.Tasks.Task;

namespace Services.Services;

public class TaskRequiredSkillService : ITaskRequiredSkillService
{
    private readonly ITaskRequiredSkillRepository _taskRequiredSkillRepository;

    public TaskRequiredSkillService(ITaskRequiredSkillRepository taskRequiredSkillRepository)
    {
        _taskRequiredSkillRepository = taskRequiredSkillRepository;
    }

    public async Task<List<TaskRequiredSkill>> GetTaskSkillsAsync(int taskId)
    {
        return await _taskRequiredSkillRepository.GetByTaskIdAsync(taskId);
    }

    public async Task ReplaceTaskSkillsAsync(int taskId, List<int> skillIds)
    {
        await _taskRequiredSkillRepository.ReplaceTaskSkillsAsync(taskId, skillIds);
    }
}
