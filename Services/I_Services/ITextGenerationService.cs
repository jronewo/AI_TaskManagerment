using BusinessObject.DTOs;

namespace Services.I_Services;

public interface ITextGenerationService
{
    Task<string> GenerateTextAsync(string prompt, int maxTokens = 200);
    Task<string> GenerateAssignmentReasonAsync(string taskDescription, string userProfile);
    Task<WorkloadSuggestionResponse> SuggestWorkloadAsync(int projectId);
}
