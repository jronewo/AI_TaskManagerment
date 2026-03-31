using BusinessObject.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.I_Services;

public interface IEvaluationService
{
    Task<EvaluationDto?> GetEvaluationByIdAsync(int evaluationId);
    Task<List<EvaluationDto>> GetUserEvaluationsAsync(int userId);
    Task<List<EvaluationDto>> GetLeaderEvaluationsAsync(int leaderId);
    Task<EvaluationDto> CreateEvaluationAsync(CreateEvaluationDto request);
    Task<bool> DeleteEvaluationAsync(int evaluationId);
}
