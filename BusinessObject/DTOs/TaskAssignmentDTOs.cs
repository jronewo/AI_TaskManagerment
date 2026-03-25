namespace BusinessObject.DTOs;

/// <summary>
/// Request để lấy AI recommendation cho 1 task
/// </summary>
public class TaskAssignmentRequest
{
    public int TaskId { get; set; }
    public int ProjectId { get; set; }
}

/// <summary>
/// Profile skill của 1 user (dùng nội bộ cho AI scoring)
/// </summary>
public class UserSkillProfile
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public List<SkillInfo> Skills { get; set; } = new();
    public int ActiveTaskCount { get; set; }
    public int TotalAvailableHours { get; set; }
    public EvaluationSummary? Evaluation { get; set; }
}

public class SkillInfo
{
    public int SkillId { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public int Level { get; set; }
}

public class EvaluationSummary
{
    public double AvgSkillScore { get; set; }
    public double AvgTeamworkScore { get; set; }
    public double AvgCommunicationScore { get; set; }
    public double AvgDeadlineScore { get; set; }
}

/// <summary>
/// Yêu cầu skill của 1 task
/// </summary>
public class TaskSkillRequirement
{
    public int SkillId { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public int RequiredLevel { get; set; }
}

/// <summary>
/// 1 gợi ý của AI cho 1 user
/// </summary>
public class AiSuggestionResult
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public double Score { get; set; }
    public string Reason { get; set; } = string.Empty;

    // Chi tiết các thành phần điểm
    public double SkillMatchScore { get; set; }
    public double SemanticSimilarityScore { get; set; }
    public double WorkloadScore { get; set; }
    public double PerformanceScore { get; set; }
}

/// <summary>
/// Response chứa danh sách gợi ý AI (ranked by score)
/// </summary>
public class TaskAssignmentResponse
{
    public int TaskId { get; set; }
    public string? TaskTitle { get; set; }
    public List<TaskSkillRequirement> RequiredSkills { get; set; } = new();
    public List<AiSuggestionResult> Suggestions { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}
