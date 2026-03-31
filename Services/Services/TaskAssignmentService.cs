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
    private readonly ITextGenerationService _textGenerationService;
    private readonly INotificationService _notificationService;
    private readonly ITaskRequiredSkillRepository _taskRequiredSkillRepository;
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
        ITextGenerationService textGenerationService,
        INotificationService notificationService,
        ITaskRequiredSkillRepository taskRequiredSkillRepository,
        ILogger<TaskAssignmentService> logger)
    {
        _userRepository = userRepository;
        _taskRepository = taskRepository;
        _aiRecommendationRepository = aiRecommendationRepository;
        _huggingFaceService = huggingFaceService;
        _taskEmbeddingRepository = taskEmbeddingRepository;
        _textGenerationService = textGenerationService;
        _notificationService = notificationService;
        _taskRequiredSkillRepository = taskRequiredSkillRepository;
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
        var requiredSkills = await _taskRequiredSkillRepository.GetByTaskIdAsync(taskId);
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
        var semanticScores = await ComputeSemanticScoresAsync(task, taskSkillRequirements, userProfiles);

        // 5a. Thu thập tất cả scores trước
        var scoredProfiles = new List<ScoredProfile>();
        for (int i = 0; i < userProfiles.Count; i++)
        {
            var profile = userProfiles[i];
            var skillMatchScore = ComputeSkillMatchScore(profile, taskSkillRequirements);
            var workloadScore = ComputeWorkloadScore(profile, task.EstimatedTime ?? 4);
            var performanceScore = ComputePerformanceScore(profile);
            var semanticScore = i < semanticScores.Count ? semanticScores[i] : 0.5;
            var finalScore = SkillMatchWeight * skillMatchScore
                           + SemanticSimilarityWeight * semanticScore
                           + WorkloadWeight * workloadScore
                           + PerformanceWeight * performanceScore;

            scoredProfiles.Add(new ScoredProfile
            {
                Profile = profile,
                SkillMatchScore = skillMatchScore,
                SemanticScore = semanticScore,
                WorkloadScore = workloadScore,
                PerformanceScore = performanceScore,
                FinalScore = finalScore
            });
        }

        // 5b. Sắp xếp theo final score giảm dần
        scoredProfiles = scoredProfiles.OrderByDescending(sp => sp.FinalScore).ToList();

        // 5c. Tạo comparative reasons cho từng user
        var suggestions = new List<AiSuggestionResult>();
        for (int rank = 0; rank < scoredProfiles.Count; rank++)
        {
            var sp = scoredProfiles[rank];
            var reason = BuildComparativeReason(task, sp, scoredProfiles, taskSkillRequirements, rank + 1);

            suggestions.Add(new AiSuggestionResult
            {
                UserId = sp.Profile.UserId,
                UserName = sp.Profile.UserName,
                Score = Math.Round(sp.FinalScore * 100, 2),
                Reason = reason,
                SkillMatchScore = Math.Round(sp.SkillMatchScore * 100, 2),
                SemanticSimilarityScore = Math.Round(sp.SemanticScore * 100, 2),
                WorkloadScore = Math.Round(sp.WorkloadScore * 100, 2),
                PerformanceScore = Math.Round(sp.PerformanceScore * 100, 2)
            });
        }

        // 6. Lưu recommendations vào DB
        await SaveRecommendationsAsync(taskId, suggestions);

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
        
        // Luôn luôn clear tất cả những người cũ để đảm bảo 1 task 1 người
        await _taskRepository.ClearTaskAssigneesAsync(taskId);

        // Nếu click lại đúng người đang được gán -> Hành vi Unassign (Gỡ)
        if (existingAssignees.Any(a => a.UserId == userId))
        {
            return true; // Đã unassign thành công
        }

        // Nếu click người mới -> Gán thành viên mới
        var assignee = new TaskAssignee
        {
            TaskId = taskId,
            UserId = userId
        };

        await _taskRepository.AddTaskAssigneeAsync(assignee);
        
        // Notify the user
        var task = await _taskRepository.GetByIdAsync(taskId);
        if (task != null)
        {
            await _notificationService.CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = userId,
                Type = "TASK_ASSIGN",
                Title = "Phân công mới",
                Message = $"Bạn vừa được phân công thực hiện task: {task.Title} (#{taskId})",
                ReferenceId = taskId,
                ReferenceType = "Task"
            });
        }

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

    /// <summary>
    /// Build comparative reason: so sánh user với các team members khác
    /// </summary>
    private string BuildComparativeReason(
        BusinessObject.Models.Task task,
        ScoredProfile current,
        List<ScoredProfile> allProfiles,
        List<TaskSkillRequirement> requirements,
        int rank)
    {
        var profile = current.Profile;
        var totalMembers = allProfiles.Count;
        var sb = new StringBuilder();

        // === 1. RANKING ===
        sb.AppendLine($"📊 Xếp hạng: #{rank}/{totalMembers} trong team");
        if (rank == 1)
            sb.AppendLine($"🏆 Ứng viên phù hợp NHẤT cho task \"{task.Title}\" với tổng điểm {Math.Round(current.FinalScore * 100, 1)}%");
        else
        {
            var best = allProfiles[0];
            var gap = Math.Round((best.FinalScore - current.FinalScore) * 100, 1);
            sb.AppendLine($"📉 Thấp hơn #{1} ({best.Profile.UserName}) {gap} điểm");
        }

        // === 2. SKILL MATCH BREAKDOWN ===
        var avgSkill = allProfiles.Average(p => p.SkillMatchScore);
        var bestSkill = allProfiles.Max(p => p.SkillMatchScore);
        var bestSkillUser = allProfiles.First(p => p.SkillMatchScore == bestSkill).Profile.UserName;
        sb.AppendLine();
        sb.AppendLine($"🔧 Skill Match: {Math.Round(current.SkillMatchScore * 100, 1)}% (TB team: {Math.Round(avgSkill * 100, 1)}%, Cao nhất: {Math.Round(bestSkill * 100, 1)}% - {bestSkillUser})");

        if (requirements.Count > 0)
        {
            foreach (var req in requirements)
            {
                var userSkill = profile.Skills.FirstOrDefault(s => s.SkillId == req.SkillId);
                var othersWithSkill = allProfiles.Count(p => p.Profile.Skills.Any(s => s.SkillId == req.SkillId));

                if (userSkill != null)
                {
                    var levelStatus = userSkill.Level >= req.RequiredLevel ? "✅" : "⚠️";
                    sb.AppendLine($"  {levelStatus} {req.SkillName}: Level {userSkill.Level}/{req.RequiredLevel} (yêu cầu). {othersWithSkill}/{totalMembers} members có skill này");
                }
                else
                {
                    sb.AppendLine($"  ❌ {req.SkillName}: Không có (cần level {req.RequiredLevel}). {othersWithSkill}/{totalMembers} members có skill này");
                }
            }
        }

        // === 3. SEMANTIC SIMILARITY BREAKDOWN ===
        var avgSemantic = allProfiles.Average(p => p.SemanticScore);
        var bestSemantic = allProfiles.Max(p => p.SemanticScore);
        var bestSemanticUser = allProfiles.First(p => p.SemanticScore == bestSemantic).Profile.UserName;
        sb.AppendLine();
        sb.AppendLine($"🧠 AI Semantic Match: {Math.Round(current.SemanticScore * 100, 1)}% (TB team: {Math.Round(avgSemantic * 100, 1)}%, Cao nhất: {Math.Round(bestSemantic * 100, 1)}% - {bestSemanticUser})");
        if (current.SemanticScore >= 0.8)
            sb.AppendLine($"  → Profile RẤT phù hợp với nội dung task theo phân tích AI");
        else if (current.SemanticScore >= 0.6)
            sb.AppendLine($"  → Profile KHÁ phù hợp với nội dung task");
        else if (current.SemanticScore >= 0.4)
            sb.AppendLine($"  → Profile TRUNG BÌNH so với yêu cầu task");
        else
            sb.AppendLine($"  → Profile ÍT liên quan đến nội dung task");

        // === 4. WORKLOAD BREAKDOWN ===
        var avgWorkload = allProfiles.Average(p => p.WorkloadScore);
        var bestWorkload = allProfiles.Max(p => p.WorkloadScore);
        var bestWorkloadUser = allProfiles.First(p => p.WorkloadScore == bestWorkload).Profile.UserName;
        sb.AppendLine();
        sb.AppendLine($"📋 Workload: {Math.Round(current.WorkloadScore * 100, 1)}% (TB team: {Math.Round(avgWorkload * 100, 1)}%, Rảnh nhất: {Math.Round(bestWorkload * 100, 1)}% - {bestWorkloadUser})");
        sb.AppendLine($"  → Đang có {profile.ActiveTaskCount} task đang làm, {profile.TotalAvailableHours}h khả dụng/tuần");

        var leastBusy = allProfiles.OrderBy(p => p.Profile.ActiveTaskCount).First();
        var mostBusy = allProfiles.OrderByDescending(p => p.Profile.ActiveTaskCount).First();
        if (profile.UserId == leastBusy.Profile.UserId)
            sb.AppendLine($"  🟢 Ít task nhất trong team");
        else
            sb.AppendLine($"  So sánh: {leastBusy.Profile.UserName} chỉ có {leastBusy.Profile.ActiveTaskCount} task, {mostBusy.Profile.UserName} có {mostBusy.Profile.ActiveTaskCount} task");

        // === 5. PERFORMANCE BREAKDOWN ===
        var avgPerf = allProfiles.Average(p => p.PerformanceScore);
        var bestPerf = allProfiles.Max(p => p.PerformanceScore);
        var bestPerfUser = allProfiles.First(p => p.PerformanceScore == bestPerf).Profile.UserName;
        sb.AppendLine();
        sb.AppendLine($"⭐ Performance: {Math.Round(current.PerformanceScore * 100, 1)}% (TB team: {Math.Round(avgPerf * 100, 1)}%, Cao nhất: {Math.Round(bestPerf * 100, 1)}% - {bestPerfUser})");

        if (profile.Evaluation != null)
        {
            var eval = profile.Evaluation;
            sb.AppendLine($"  → Kỹ năng: {eval.AvgSkillScore:F1}/10, Teamwork: {eval.AvgTeamworkScore:F1}/10, Giao tiếp: {eval.AvgCommunicationScore:F1}/10, Deadline: {eval.AvgDeadlineScore:F1}/10");
        }
        else
        {
            sb.AppendLine($"  → Chưa có đánh giá hiệu suất (mặc định 50%)");
        }

        // === 6. KẾT LUẬN ===
        sb.AppendLine();
        sb.Append("💡 Kết luận: ");
        var strengths = new List<string>();
        var weaknesses = new List<string>();

        if (current.SkillMatchScore >= avgSkill) strengths.Add("skill match");
        else weaknesses.Add("skill match");
        if (current.SemanticScore >= avgSemantic) strengths.Add("AI semantic");
        else weaknesses.Add("AI semantic");
        if (current.WorkloadScore >= avgWorkload) strengths.Add("workload availability");
        else weaknesses.Add("workload");
        if (current.PerformanceScore >= avgPerf) strengths.Add("performance");
        else weaknesses.Add("performance");

        if (strengths.Count > 0)
            sb.Append($"Nổi trội hơn team ở: {string.Join(", ", strengths)}. ");
        if (weaknesses.Count > 0)
            sb.Append($"Yếu hơn team ở: {string.Join(", ", weaknesses)}.");

        return sb.ToString();
    }

    /// <summary>
    /// Internal class to hold all scores for a user profile before building reasons
    /// </summary>
    private class ScoredProfile
    {
        public UserSkillProfile Profile { get; set; } = null!;
        public double SkillMatchScore { get; set; }
        public double SemanticScore { get; set; }
        public double WorkloadScore { get; set; }
        public double PerformanceScore { get; set; }
        public double FinalScore { get; set; }
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
