using BusinessObject.DTOs;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Services.I_Services
{
    public interface IAuthService
    {
        Task<(bool Success, string Message)> RegisterAsync(RegisterDTO request);
        Task<(bool Success, string Message, int UserId, string? Name, string? Email, string Role, bool IsFirstLogin, bool IsOrgOwner)> LoginAsync(LoginDTO request);
        Task<(bool Success, string Message, int UserId, string? Name, string? Email, string Role, bool IsFirstLogin, bool IsOrgOwner)> GoogleLoginAsync(GoogleLoginDTO request);
    }
}
