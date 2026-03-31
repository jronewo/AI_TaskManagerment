using BusinessObject.DTOs;
using BusinessObject.Models;
using Repository.I_Repository;
using Services.I_Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Services.Services;

public class EvaluationService : IEvaluationService
{
    private readonly IEvaluationRepository _evaluationRepo;

    public EvaluationService(IEvaluationRepository evaluationRepo)
    {
        _evaluationRepo = evaluationRepo;
    }

    public async Task<EvaluationDto?> GetEvaluationByIdAsync(int evaluationId)
    {
        var e = await _evaluationRepo.GetByIdAsync(evaluationId);
        if (e == null) return null;
        return MapToDto(e);
    }

    public async Task<List<EvaluationDto>> GetUserEvaluationsAsync(int userId)
    {
        var evaluations = await _evaluationRepo.GetByUserIdAsync(userId);
        return evaluations.Select(MapToDto).ToList();
    }

    public async Task<List<EvaluationDto>> GetLeaderEvaluationsAsync(int leaderId)
    {
        var evaluations = await _evaluationRepo.GetByLeaderIdAsync(leaderId);
        return evaluations.Select(MapToDto).ToList();
    }

    public async Task<EvaluationDto> CreateEvaluationAsync(CreateEvaluationDto request)
    {
        var e = new Evaluation
        {
            UserId = request.UserId,
            LeaderId = request.LeaderId,
            SkillScore = request.SkillScore,
            TeamworkScore = request.TeamworkScore,
            DeadlineScore = request.DeadlineScore,
            CommunicationScore = request.CommunicationScore,
            CreatedAt = DateTime.UtcNow
        };

        await _evaluationRepo.AddAsync(e);
        
        var newEval = await _evaluationRepo.GetByIdAsync(e.EvaluationId);
        return MapToDto(newEval!);
    }

    public async Task<bool> DeleteEvaluationAsync(int evaluationId)
    {
        await _evaluationRepo.DeleteAsync(evaluationId);
        return true;
    }

    private EvaluationDto MapToDto(Evaluation e)
    {
        return new EvaluationDto
        {
            EvaluationId = e.EvaluationId,
            UserId = e.UserId ?? 0,
            UserName = e.User?.Name,
            LeaderId = e.LeaderId,
            LeaderName = e.Leader?.Name,
            SkillScore = e.SkillScore,
            TeamworkScore = e.TeamworkScore,
            DeadlineScore = e.DeadlineScore,
            CommunicationScore = e.CommunicationScore,
            CreatedAt = e.CreatedAt
        };
    }
}
