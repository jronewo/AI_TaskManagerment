using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Task
{
    public int TaskId { get; set; }

    public int? ProjectId { get; set; }

    public string? Title { get; set; }

    public string? Description { get; set; }

    public string? Priority { get; set; }

    public string? Status { get; set; }

    public DateOnly? Deadline { get; set; }

    public int? EstimatedTime { get; set; }

    public int? Difficulty { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public int? Version { get; set; }

    public int? Progress { get; set; }

    public string? RiskLevel { get; set; }

    public string? AiSummary { get; set; }

    public virtual ICollection<AiAnalysis> AiAnalyses { get; set; } = new List<AiAnalysis>();

    public virtual ICollection<AiRecommendation> AiRecommendations { get; set; } = new List<AiRecommendation>();

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Project? Project { get; set; }

    public virtual ICollection<TaskAssignee> TaskAssignees { get; set; } = new List<TaskAssignee>();

    public virtual ICollection<TaskComment> TaskComments { get; set; } = new List<TaskComment>();

    public virtual ICollection<TaskRequiredSkill> TaskRequiredSkills { get; set; } = new List<TaskRequiredSkill>();

    public virtual ICollection<TaskVersion> TaskVersions { get; set; } = new List<TaskVersion>();

    public virtual TaskEmbedding? TaskEmbedding { get; set; }

    public virtual ICollection<TaskLog> TaskLogs { get; set; } = new List<TaskLog>();
}
