using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class ProjectEvaluation
{
    public int EvaluationId { get; set; }

    public int ProjectId { get; set; }

    public int EvaluatorId { get; set; }

    public int? OverallScore { get; set; }

    public int? QualityScore { get; set; }

    public int? TimelinessScore { get; set; }

    public int? CommunicationScore { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User Evaluator { get; set; } = null!;

    public virtual Project Project { get; set; } = null!;
}
