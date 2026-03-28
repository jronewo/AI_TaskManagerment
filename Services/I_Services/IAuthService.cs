using BusinessObject.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Services.I_Services
{
    public interface IAuthService
    {
        Task<(bool Success, string Message)> RegisterAsync(RegisterDTO request);
        Task<(bool Success, string Message, string Token, string Role)> LoginAsync(LoginDTO request);
    }
}
