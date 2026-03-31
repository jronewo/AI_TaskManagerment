using BusinessObject.DTOs;
using BusinessObject.Models;
using Repository.I_Repository;
using Services.I_Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Services.Services;

public class SkillService : ISkillService
{
    private readonly ISkillRepository _skillRepo;
    private readonly IUserSkillRepository _userSkillRepo;

    public SkillService(ISkillRepository skillRepo, IUserSkillRepository userSkillRepo)
    {
        _skillRepo = skillRepo;
        _userSkillRepo = userSkillRepo;
    }

    public async Task<List<SkillDto>> GetAllSkillsAsync()
    {
        var skills = await _skillRepo.GetAllAsync();
        return skills.Select(s => new SkillDto
        {
            SkillId = s.SkillId,
            SkillName = s.SkillName ?? "Unknown Skill"
        }).ToList();
    }

    public async Task<SkillDto?> GetSkillByIdAsync(int skillId)
    {
        var s = await _skillRepo.GetByIdAsync(skillId);
        if (s == null) return null;
        return new SkillDto { SkillId = s.SkillId, SkillName = s.SkillName ?? "Unknown Skill" };
    }

    public async Task<SkillDto> CreateSkillAsync(CreateSkillDto request)
    {
        var existing = await _skillRepo.GetByNameAsync(request.SkillName);
        if (existing != null) return new SkillDto { SkillId = existing.SkillId, SkillName = existing.SkillName ?? "Unknown Skill" };

        var s = new Skill { SkillName = request.SkillName };
        await _skillRepo.AddAsync(s);
        return new SkillDto { SkillId = s.SkillId, SkillName = s.SkillName ?? "Unknown Skill" };
    }

    public async Task<List<UserSkillDto>> GetUserSkillsAsync(int userId)
    {
        var userSkills = await _userSkillRepo.GetByUserIdAsync(userId);
        return userSkills.Select(us => new UserSkillDto
        {
            Id = us.Id,
            UserId = us.UserId ?? 0,
            UserName = us.User?.Name,
            SkillId = us.SkillId ?? 0,
            SkillName = us.Skill?.SkillName,
            Level = us.Level
        }).ToList();
    }

    public async Task<bool> AddUserSkillAsync(AddUserSkillDto request)
    {
        var existing = await _userSkillRepo.GetByUserIdAsync(request.UserId);
        if (existing.Any(us => us.SkillId == request.SkillId)) return false;

        await _userSkillRepo.AddAsync(new UserSkill
        {
            UserId = request.UserId,
            SkillId = request.SkillId,
            Level = request.Level
        });
        return true;
    }

    public async Task<bool> UpdateUserSkillLevelAsync(int userSkillId, int newLevel)
    {
        var us = await _userSkillRepo.GetByIdAsync(userSkillId);
        if (us == null) return false;
        us.Level = newLevel;
        await _userSkillRepo.UpdateAsync(us);
        return true;
    }

    public async Task<bool> RemoveUserSkillAsync(int userSkillId)
    {
        await _userSkillRepo.DeleteAsync(userSkillId);
        return true;
    }
}
