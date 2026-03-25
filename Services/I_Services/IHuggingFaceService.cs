namespace Services.I_Services;

public interface IHuggingFaceService
{
    /// <summary>
    /// Lấy embedding vectors cho danh sách texts từ Hugging Face API
    /// </summary>
    Task<List<float[]>> GetEmbeddingsAsync(List<string> texts);

    /// <summary>
    /// Tính cosine similarity giữa 2 texts sử dụng Hugging Face embeddings
    /// </summary>
    Task<double> ComputeSimilarityAsync(string text1, string text2);

    /// <summary>
    /// Tính similarity giữa 1 text và nhiều texts khác,
    /// trả về list scores tương ứng
    /// </summary>
    Task<List<double>> ComputeSimilarityBatchAsync(string sourceText, List<string> targetTexts);
}
