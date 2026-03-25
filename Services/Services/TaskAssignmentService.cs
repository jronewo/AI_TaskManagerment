using System.Text;
using BusinessObject.DTOs;
using BusinessObject.Models;
using Microsoft.Extensions.Logging;
using Repository.I_Repository;
using Services.I_Services;
using Task = System.Threading.Tasks.Task;

namespace Services.Services;

public class TaskAssignmentService : ITaskAssignmentService
{
    private readonly IUserRepository _userRepository;
    private readonly ITaskRepository _taskRepository;
    private readonly IAiRecommendationRepository _aiRecommendationRepository;
    private readonly IHuggingFaceService _huggingFaceService;
    private readonly ITaskEmbeddingRepository _taskEmbeddingRepository;
    private readonly ILogger<TaskAssignmentService> _logger;

    // Trọng số scoring
    private const double SkillMatchWeight = 0.40;
    private const double SemanticSimilarityWeight = 0.25;
    private const double WorkloadWeight = 0.20;
    private const double PerformanceWeight = 0.15;

    public TaskAssignmentService(
        IUserRepository userRepository,
        ITaskRepository taskRepository,
        IAiRecommendationRepository aiRecommendationRepository,
        IHuggingFaceService huggingFaceService,
        ITaskEmbeddingRepository taskEmbeddingRepository,
        ILogger<TaskAssignmentService> logger)
    {
        _userRepository = userRepository;
        _taskRepository = taskRepository;
        _aiRecommendationRepository = aiRecommendationRepository;
        _huggingFaceService = huggingFaceService;
        _taskEmbeddingRepository = taskEmbeddingRepository;
        _logger = logger;
    }

    public async Task<TaskAssignmentResponse> GetRecommendationsAsync(int taskId, int projectId)
    {
        _logger.LogInformation("Generating AI recommendations for TaskId={TaskId}, ProjectId={ProjectId}", taskId, projectId);

        // 1. Lấy thông tin task
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task == null)
            throw new ArgumentException($"Task with ID {taskId} not found");

        // 2. Lấy required skills của task
        var requiredSkills = await _taskRepository.GetTaskRequiredSkillsAsync(taskId);
        var taskSkillRequirements = requiredSkills.Select(rs => new TaskSkillRequirement
        {
            SkillId = rs.SkillId ?? 0,
            SkillName = rs.Skill?.SkillName ?? "",
            RequiredLevel = rs.RequiredLevel ?? 1
        }).ToList();

        // 3. Lấy team members từ project
        var teamId = task.Project?.TeamId;
        List<User> teamMembers;

        if (teamId.HasValue)
        {
            teamMembers = await _userRepository.GetByTeamIdAsync(teamId.Value);
        }
        else
        {
            // Fallback: lấy tất cả active users
            teamMembers = await _userRepository.GetAllAsync();
        }

        if (teamMembers.Count == 0)
        {
            return new TaskAssignmentResponse
            {
                TaskId = taskId,
                TaskTitle = task.Title,
                RequiredSkills = taskSkillRequirements,
                Suggestions = new List<AiSuggestionResult>()
            };
        }

        // 4. Xây dựng profile cho từng user
        var userProfiles = new List<UserSkillProfile>();
        foreach (var member in teamMembers)
        {
            var profile = await BuildUserProfileAsync(member);
            userProfiles.Add(profile);
        }

        // 5. Tính score cho từng user
        var suggestions = new List<AiSuggestionResult>();

        // 5a. Tính Semantic Similarity score (batch call to HF)
        var semanticScores = await ComputeSemanticScoresAsync(task, taskSkillRequirements, userProfiles);

        for (int i = 0; i < userProfiles.Count; i++)
        {
            var profile = userProfiles[i];

            // 5b. Skill Match Score
            var skillMatchScore = ComputeSkillMatchScore(profile, taskSkillRequirements);

            // 5c. Workload Score
            var workloadScore = ComputeWorkloadScore(profile, task.EstimatedTime ?? 4);

            // 5d. Performance Score
            var performanceScore = ComputePerformanceScore(profile);

            // 5e. Semantic Similarity Score
            var semanticScore = i < semanticScores.Count ? semanticScores[i] : 0.5;

            // 5f. Final Score
            var finalScore = SkillMatchWeight * skillMatchScore
                           + SemanticSimilarityWeight * semanticScore
                           + WorkloadWeight * workloadScore
                           + PerformanceWeight * performanceScore;

            // Tạo reason text
            var reason = BuildReasonText(profile, taskSkillRequirements, skillMatchScore, semanticScore, workloadScore, performanceScore);

            suggestions.Add(new AiSuggestionResult
            {
                UserId = profile.UserId,
                UserName = profile.UserName,
                Score = Math.Round(finalScore * 100, 2),
                Reason = reason,
                SkillMatchScore = Math.Round(skillMatchScore * 100, 2),
                SemanticSimilarityScore = Math.Round(semanticScore * 100, 2),
                WorkloadScore = Math.Round(workloadScore * 100, 2),
                PerformanceScore = Math.Round(performanceScore * 100, 2)
            });
        }

        // Sort by score descending
        suggestions = suggestions.OrderByDescending(s => s.Score).ToList();

        // 6. Lưu recommendations vào DB
        await SaveRecommendationsAsync(taskId, suggestions);

        // 7. Lưu Task Embedding (bỏ qua - HF hiện dùng SentenceSimilarity pipeline, không trả embedding trực tiếp)

        _logger.LogInformation("Generated {Count} recommendations for TaskId={TaskId}", suggestions.Count, taskId);

        return new TaskAssignmentResponse
        {
            TaskId = taskId,
            TaskTitle = task.Title,
            RequiredSkills = taskSkillRequirements,
            Suggestions = suggestions,
            GeneratedAt = DateTime.UtcNow
        };
    }

    public async Task<bool> AcceptRecommendationAsync(int taskId, int userId)
    {
        var existingAssignees = await _taskRepository.GetTaskAssigneesAsync(taskId);
        if (existingAssignees.Any(a => a.UserId == userId))
        {
            return false; // Already assigned
        }

        var assignee = new TaskAssignee
        {
            TaskId = taskId,
            UserId = userId
        };

        await _taskRepository.AddTaskAssigneeAsync(assignee);
        return true;
    }

    #region Private Helpers

    private async Task<UserSkillProfile> BuildUserProfileAsync(User user)
    {
        var skills = await _userRepository.GetUserSkillsAsync(user.UserId);
        var availability = await _userRepository.GetUserAvailabilityAsync(user.UserId);
        var evaluations = await _userRepository.GetUserEvaluationsAsync(user.UserId);
        var activeTaskCount = await _userRepository.CountActiveTasksByUserAsync(user.UserId);

        var profile = new UserSkillProfile
        {
            UserId = user.UserId,
            UserName = user.Name,
            ActiveTaskCount = activeTaskCount,
            TotalAvailableHours = availability.Sum(a => a.AvailableHours ?? 0),
            Skills = skills.Select(s => new SkillInfo
            {
                SkillId = s.SkillId ?? 0,
                SkillName = s.Skill?.SkillName ?? "",
                Level = s.Level ?? 1
            }).ToList()
        };

        if (evaluations.Count > 0)
        {
            profile.Evaluation = new EvaluationSummary
            {
                AvgSkillScore = evaluations.Average(e => e.SkillScore ?? 0),
                AvgTeamworkScore = evaluations.Average(e => e.TeamworkScore ?? 0),
                AvgCommunicationScore = evaluations.Average(e => e.CommunicationScore ?? 0),
                AvgDeadlineScore = evaluations.Average(e => e.DeadlineScore ?? 0)
            };
        }

        return profile;
    }

    /// <summary>
    /// Skill Match Score (0-1): So sánh user skills vs task required skills
    /// </summary>
    private static double ComputeSkillMatchScore(UserSkillProfile profile, List<TaskSkillRequirement> requirements)
    {
        if (requirements.Count == 0)
            return 0.5; // Neutral nếu task không yêu cầu skill cụ thể

        double totalScore = 0;

        foreach (var req in requirements)
        {
            var userSkill = profile.Skills.FirstOrDefault(s => s.SkillId == req.SkillId);

            if (userSkill == null)
            {
                // User không có skill này → 0 điểm cho skill này
                totalScore += 0;
            }
            else
            {
                // So sánh level: nếu level >= required → full điểm
                // Nếu level < required → partial điểm theo tỷ lệ
                var ratio = (double)userSkill.Level / Math.Max(req.RequiredLevel, 1);
                totalScore += Math.Min(ratio, 1.0); // Cap at 1.0
            }
        }

        return totalScore / requirements.Count;
    }

    /// <summary>
    /// Semantic Similarity Scores: Dùng HF để so sánh task description với skill profile
    /// </summary>
    private async Task<List<double>> ComputeSemanticScoresAsync(
        BusinessObject.Models.Task task,
        List<TaskSkillRequirement> requirements,
        List<UserSkillProfile> profiles)
    {
        try
        {
            // Tạo mô tả task
            var taskDescription = BuildTaskDescription(task, requirements);

            // Tạo mô tả skill cho từng user
            var userDescriptions = profiles.Select(p => BuildUserSkillDescription(p)).ToList();

            // Gọi HF API
            var scores = await _huggingFaceService.ComputeSimilarityBatchAsync(taskDescription, userDescriptions);
            return scores;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to compute semantic similarity, using default scores");
            // Fallback: trả về 0.5 cho tất cả
            return profiles.Select(_ => 0.5).ToList();
        }
    }

    /// <summary>
    /// Workload Score (0-1): User càng ít task và càng nhiều giờ rảnh → điểm cao
    /// </summary>
    private static double ComputeWorkloadScore(UserSkillProfile profile, int estimatedHours)
    {
        // Nếu user không có thông tin availability → neutral
        if (profile.TotalAvailableHours == 0 && profile.ActiveTaskCount == 0)
            return 0.5;

        // Factor 1: Active tasks penalty (nhiều task → điểm thấp)
        // 0 tasks = 1.0, 1 task = 0.85, 2 tasks = 0.7, 3+ tasks = 0.5
        var taskPenalty = Math.Max(0.3, 1.0 - (profile.ActiveTaskCount * 0.15));

        // Factor 2: Available hours bonus
        double availabilityBonus = 0.5;
        if (profile.TotalAvailableHours > 0)
        {
            // Nếu giờ rảnh >= estimated hours → full bonus
            availabilityBonus = Math.Min(1.0, (double)profile.TotalAvailableHours / Math.Max(estimatedHours, 1));
        }

        return (taskPenalty * 0.6 + availabilityBonus * 0.4);
    }

    /// <summary>
    /// Performance Score (0-1): Dựa trên evaluation scores (average of 4 metrics)
    /// </summary>
    private static double ComputePerformanceScore(UserSkillProfile profile)
    {
        if (profile.Evaluation == null)
            return 0.5; // Neutral nếu chưa có đánh giá

        // Giả sử evaluation scores từ 1-10, normalize thành 0-1
        var avg = (profile.Evaluation.AvgSkillScore
                 + profile.Evaluation.AvgTeamworkScore
                 + profile.Evaluation.AvgCommunicationScore
                 + profile.Evaluation.AvgDeadlineScore) / 4.0;

        return Math.Min(avg / 10.0, 1.0);
    }

    private static string BuildTaskDescription(BusinessObject.Models.Task task, List<TaskSkillRequirement> requirements)
    {
        var sb = new StringBuilder();
        sb.Append($"Task: {task.Title ?? "Untitled"}. ");

        if (!string.IsNullOrEmpty(task.Description))
            sb.Append($"Description: {task.Description}. ");

        if (!string.IsNullOrEmpty(task.Priority))
            sb.Append($"Priority: {task.Priority}. ");

        if (task.Difficulty.HasValue)
            sb.Append($"Difficulty: {task.Difficulty}/10. ");

        if (requirements.Count > 0)
            sb.Append($"Required skills: {string.Join(", ", requirements.Select(r => $"{r.SkillName} (level {r.RequiredLevel})"))}.");

        return sb.ToString();
    }

    private static string BuildUserSkillDescription(UserSkillProfile profile)
    {
        var sb = new StringBuilder();
        sb.Append($"Developer: {profile.UserName}. ");

        if (profile.Skills.Count > 0)
            sb.Append($"Skills: {string.Join(", ", profile.Skills.Select(s => $"{s.SkillName} (level {s.Level})"))}. ");

        if (profile.Evaluation != null)
            sb.Append($"Performance: skill={profile.Evaluation.AvgSkillScore:F1}, teamwork={profile.Evaluation.AvgTeamworkScore:F1}. ");

        sb.Append($"Current workload: {profile.ActiveTaskCount} active tasks.");

        return sb.ToString();
    }

    private string BuildReasonText(
        UserSkillProfile profile,
        List<TaskSkillRequirement> requirements,
        double skillScore, double semanticScore,
        double workloadScore, double performanceScore)
    {
        var reasons = new List<string>();

        // Skill match analysis
        if (requirements.Count > 0)
        {
            var matchedSkills = requirements
                .Where(r => profile.Skills.Any(s => s.SkillId == r.SkillId && s.Level >= r.RequiredLevel))
                .Select(r => r.SkillName)
                .ToList();

            var missingSkills = requirements
                .Where(r => !profile.Skills.Any(s => s.SkillId == r.SkillId))
                .Select(r => r.SkillName)
                .ToList();

            if (matchedSkills.Count > 0)
                reasons.Add($"✅ Đáp ứng skill: {string.Join(", ", matchedSkills)}");

            if (missingSkills.Count > 0)
                reasons.Add($"⚠️ Thiếu skill: {string.Join(", ", missingSkills)}");
        }

        // Workload
        if (profile.ActiveTaskCount == 0)
            reasons.Add("✅ Đang rảnh, không có task nào đang làm");
        else if (profile.ActiveTaskCount <= 2)
            reasons.Add($"📋 Đang có {profile.ActiveTaskCount} task");
        else
            reasons.Add($"⚠️ Đang tải cao: {profile.ActiveTaskCount} task");

        // Performance
        if (profile.Evaluation != null)
        {
            var avgPerf = (profile.Evaluation.AvgSkillScore + profile.Evaluation.AvgTeamworkScore
                         + profile.Evaluation.AvgCommunicationScore + profile.Evaluation.AvgDeadlineScore) / 4.0;
            if (avgPerf >= 8)
                reasons.Add("⭐ Hiệu suất xuất sắc");
            else if (avgPerf >= 6)
                reasons.Add("👍 Hiệu suất tốt");
        }

        // AI similarity
        if (semanticScore >= 0.8)
            reasons.Add("🤖 AI: Profile rất phù hợp với task");
        else if (semanticScore >= 0.6)
            reasons.Add("🤖 AI: Profile khá phù hợp với task");

        return string.Join(". ", reasons);
    }

    private async Task SaveRecommendationsAsync(int taskId, List<AiSuggestionResult> suggestions)
    {
        // Xóa recommendations cũ
        await _aiRecommendationRepository.DeleteByTaskIdAsync(taskId);

        // Lưu mới
        var recommendations = suggestions.Select(s => new AiRecommendation
        {
            TaskId = taskId,
            SuggestedUserId = s.UserId,
            Score = s.Score,
            Reason = s.Reason,
            RecommendationType = "assign"
        }).ToList();

        await _aiRecommendationRepository.AddRangeAsync(recommendations);
    }

    #endregion
}
