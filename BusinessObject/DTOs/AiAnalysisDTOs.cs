using System;

namespace BusinessObject.DTOs;

public class AiAnalysisResponse
{
    public int Id { get; set; }
    public int? TaskId { get; set; }
    public string? AnalysisType { get; set; }
    public string? Content { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class UpdateProgressRequest
{
    public int Progress { get; set; }
    public string? Note { get; set; }
    public string? Risk { get; set; }
}

public class TaskLogResponse
{
    public int LogId { get; set; }
    public int? TaskId { get; set; }
    public int? Progress { get; set; }
    public string? Note { get; set; }
    public string? Risk { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class AcceptRecommendationRequest
{
    public int TaskId { get; set; }
    public int UserId { get; set; }
}
