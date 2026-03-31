using BusinessObject.DTOs;
using BusinessObject.Models;
using Repository.I_Repository;
using Services.I_Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Services.Services;

public class TaskCommentService : ITaskCommentService
{
    private readonly ITaskCommentRepository _commentRepo;
    private readonly ITaskRepository _taskRepo;
    private readonly INotificationService _notificationService;

    public TaskCommentService(
        ITaskCommentRepository commentRepo,
        ITaskRepository taskRepo,
        INotificationService notificationService)
    {
        _commentRepo = commentRepo;
        _taskRepo = taskRepo;
        _notificationService = notificationService;
    }

    public async Task<List<TaskCommentDto>> GetTaskCommentsAsync(int taskId)
    {
        var comments = await _commentRepo.GetByTaskIdAsync(taskId);
        return comments.Select(c => new TaskCommentDto
        {
            CommentId = c.CommentId,
            TaskId = c.TaskId,
            UserId = c.UserId,
            UserName = c.User?.Name,
            UserAvatar = c.User?.Avatar,
            Content = c.Content,
            ImageUrl = c.ImageUrl,
            CreatedAt = c.CreatedAt
        }).ToList();
    }

    public async Task<TaskCommentDto> AddCommentAsync(CreateTaskCommentDto request)
    {
        var comment = new TaskComment
        {
            TaskId = request.TaskId,
            UserId = request.UserId,
            Content = request.Content,
            ImageUrl = request.ImageUrl,
            CreatedAt = DateTime.Now
        };

        await _commentRepo.AddAsync(comment);
        
        var newComment = await _commentRepo.GetByIdAsync(comment.CommentId);

        // Create notifications for all task assignees (except the commenter)
        try
        {
            var assignees = await _taskRepo.GetTaskAssigneesAsync(request.TaskId);
            var task = await _taskRepo.GetByIdAsync(request.TaskId);
            var commenterName = newComment?.User?.Name ?? "Ai đó";
            var taskTitle = task?.Title ?? $"Task #{request.TaskId}";

            foreach (var assignee in assignees)
            {
                if (assignee.UserId != request.UserId && assignee.UserId.HasValue)
                {
                    await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                    {
                        UserId = assignee.UserId.Value,
                        Type = "COMMENT",
                        Title = $"💬 Bình luận mới trên \"{taskTitle}\"",
                        Message = $"{commenterName} đã bình luận: {(request.Content?.Length > 80 ? request.Content[..80] + "..." : request.Content ?? "📷 Ảnh đính kèm")}",
                        ReferenceId = request.TaskId,
                        ReferenceType = "TASK"
                    });
                }
            }

            // Also notify the task creator if they are not the commenter and not an assignee
            if (task?.CreatedBy != null && task.CreatedBy != request.UserId
                && !assignees.Any(a => a.UserId == task.CreatedBy))
            {
                await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = task.CreatedBy.Value,
                    Type = "COMMENT",
                    Title = $"💬 Bình luận mới trên \"{taskTitle}\"",
                    Message = $"{commenterName} đã bình luận: {(request.Content?.Length > 80 ? request.Content[..80] + "..." : request.Content ?? "📷 Ảnh đính kèm")}",
                    ReferenceId = request.TaskId,
                    ReferenceType = "TASK"
                });
            }
        }
        catch (Exception)
        {
            // Don't fail comment creation if notification fails
        }

        return new TaskCommentDto
        {
            CommentId = newComment!.CommentId,
            TaskId = newComment.TaskId,
            UserId = newComment.UserId,
            UserName = newComment.User?.Name,
            UserAvatar = newComment.User?.Avatar,
            Content = newComment.Content,
            ImageUrl = newComment.ImageUrl,
            CreatedAt = newComment.CreatedAt
        };
    }

    public async Task<bool> DeleteCommentAsync(int commentId)
    {
        await _commentRepo.DeleteAsync(commentId);
        return true;
    }
}
