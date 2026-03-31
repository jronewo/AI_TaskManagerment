using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class TaskComment
{
    public int CommentId { get; set; }

    public int? TaskId { get; set; }

    public int? UserId { get; set; }

    public string? Content { get; set; }

    public string? ImageUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Task? Task { get; set; }

    public virtual User? User { get; set; }
}
