using System;

namespace BusinessObject.DTOs;

public class ProjectDto
{
    public int ProjectId { get; set; }
    public int? CreatedBy { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Status { get; set; }
    public int? OrganizationId { get; set; }
    public string? OrganizationName { get; set; }
    public int? TeamId { get; set; }
    public string? TeamName { get; set; }
    public DateOnly? Deadline { get; set; }
    public int Progress { get; set; }
    public DateOnly? PredictedEndDate { get; set; }
    public string RiskLevel { get; set; } = "LOW";
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateProjectDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int CreatedBy { get; set; }
    public int? OrganizationId { get; set; }
    public int? TeamId { get; set; }
    public DateOnly? Deadline { get; set; }
}

public class UpdateProjectDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public int? TeamId { get; set; }
    public DateOnly? Deadline { get; set; }
}
