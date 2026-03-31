using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using BusinessObject.DTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Repository.I_Repository;
using Services.I_Services;

namespace Services.Services;

public class TextGenerationService : ITextGenerationService
{
    private readonly HttpClient _httpClient;
    private readonly string _modelId;
    private readonly ILogger<TextGenerationService> _logger;
    private readonly IUserRepository _userRepository;
    private readonly ITaskRepository _taskRepository;

    public TextGenerationService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<TextGenerationService> logger,
        IUserRepository userRepository,
        ITaskRepository taskRepository)
    {
        _httpClient = httpClient;
        _logger = logger;
        _userRepository = userRepository;
        _taskRepository = taskRepository;

        var apiKey = configuration["HuggingFace:ApiKey"]
            ?? throw new InvalidOperationException("HuggingFace:ApiKey is not configured in User Secrets");
            
        _modelId = configuration["HuggingFace:TextGenerationModelId"]
            ?? "HuggingFaceH4/zephyr-7b-beta";

        _httpClient.BaseAddress = new Uri("https://router.huggingface.co/hf-inference/");
        _httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
    }

    public async Task<string> GenerateTextAsync(string prompt, int maxTokens = 200)
    {
        // HF Inference API now uses OpenAI-compatible /v1/chat/completions for text generation
        var url = $"models/{_modelId}/v1/chat/completions";
        
        try
        {
            var requestBody = new
            {
                model = _modelId,
                messages = new[]
                {
                    new { role = "user", content = prompt }
                },
                max_tokens = maxTokens,
                temperature = 0.7
            };

            var response = await _httpClient.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("HuggingFace TextGeneration API error {StatusCode}: {Body}. Falling back to default response.", response.StatusCode, errorBody);
                return $"[AI Phản hồi giả lập] Người dùng này là một ứng viên tiềm năng cho công việc này dựa trên khối lượng công việc hiện tại và sự phù hợp về kỹ năng.";
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            
            // Xử lý response dạng OpenAI: {"choices": [{"message": {"content": "..."}}]}
            using var doc = JsonDocument.Parse(responseContent);
            var root = doc.RootElement;

            if (root.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
            {
                var firstChoice = choices[0];
                if (firstChoice.TryGetProperty("message", out var message) && message.TryGetProperty("content", out var content))
                {
                    return content.GetString() ?? string.Empty;
                }
            }
            
            return $"[AI Phản hồi giả lập] Người dùng này là một ứng viên tiềm năng cho công việc này dựa trên khối lượng công việc hiện tại và sự phù hợp về kỹ năng.";
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to call HuggingFace TextGeneration API. Falling back to default response.");
            return $"[AI Phản hồi giả lập] Đang chờ phản hồi từ AI, người dùng hiện tại có các chỉ số phù hợp với yêu cầu công việc.";
        }
    }

    public async Task<string> GenerateAssignmentReasonAsync(string taskDescription, string userProfile)
    {
        var prompt = $@"Given the task description and user profile, explain briefly why this user is a good fit for this task.

Task: {taskDescription}
User Profile: {userProfile}

Reasoning:";

        var result = await GenerateTextAsync(prompt, maxTokens: 100);
        return string.IsNullOrWhiteSpace(result) ? "AI could not generate a reason." : result.Trim();
    }

    public async Task<WorkloadSuggestionResponse> SuggestWorkloadAsync(int projectId)
    {
        var teamMembers = await _userRepository.GetByTeamIdAsync(projectId);
        var pendingTasks = await _taskRepository.GetByProjectIdAsync(projectId);

        if (teamMembers.Count == 0 || pendingTasks.Count == 0)
        {
            return new WorkloadSuggestionResponse { ProjectId = projectId };
        }

        var promptBuilder = new StringBuilder();
        promptBuilder.AppendLine("Task distribution suggestion.");
        promptBuilder.AppendLine("Available Users:");
        foreach(var u in teamMembers) promptBuilder.AppendLine($"- {u.Name}");
        promptBuilder.AppendLine("\nPending Tasks:");
        foreach(var t in pendingTasks.Where(x => x.Status != "Done" && string.IsNullOrEmpty(x.Status) == false).Take(5)) 
            promptBuilder.AppendLine($"- {t.Title} (Priority: {t.Priority})");
        
        promptBuilder.AppendLine("\nSuggest assignees for these tasks:");

        var resultText = await GenerateTextAsync(promptBuilder.ToString(), 200);

        var response = new WorkloadSuggestionResponse
        {
            ProjectId = projectId,
            Suggestions = new List<WorkloadSuggestionItem>
            {
                new WorkloadSuggestionItem
                {
                    UserId = 0,
                    UserName = "AI Workload Analysis",
                    SuggestedTasks = new List<string>(),
                    Reason = resultText
                }
            }
        };

        return response;
    }
}
