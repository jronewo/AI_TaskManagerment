using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface IActivityLogRepository
{
    Task<ActivityLog?> GetByIdAsync(int logId);
    Task<List<ActivityLog>> GetByUserIdAsync(int userId);
    Task<List<ActivityLog>> GetByEntityAsync(string entityType, int entityId);
    Task<List<ActivityLog>> GetByProjectAsync(int projectId, int limit = 50);
    Task<List<ActivityLog>> GetAllAsync(int limit = 50);
    Task AddAsync(ActivityLog log);
}
