using BusinessObject.DTOs;
using BusinessObject.Models;
using Microsoft.AspNetCore.Mvc;
using Services.I_Services;
using Services.Services;

namespace AI_ManagermentAPI.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO request)
        {
            var result =await _authService.LoginAsync(request);
            if (!result.Success)
                return Unauthorized(new { message = result.Message });
            return Ok(new
            {
                message = result.Message,
                token = result.Token,
                role = result.Role
            });
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO request)
        {
            var result = await _authService.RegisterAsync(request);
            if (!result.Success)
                return BadRequest(result.Message);
            return Ok(new { message = result.Message });

        }
    }
}
