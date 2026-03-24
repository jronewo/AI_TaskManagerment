using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class AiRecommendation
{
    public int Id { get; set; }

    public int? TaskId { get; set; }

    public int? SuggestedUserId { get; set; }

    public double? Score { get; set; }

    public string? Reason { get; set; }

    public virtual User? SuggestedUser { get; set; }

    public virtual Task? Task { get; set; }
}
