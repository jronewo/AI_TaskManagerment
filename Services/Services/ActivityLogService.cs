using BusinessObject.DTOs;
using BusinessObject.Models;
using Repository.I_Repository;
using Services.I_Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Services.Services;

public class ActivityLogService : IActivityLogService
{
    private readonly IActivityLogRepository _logRepo;
    private readonly IUserRepository _userRepo;

    public ActivityLogService(IActivityLogRepository logRepo, IUserRepository userRepo)
    {
        _logRepo = logRepo;
        _userRepo = userRepo;
    }

    public async Task<List<ActivityLogDto>> GetUserActivitiesAsync(int userId)
    {
        var logs = await _logRepo.GetByUserIdAsync(userId);
        var user = await _userRepo.GetByIdAsync(userId);
        
        return logs.Select(l => new ActivityLogDto
        {
            LogId = l.LogId,
            UserId = l.UserId,
            UserName = user?.Name,
            Action = l.Action,
            EntityType = l.EntityType,
            EntityId = l.EntityId,
            CreatedAt = l.CreatedAt
        }).ToList();
    }

    public async Task<List<ActivityLogDto>> GetEntityActivitiesAsync(string entityType, int entityId)
    {
        var logs = await _logRepo.GetByEntityAsync(entityType, entityId);
        return logs.Select(l => new ActivityLogDto
        {
            LogId = l.LogId,
            UserId = l.UserId,
            Action = l.Action,
            EntityType = l.EntityType,
            EntityId = l.EntityId,
            CreatedAt = l.CreatedAt
        }).ToList();
    }

    public async Task<List<ActivityLogDto>> GetAllActivitiesAsync(int limit = 50)
    {
        var logs = await _logRepo.GetAllAsync(limit);
        
        // Batch fetch user names
        var userIds = logs.Where(l => l.UserId.HasValue).Select(l => l.UserId!.Value).Distinct().ToList();
        var users = new Dictionary<int, string>();
        foreach (var uid in userIds)
        {
            var u = await _userRepo.GetByIdAsync(uid);
            if (u != null) users[uid] = u.Name ?? "Unknown";
        }

        return logs.Select(l => new ActivityLogDto
        {
            LogId = l.LogId,
            UserId = l.UserId,
            UserName = l.UserId.HasValue && users.ContainsKey(l.UserId.Value) ? users[l.UserId.Value] : null,
            Action = l.Action,
            EntityType = l.EntityType,
            EntityId = l.EntityId,
            CreatedAt = l.CreatedAt
        }).ToList();
    }

    public async Task<List<ActivityLogDto>> GetProjectActivitiesAsync(int projectId, int limit = 50)
    {
        var logs = await _logRepo.GetByProjectAsync(projectId, limit);
        
        // Batch fetch user names
        var userIds = logs.Where(l => l.UserId.HasValue).Select(l => l.UserId!.Value).Distinct().ToList();
        var users = new Dictionary<int, string>();
        foreach (var uid in userIds)
        {
            var u = await _userRepo.GetByIdAsync(uid);
            if (u != null) users[uid] = u.Name ?? "Unknown";
        }

        return logs.Select(l => new ActivityLogDto
        {
            LogId = l.LogId,
            UserId = l.UserId,
            UserName = l.UserId.HasValue && users.ContainsKey(l.UserId.Value) ? users[l.UserId.Value] : null,
            Action = l.Action,
            EntityType = l.EntityType,
            EntityId = l.EntityId,
            CreatedAt = l.CreatedAt
        }).ToList();
    }

    public async Task LogActionAsync(int? userId, string action, string entityType, int entityId)
    {
        await _logRepo.AddAsync(new ActivityLog
        {
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            CreatedAt = DateTime.UtcNow
        });
    }
}
