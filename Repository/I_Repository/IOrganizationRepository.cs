using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface IOrganizationRepository
{
    Task<Organization?> GetByIdAsync(int organizationId);
    Task<Organization?> GetByOwnerIdAsync(int ownerId);
    Task<List<Organization>> GetAllAsync();
    Task<List<Project>> GetProjectsByOrganizationIdAsync(int organizationId);
    Task AddAsync(Organization organization);
    Task UpdateAsync(Organization organization);
    Task DeleteAsync(int organizationId);
}
