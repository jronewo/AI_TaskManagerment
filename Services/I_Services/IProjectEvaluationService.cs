using BusinessObject.DTOs;
using System.Threading.Tasks;

namespace Services.I_Services;

public interface IProjectEvaluationService
{
    Task<ProjectEvaluationDto?> GetEvaluationAsync(int projectId);
    Task<bool> EvaluateProjectAsync(int projectId, CreateProjectEvaluationRequest request);
}
