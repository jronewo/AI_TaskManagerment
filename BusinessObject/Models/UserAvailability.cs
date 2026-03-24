using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class UserAvailability
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    public int? DayOfWeek { get; set; }

    public int? AvailableHours { get; set; }

    public virtual User? User { get; set; }
}
