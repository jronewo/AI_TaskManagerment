using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class TaskVersion
{
    public int VersionId { get; set; }

    public int? TaskId { get; set; }

    public string? Title { get; set; }

    public string? Description { get; set; }

    public string? Priority { get; set; }

    public string? Status { get; set; }

    public int? Version { get; set; }

    public int? UpdatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Task? Task { get; set; }

    public virtual User? UpdatedByNavigation { get; set; }
}
