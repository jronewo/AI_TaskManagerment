using System;
using System.Collections.Generic;

namespace BusinessObject.DTOs;

public class CreateTaskDto
{
    public int ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Priority { get; set; }
    public string? Deadline { get; set; }
    public int? Difficulty { get; set; }
}

public class UpdateTaskDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public string? Deadline { get; set; }
    public int? EstimatedTime { get; set; }
    public int? ActualTime { get; set; }
    public int? Difficulty { get; set; }
}

public class TaskDetailDto
{
    public int TaskId { get; set; }
    public int? ProjectId { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public DateOnly? Deadline { get; set; }
    public int? EstimatedTime { get; set; }
    public int? AiEstimatedTime { get; set; }
    public int? ActualTime { get; set; }
    public int? Progress { get; set; }
    public string? RiskLevel { get; set; }
    public string? AiSummary { get; set; }
    public DateTime? CreatedAt { get; set; }
    public int? CreatedBy { get; set; }

    public List<TaskAssigneeDto> Assignees { get; set; } = new();
    public List<TaskDependencyDto> Dependencies { get; set; } = new();
    public List<int> RequiredSkillIds { get; set; } = new();
}

public class TaskAssigneeDto
{
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public string? Avatar { get; set; }
}

public class TaskDependencyDto
{
    public int DependencyId { get; set; }
    public int DependsOnTaskId { get; set; }
    public string? DependsOnTaskTitle { get; set; }
    public string? Status { get; set; }
}

public class UpdateProgressDto
{
    public string? Status { get; set; }
    public int? Progress { get; set; }
    public string? RiskLevel { get; set; }
    public int? ActualTime { get; set; }
}

public class AddDependencyDto
{
    public int DependsOnTaskId { get; set; }
}

public class DependencyGraphDto
{
    public List<GraphNodeDto> Nodes { get; set; } = new();
    public List<GraphEdgeDto> Edges { get; set; } = new();
}

public class GraphNodeDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Status { get; set; }
}

public class GraphEdgeDto
{
    public string Id { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public string Target { get; set; } = string.Empty;
}

public class TaskSkillRequest
{
    public List<int> SkillIds { get; set; } = new();
}
