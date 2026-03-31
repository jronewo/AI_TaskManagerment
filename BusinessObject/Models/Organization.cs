using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Organization
{
    public int OrganizationId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string? Logo { get; set; }

    public int? OwnerId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User? Owner { get; set; }

    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
}
