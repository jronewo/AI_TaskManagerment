using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface IInvitationRepository
{
    Task<Invitation?> GetByIdAsync(int invitationId);
    Task<List<Invitation>> GetByTeamIdAsync(int teamId);
    Task<List<Invitation>> GetByEmailAsync(string email);
    Task AddAsync(Invitation invitation);
    Task UpdateAsync(Invitation invitation);
    Task DeleteAsync(int invitationId);
}
