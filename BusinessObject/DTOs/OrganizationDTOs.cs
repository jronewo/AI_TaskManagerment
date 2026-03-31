using System;
using System.Collections.Generic;

namespace BusinessObject.DTOs;

public class OrganizationDto
{
    public int OrganizationId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Logo { get; set; }
    public int? OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class OrganizationProjectDto
{
    public int ProjectId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Status { get; set; }
    public DateOnly? Deadline { get; set; }
    public int Progress { get; set; }
    public DateOnly? PredictedEndDate { get; set; }
    public string RiskLevel { get; set; } = "LOW";
    
    // Project Manager details
    public int? PmId { get; set; }
    public string? PmName { get; set; }
    
    public bool IsEvaluated { get; set; }
    
    public int? TeamId { get; set; }
    public int TeamMemberCount { get; set; }
}

public class ProjectEvaluationDto
{
    public int EvaluationId { get; set; }
    public int ProjectId { get; set; }
    public int EvaluatorId { get; set; }
    public string EvaluatorName { get; set; } = null!;
    public int? OverallScore { get; set; }
    public int? QualityScore { get; set; }
    public int? TimelinessScore { get; set; }
    public int? CommunicationScore { get; set; }
    public string? Comment { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class CreateProjectEvaluationRequest
{
    public int EvaluatorId { get; set; }
    public int? OverallScore { get; set; }
    public int? QualityScore { get; set; }
    public int? TimelinessScore { get; set; }
    public int? CommunicationScore { get; set; }
    public string? Comment { get; set; }
}
