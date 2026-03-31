using BusinessObject.DTOs;

namespace Services.I_Services;

public interface IClassificationService
{
    Task<TaskClassificationResponse> ClassifyTaskAsync(int taskId);
    Task<ClassificationScore[]> ClassifyZeroShotAsync(string text, string[] candidateLabels);
}
