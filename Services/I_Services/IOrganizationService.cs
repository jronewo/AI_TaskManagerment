using BusinessObject.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.I_Services;

public interface IOrganizationService
{
    Task<List<OrganizationDto>> GetAllOrganizationsAsync();
    Task<OrganizationDto?> GetOrganizationAsync(int orgId);
    Task<List<OrganizationProjectDto>> GetOrganizationProjectsAsync(int orgId);
    Task<OrganizationProjectDto?> GetProjectDetailAsync(int orgId, int projectId);
    Task CalculateProjectProgressAsync(int projectId);
    Task PredictCompletionDateAsync(int projectId);
}
