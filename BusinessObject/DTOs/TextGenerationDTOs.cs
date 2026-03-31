namespace BusinessObject.DTOs;

public class GenerateTextRequest
{
    public string Prompt { get; set; } = string.Empty;
    public int MaxTokens { get; set; } = 200;
}

public class GenerateTextResponse
{
    public string GeneratedText { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
}

public class AssignmentReasonRequest
{
    public string TaskDescription { get; set; } = string.Empty;
    public string UserProfile { get; set; } = string.Empty;
}

public class WorkloadSuggestionRequest
{
    public int ProjectId { get; set; }
}

public class WorkloadSuggestionResponse
{
    public int ProjectId { get; set; }
    public List<WorkloadSuggestionItem> Suggestions { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

public class WorkloadSuggestionItem
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public List<string> SuggestedTasks { get; set; } = new();
    public string Reason { get; set; } = string.Empty;
}
