using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Services.I_Services;

namespace Services.Services;

public class HuggingFaceService : IHuggingFaceService
{
    private readonly HttpClient _httpClient;
    private readonly string _modelId;
    private readonly ILogger<HuggingFaceService> _logger;

    public HuggingFaceService(HttpClient httpClient, IConfiguration configuration, ILogger<HuggingFaceService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;

        var apiKey = configuration["HuggingFace:ApiKey"]
            ?? throw new InvalidOperationException("HuggingFace:ApiKey is not configured");
        _modelId = configuration["HuggingFace:ModelId"]
            ?? "sentence-transformers/all-MiniLM-L6-v2";

        _httpClient.BaseAddress = new Uri("https://router.huggingface.co/hf-inference/");
        _httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
    }

    public async Task<List<float[]>> GetEmbeddingsAsync(List<string> texts)
    {
        // HF hiện tại route model sentence-transformers sang SentenceSimilarity pipeline
        // Nên không hỗ trợ feature-extraction trực tiếp nữa
        // Workaround: tạo pseudo-embeddings từ similarity scores
        _logger.LogWarning("GetEmbeddingsAsync is limited — HF routes this model to SentenceSimilarity pipeline. Use ComputeSimilarityBatchAsync for best results.");
        return texts.Select(_ => Array.Empty<float>()).ToList();
    }

    public async Task<double> ComputeSimilarityAsync(string text1, string text2)
    {
        var scores = await ComputeSimilarityBatchAsync(text1, new List<string> { text2 });
        return scores.Count > 0 ? scores[0] : 0.0;
    }

    /// <summary>
    /// Gọi HuggingFace Sentence Similarity API
    /// Format: { "inputs": { "source_sentence": "...", "sentences": ["...", "..."] } }
    /// Response: [0.85, 0.72, ...] — similarity scores trực tiếp
    /// </summary>
    public async Task<List<double>> ComputeSimilarityBatchAsync(string sourceText, List<string> targetTexts)
    {
        if (targetTexts.Count == 0)
            return new List<double>();

        var url = $"models/{_modelId}";

        _logger.LogInformation("Calling HuggingFace SentenceSimilarity API for {Count} comparisons", targetTexts.Count);

        try
        {
            var requestBody = new
            {
                inputs = new
                {
                    source_sentence = sourceText,
                    sentences = targetTexts
                },
                options = new { wait_for_model = true }
            };

            var response = await _httpClient.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("HuggingFace API error {StatusCode}: {Body}", response.StatusCode, errorBody);
                throw new HttpRequestException($"HuggingFace API returned {response.StatusCode}: {errorBody}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            _logger.LogDebug("HuggingFace response: {Response}", responseContent);

            // Response là array scores: [0.85, 0.72, 0.45, ...]
            var scores = JsonSerializer.Deserialize<List<double>>(responseContent);

            if (scores != null && scores.Count > 0)
            {
                // Normalize từ [-1, 1] thành [0, 1]
                var normalizedScores = scores.Select(s => (s + 1.0) / 2.0).ToList();
                _logger.LogInformation("Successfully computed {Count} similarity scores", normalizedScores.Count);
                return normalizedScores;
            }

            _logger.LogWarning("Empty scores from HuggingFace API");
            return targetTexts.Select(_ => 0.5).ToList();
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to call HuggingFace Sentence Similarity API");
            throw;
        }
    }
}
