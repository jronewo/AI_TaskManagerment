using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Invitation
{
    public int InvitationId { get; set; }

    public int? TeamId { get; set; }

    public string? Email { get; set; }

    public string? Status { get; set; }

    public virtual Team? Team { get; set; }
}
