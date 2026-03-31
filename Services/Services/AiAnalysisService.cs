using BusinessObject.Models;
using Microsoft.Extensions.Logging;
using Repository.I_Repository;
using Services.I_Services;
using Task = System.Threading.Tasks.Task;

namespace Services.Services;

public class AiAnalysisService : IAiAnalysisService
{
    private readonly ITaskRepository _taskRepository;
    private readonly ITaskLogRepository _taskLogRepository;
    private readonly IAiAnalysisRepository _aiAnalysisRepository;
    private readonly IClassificationService _classificationService;
    private readonly IUserRepository _userRepository;
    private readonly ITextGenerationService _textGenerationService;
    private readonly ILogger<AiAnalysisService> _logger;

    public AiAnalysisService(
        ITaskRepository taskRepository,
        ITaskLogRepository taskLogRepository,
        IAiAnalysisRepository aiAnalysisRepository,
        IClassificationService classificationService,
        IUserRepository userRepository,
        ITextGenerationService textGenerationService,
        ILogger<AiAnalysisService> logger)
    {
        _taskRepository = taskRepository;
        _taskLogRepository = taskLogRepository;
        _aiAnalysisRepository = aiAnalysisRepository;
        _classificationService = classificationService;
        _userRepository = userRepository;
        _textGenerationService = textGenerationService;
        _logger = logger;
    }

    public async Task AnalyzeTaskRiskAsync(int taskId)
    {
        _logger.LogInformation("Analyzing risk for TaskId={TaskId}", taskId);
        
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) return;

        var logs = await _taskLogRepository.GetByTaskIdAsync(taskId);
        var latestLog = logs.OrderByDescending(l => l.CreatedAt).FirstOrDefault();

        // 1. Tính Tỉ lệ Chậm Task (Late Ratio) của Assignee
        var assignees = await _taskRepository.GetTaskAssigneesAsync(taskId);
        double totalLateRatio = 0;
        int validMembers = 0;

        foreach (var assignee in assignees)
        {
            if (!assignee.UserId.HasValue) continue;
            var evals = await _userRepository.GetUserEvaluationsAsync(assignee.UserId.Value);
            if (evals.Count > 0)
            {
                var avgScore = evals.Average(e => e.DeadlineScore ?? 5.0);
                // lateRatio = (10 - AvgScore) / 10 * 100%
                var ratio = (10.0 - avgScore) / 10.0 * 100.0;
                totalLateRatio += ratio;
                validMembers++;
            }
        }

        double lateRatio = validMembers > 0 ? (totalLateRatio / validMembers) : 0;

        // 2. Xác định Base Risk Level
        string baseRiskLevel = "LOW";
        if (lateRatio > 20) baseRiskLevel = "HIGH";
        else if (lateRatio > 10) baseRiskLevel = "MEDIUM";

        // 3. Kết hợp EstimatedTime vs Deadline
        int estimatedHours = task.EstimatedTime ?? 0;
        int remainingDays = 0;
        int availableWorkingHours = 0;

        if (task.Deadline.HasValue)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            remainingDays = task.Deadline.Value.DayNumber - today.DayNumber;
            // Assuming 8 working hours per day for a simple calculation
            availableWorkingHours = remainingDays > 0 ? remainingDays * 8 : 0;
        }

        bool isTimeRisk = (estimatedHours > availableWorkingHours && estimatedHours > 0);

        // 4. Kiểm tra TaskLog.Risk & Soạn Prompt gửi AI
        string reportedRisk = latestLog?.Risk;
        
        string prompt = $"You are a Project Risk Analyst. Analyze the risk for task '{task.Title}' with current progress {task.Progress}%. " +
                        $"The team member's historical late-task ratio is {lateRatio:F1}%. " +
                        $"Estimated hours: {estimatedHours}. Available working hours until deadline: {availableWorkingHours}. ";
        
        if (isTimeRisk) {
            prompt += "WARNING: Estimated hours exceed the available working hours! ";
        }
        if (!string.IsNullOrWhiteSpace(reportedRisk)) {
            prompt += $"CRITICAL WARNING: The user just reported a specific risk: '{reportedRisk}'. ";
        }
        
        prompt += "Based on this, what is the final Risk Level (LOW, MEDIUM, or HIGH) and why? ";
        
        string aiContent = "";
        try {
            aiContent = await _textGenerationService.GenerateTextAsync(prompt, maxTokens: 100);
            if (string.IsNullOrWhiteSpace(aiContent) || aiContent.Contains("could not generate")) {
                 throw new Exception("AI returned empty or error message.");
            }
        } catch {
            // Fallback logic inside service
            aiContent = $"Base risk is {baseRiskLevel} (Late ratio: {lateRatio:F1}%). ";
            if (isTimeRisk) aiContent += "Time is limited compared to estimated hours. ";
            if (!string.IsNullOrWhiteSpace(reportedRisk)) aiContent += $"User reported risk: {reportedRisk}. Risk escalated.";
        }
        
        string finalContent = $"🤖 AI Risk Evaluation: {aiContent}";

        var analysis = new AiAnalysis
        {
            TaskId = taskId,
            AnalysisType = "risk",
            Content = finalContent
        };

        await _aiAnalysisRepository.AddAsync(analysis);
    }

    public async Task GenerateTaskSummaryAsync(int taskId)
    {
        _logger.LogInformation("Generating summary for TaskId={TaskId}", taskId);

        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null) return;

        var assignees = await _taskRepository.GetTaskAssigneesAsync(taskId);
        
        string content = $"Task '{task.Title}' summary: Priority {task.Priority}, assigned to {assignees.Count} users. Overall progress: {task.Progress}%.";

        var analysis = new AiAnalysis
        {
            TaskId = taskId,
            AnalysisType = "summary",
            Content = content
        };

        await _aiAnalysisRepository.AddAsync(analysis);
    }

    public async Task ClassifyAndAnalyzeTaskAsync(int taskId)
    {
        _logger.LogInformation("Classifying and Analyzing TaskId={TaskId}", taskId);
        
        // 1. Classify Task Type & Difficulty
        var classificationResult = await _classificationService.ClassifyTaskAsync(taskId);
        
        // Cập nhật lại kết quả phân loại thành một loại Analysis (hoặc có thể update trực tiếp vào properties của Task nếu DB hỗ trợ)
        var classifyAnalysis = new AiAnalysis
        {
            TaskId = taskId,
            AnalysisType = "classification",
            Content = $"Task classified as Type: {classificationResult.TaskType} ({classificationResult.TaskTypeConfidence:P1}), Difficulty: {classificationResult.Difficulty} ({classificationResult.DifficultyConfidence:P1})."
        };
        await _aiAnalysisRepository.AddAsync(classifyAnalysis);

        // 2. Chạy Risk Analysis
        await AnalyzeTaskRiskAsync(taskId);
        
        // 3. Chạy Summary Generation
        await GenerateTaskSummaryAsync(taskId);
    }

    public async Task<object> AnalyzeProjectRisksAsync(int projectId)
    {
        _logger.LogInformation("Batch analyzing risks for ProjectId={ProjectId}", projectId);
        
        var tasks = await _taskRepository.GetByProjectIdAsync(projectId);
        var activeTasks = tasks.Where(t => t.Status != "Done").ToList();
        
        int highRisk = 0;
        int mediumRisk = 0;
        int lowRisk = 0;
        var warnings = new List<string>();

        foreach (var task in activeTasks)
        {
            // Optional: call AI for tasks that have no risk assigned or HIGH risk to update them
            // Depending on performance, we might just rely on the existing RiskLevel.
            // For a complete flow as requested:
            try 
            {
                await AnalyzeTaskRiskAsync(task.TaskId);
            } 
            catch { /* Ignore individual failures */ }

            // Thống kê dựa trên RiskLevel hiện tại của Task (được update bởi Log/Progress)
            if (task.RiskLevel == "HIGH") { highRisk++; warnings.Add($"Task '{task.Title}' đang có rủi ro CAO."); }
            else if (task.RiskLevel == "MEDIUM") mediumRisk++;
            else lowRisk++;
        }

        string overallStatus = highRisk > 0 ? "Nguy hiểm" : (mediumRisk > activeTasks.Count / 2 ? "Cảnh báo" : "An toàn");

        return new {
            TotalActive = activeTasks.Count,
            HighRisk = highRisk,
            MediumRisk = mediumRisk,
            LowRisk = lowRisk,
            Status = overallStatus,
            Warnings = warnings
        };
    }
}
