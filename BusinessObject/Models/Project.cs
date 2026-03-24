using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Project
{
    public int ProjectId { get; set; }

    public int? TeamId { get; set; }

    public string? Name { get; set; }

    public string? Description { get; set; }

    public string? Status { get; set; }

    public DateOnly? Deadline { get; set; }

    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();

    public virtual Team? Team { get; set; }
}
