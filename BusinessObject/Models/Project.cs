using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Project
{
    public int ProjectId { get; set; }

    public int? TeamId { get; set; }

    public int? CreatedBy { get; set; }

    public string? Name { get; set; }

    public string? Description { get; set; }

    public string? Status { get; set; }

    public DateOnly? Deadline { get; set; }
    
    public int? OrganizationId { get; set; }
    
    public int? Progress { get; set; }
    
    public DateOnly? PredictedEndDate { get; set; }
    
    public DateTime? CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();

    public virtual Team? Team { get; set; }
    
    public virtual User? CreatedByNavigation { get; set; }
    
    public virtual Organization? Organization { get; set; }

    public virtual ICollection<ProjectEvaluation> ProjectEvaluations { get; set; } = new List<ProjectEvaluation>();
}
