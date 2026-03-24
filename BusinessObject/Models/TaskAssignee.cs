using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class TaskAssignee
{
    public int Id { get; set; }

    public int? TaskId { get; set; }

    public int? UserId { get; set; }

    public virtual Task? Task { get; set; }

    public virtual User? User { get; set; }
}
