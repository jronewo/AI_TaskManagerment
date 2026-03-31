using System.Net.Http.Json;
using System.Text.Json;
using BusinessObject.DTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Repository.I_Repository;
using Services.I_Services;

namespace Services.Services;

public class ClassificationService : IClassificationService
{
    private readonly HttpClient _httpClient;
    private readonly string _modelId;
    private readonly ILogger<ClassificationService> _logger;
    private readonly ITaskRepository _taskRepository;

    public ClassificationService(
        HttpClient httpClient, 
        IConfiguration configuration, 
        ILogger<ClassificationService> logger,
        ITaskRepository taskRepository)
    {
        _httpClient = httpClient;
        _logger = logger;
        _taskRepository = taskRepository;

        var apiKey = configuration["HuggingFace:ApiKey"]
            ?? throw new InvalidOperationException("HuggingFace:ApiKey is not configured in User Secrets");
            
        _modelId = configuration["HuggingFace:ClassificationModelId"]
            ?? "facebook/bart-large-mnli";

        _httpClient.BaseAddress = new Uri("https://router.huggingface.co/hf-inference/");
        _httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
    }

    public async Task<TaskClassificationResponse> ClassifyTaskAsync(int taskId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null)
            throw new ArgumentException($"Task {taskId} not found");

        var textToClassify = $"Task: {task.Title}. Description: {task.Description}";

        // 1. Phân loại Task Type
        var typeLabels = new[] { "frontend", "backend", "devops" };
        var typeScores = await ClassifyZeroShotAsync(textToClassify, typeLabels);
        var bestType = typeScores.OrderByDescending(x => x.Confidence).FirstOrDefault();

        // 2. Phân loại Difficulty
        var difficultyLabels = new[] { "easy", "medium", "hard" };
        var difficultyScores = await ClassifyZeroShotAsync(textToClassify, difficultyLabels);
        var bestDifficulty = difficultyScores.OrderByDescending(x => x.Confidence).FirstOrDefault();

        var allScores = new List<ClassificationScore>();
        allScores.AddRange(typeScores);
        allScores.AddRange(difficultyScores);

        return new TaskClassificationResponse
        {
            TaskId = taskId,
            TaskType = bestType?.Label ?? "unknown",
            TaskTypeConfidence = bestType?.Confidence ?? 0,
            Difficulty = bestDifficulty?.Label ?? "unknown",
            DifficultyConfidence = bestDifficulty?.Confidence ?? 0,
            AllScores = allScores
        };
    }

    public async Task<ClassificationScore[]> ClassifyZeroShotAsync(string text, string[] candidateLabels)
    {
        var url = $"models/{_modelId}";
        
        try
        {
            var requestBody = new
            {
                inputs = text,
                parameters = new { candidate_labels = candidateLabels },
                options = new { wait_for_model = true }
            };

            var response = await _httpClient.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("HuggingFace Classification API error {StatusCode}: {Body}", response.StatusCode, errorBody);
                throw new HttpRequestException($"API returned {response.StatusCode}: {errorBody}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("Classification HF RAW Response: {Response}", responseContent);
            
            using var doc = JsonDocument.Parse(responseContent);
            var root = doc.RootElement;

            // Xử lý type 1: [{"label":"frontend","score":...}, {"label":"backend","score":...}]
            if (root.ValueKind == JsonValueKind.Array && root.GetArrayLength() > 0 && root[0].TryGetProperty("label", out _))
            {
                var results = new List<ClassificationScore>();
                foreach (var item in root.EnumerateArray())
                {
                    if (item.TryGetProperty("label", out var lbl) && item.TryGetProperty("score", out var scr))
                    {
                        results.Add(new ClassificationScore
                        {
                            Label = lbl.GetString() ?? "",
                            Confidence = scr.GetDouble()
                        });
                    }
                }
                return results.ToArray();
            }
            
            // Xử lý type 2: {"sequence":"...","labels":["frontend","backend"],"scores":[0.9, 0.1]}
            // Hoặc dạng Array: [{"sequence":"...","labels":["frontend","backend"],"scores":[0.9, 0.1]}]
            JsonElement objElement = root;
            if (root.ValueKind == JsonValueKind.Array && root.GetArrayLength() > 0 && root[0].TryGetProperty("labels", out _))
            {
                objElement = root[0];
            }
            
            if (objElement.ValueKind == JsonValueKind.Object && 
                objElement.TryGetProperty("labels", out var labelsEl) && 
                objElement.TryGetProperty("scores", out var scoresEl))
            {
                var count = Math.Min(labelsEl.GetArrayLength(), scoresEl.GetArrayLength());
                var results = new ClassificationScore[count];
                
                for (int i = 0; i < count; i++)
                {
                    results[i] = new ClassificationScore
                    {
                        Label = labelsEl[i].GetString() ?? "",
                        Confidence = scoresEl[i].GetDouble()
                    };
                }
                
                return results;
            }
            
            return Array.Empty<ClassificationScore>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to call HuggingFace Classification API");
            throw;
        }
    }
}
