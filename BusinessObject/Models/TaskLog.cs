using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class TaskLog
{
    public int LogId { get; set; }

    public int? TaskId { get; set; }

    public int? Progress { get; set; }

    public string? Note { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Task? Task { get; set; }
}
