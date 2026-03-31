using BusinessObject.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.I_Services;

public interface ISkillService
{
    Task<List<SkillDto>> GetAllSkillsAsync();
    Task<SkillDto?> GetSkillByIdAsync(int skillId);
    Task<SkillDto> CreateSkillAsync(CreateSkillDto request);
    Task<List<UserSkillDto>> GetUserSkillsAsync(int userId);
    Task<bool> AddUserSkillAsync(AddUserSkillDto request);
    Task<bool> UpdateUserSkillLevelAsync(int userSkillId, int newLevel);
    Task<bool> RemoveUserSkillAsync(int userSkillId);
}
