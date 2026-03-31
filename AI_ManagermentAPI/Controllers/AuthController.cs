using BusinessObject.DTOs;
using BusinessObject.Models;
using Microsoft.AspNetCore.Mvc;
using Services.I_Services;

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
            var result = await _authService.LoginAsync(request);
            if (!result.Success)
                return Unauthorized(new { message = result.Message });
            return Ok(new
            {
                message = result.Message,
                userId = result.UserId,
                name = result.Name,
                email = result.Email,
                role = result.Role,
                isFirstLogin = result.IsFirstLogin,
                isOrgOwner = result.IsOrgOwner
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

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDTO request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Token))
                return BadRequest(new { message = "Thiếu id_token Google." });

            var result = await _authService.GoogleLoginAsync(request);
            if (!result.Success)
                return Unauthorized(new { message = result.Message });
            return Ok(new
            {
                message = result.Message,
                userId = result.UserId,
                name = result.Name,
                email = result.Email,
                role = result.Role,
                isFirstLogin = result.IsFirstLogin,
                isOrgOwner = result.IsOrgOwner
            });
        }
    }
}
