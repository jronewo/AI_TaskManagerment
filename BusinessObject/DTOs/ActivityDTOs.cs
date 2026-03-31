using System;

namespace BusinessObject.DTOs;

public class ActivityLogDto
{
    public int LogId { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public string? Action { get; set; }
    public string? EntityType { get; set; }
    public int? EntityId { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class TaskCommentDto
{
    public int CommentId { get; set; }
    public int? TaskId { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserAvatar { get; set; }
    public string? Content { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class CreateTaskCommentDto
{
    public int TaskId { get; set; }
    public int UserId { get; set; }
    public string? Content { get; set; }
    public string? ImageUrl { get; set; }
}
