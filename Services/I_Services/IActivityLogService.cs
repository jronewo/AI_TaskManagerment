using BusinessObject.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Services.I_Services;

public interface IActivityLogService
{
    Task<List<ActivityLogDto>> GetUserActivitiesAsync(int userId);
    Task<List<ActivityLogDto>> GetEntityActivitiesAsync(string entityType, int entityId);
    Task<List<ActivityLogDto>> GetAllActivitiesAsync(int limit = 50);
    Task<List<ActivityLogDto>> GetProjectActivitiesAsync(int projectId, int limit = 50);
    Task LogActionAsync(int? userId, string action, string entityType, int entityId);
}
