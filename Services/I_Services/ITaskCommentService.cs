using BusinessObject.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.I_Services;

public interface ITaskCommentService
{
    Task<List<TaskCommentDto>> GetTaskCommentsAsync(int taskId);
    Task<TaskCommentDto> AddCommentAsync(CreateTaskCommentDto request);
    Task<bool> DeleteCommentAsync(int commentId);
}
