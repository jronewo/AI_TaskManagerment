using BusinessObject.DTOs;

namespace Services.I_Services;

public interface ITaskAssignmentService
{
    /// <summary>
    /// Phân tích skill team members và gợi ý phân công task dựa trên AI scoring
    /// </summary>
    Task<TaskAssignmentResponse> GetRecommendationsAsync(int taskId, int projectId);

    /// <summary>
    /// Xác nhận phân công user cho task
    /// </summary>
    Task<bool> AcceptRecommendationAsync(int taskId, int userId);
}
