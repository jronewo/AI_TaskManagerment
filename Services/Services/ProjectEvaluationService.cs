using BusinessObject.DTOs;
using BusinessObject.Models;
using Repository.I_Repository;
using Services.I_Services;
using System;
using System.Threading.Tasks;

namespace Services.Services;

public class ProjectEvaluationService : IProjectEvaluationService
{
    private readonly IProjectEvaluationRepository _evaluationRepo;
    private readonly IOrganizationRepository _organizationRepo;

    public ProjectEvaluationService(
        IProjectEvaluationRepository evaluationRepo,
        IOrganizationRepository organizationRepo)
    {
        _evaluationRepo = evaluationRepo;
        _organizationRepo = organizationRepo;
    }

    public async Task<ProjectEvaluationDto?> GetEvaluationAsync(int projectId)
    {
        var eval = await _evaluationRepo.GetByProjectIdAsync(projectId);
        if (eval == null) return null;

        return new ProjectEvaluationDto
        {
            EvaluationId = eval.EvaluationId,
            ProjectId = eval.ProjectId,
            EvaluatorId = eval.EvaluatorId,
            EvaluatorName = eval.Evaluator?.Name ?? "Unknown",
            OverallScore = eval.OverallScore,
            QualityScore = eval.QualityScore,
            TimelinessScore = eval.TimelinessScore,
            CommunicationScore = eval.CommunicationScore,
            Comment = eval.Comment,
            CreatedAt = eval.CreatedAt
        };
    }

    public async Task<bool> EvaluateProjectAsync(int projectId, CreateProjectEvaluationRequest request)
    {
        // Check if already evaluated
        var exists = await _evaluationRepo.ExistsByProjectIdAsync(projectId);
        if (exists) return false;

        var evaluation = new ProjectEvaluation
        {
            ProjectId = projectId,
            EvaluatorId = request.EvaluatorId,
            OverallScore = request.OverallScore,
            QualityScore = request.QualityScore,
            TimelinessScore = request.TimelinessScore,
            CommunicationScore = request.CommunicationScore,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await _evaluationRepo.AddAsync(evaluation);
        return true;
    }
}
