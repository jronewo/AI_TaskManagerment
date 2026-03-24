using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Evaluation
{
    public int EvaluationId { get; set; }

    public int? UserId { get; set; }

    public int? LeaderId { get; set; }

    public int? SkillScore { get; set; }

    public int? TeamworkScore { get; set; }

    public int? CommunicationScore { get; set; }

    public int? DeadlineScore { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? Leader { get; set; }

    public virtual User? User { get; set; }
}
