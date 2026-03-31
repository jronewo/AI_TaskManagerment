using Task = System.Threading.Tasks.Task;

namespace Services.I_Services;

public interface IAiAnalysisService
{
    Task AnalyzeTaskRiskAsync(int taskId);
    Task GenerateTaskSummaryAsync(int taskId);
    Task ClassifyAndAnalyzeTaskAsync(int taskId);
    Task<object> AnalyzeProjectRisksAsync(int projectId);
}
