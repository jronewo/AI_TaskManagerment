using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class AiAnalysis
{
    public int Id { get; set; }

    public int? TaskId { get; set; }

    public string? AnalysisType { get; set; }

    public string? Content { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Task? Task { get; set; }
}
