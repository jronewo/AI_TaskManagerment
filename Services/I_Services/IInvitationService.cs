using BusinessObject.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.I_Services;

public interface IInvitationService
{
    Task<InvitationDto?> GetInvitationByIdAsync(int invitationId);
    Task<List<InvitationDto>> GetTeamInvitationsAsync(int teamId);
    Task<List<InvitationDto>> GetUserInvitationsAsync(string email);
    Task<InvitationDto> CreateInvitationAsync(CreateInvitationDto request);
    Task<bool> UpdateInvitationStatusAsync(int invitationId, string status);
    Task<bool> DeleteInvitationAsync(int invitationId);
}
