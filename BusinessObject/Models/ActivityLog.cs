using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class ActivityLog
{
    public int LogId { get; set; }

    public int? UserId { get; set; }

    public string? Action { get; set; }

    public string? EntityType { get; set; }

    public int? EntityId { get; set; }

    public DateTime? CreatedAt { get; set; }
}
