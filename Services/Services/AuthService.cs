using BCrypt.Net;
using BusinessObject.DTOs;
using BusinessObject.Models;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Repository.I_Repository;
using Services.I_Services;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Services.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<(bool Success, string Message)> RegisterAsync(RegisterDTO request)
        {
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return (false, "Email này đã được sử dụng.");
            }

            var newUser = new User
            {
                Name = request.Name,
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = "MEMBER",
                Status = 1,
                CreatedAt = DateTime.Now
            };

            await _userRepository.AddUserAsync(newUser);
            return (true, "Đăng ký thành công.");
        }

        public async Task<(bool Success, string Message, string Token, string Role)> LoginAsync(LoginDTO request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return (false, "Email hoặc mật khẩu không đúng.", null, null);
            }

            if (user.Status != 1)
            {
                return (false, "Tài khoản của bạn đã bị khóa.", null, null);
            }

            var token = GenerateJwtToken(user);
            return (true, "Đăng nhập thành công", token, user.Role);
        }
        public async Task<(bool Success, string Message, string Token, string Role)> GoogleLoginAsync(GoogleLoginDTO request)
        {
            try
            {
                var audience = new List<string>();
                var singleId = _configuration["GoogleAuth:ClientId"];
                if (!string.IsNullOrWhiteSpace(singleId))
                    audience.Add(singleId.Trim());
                foreach (var child in _configuration.GetSection("GoogleAuth:ClientIds").GetChildren())
                {
                    var id = child.Value;
                    if (!string.IsNullOrWhiteSpace(id))
                        audience.Add(id.Trim());
                }

                if (audience.Count == 0)
                    return (false, "Google Sign-In chưa được cấu hình (GoogleAuth:ClientId).", null!, null!);

                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = audience,
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token, settings);

                if (string.IsNullOrWhiteSpace(payload.Email))
                    return (false, "Google không trả về email cho tài khoản này.", null!, null!);

                // 2. Kiểm tra xem user này đã có trong DB của bạn chưa
                var user = await _userRepository.GetByEmailAsync(payload.Email);

                if (user == null)
                {
                    var email = payload.Email ?? string.Empty;
                    var displayName = payload.Name;
                    if (string.IsNullOrWhiteSpace(displayName))
                        displayName = email.Split('@')[0];

                    user = new User
                    {
                        Name = displayName ?? "User",
                        Email = email,
                        Password = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                        Role = "MEMBER",
                        Status = 1,
                        CreatedAt = DateTime.Now,
                        Avatar = payload.Picture,
                    };
                    await _userRepository.AddUserAsync(user);
                }
                else if (user.Status != 1)
                {
                    return (false, "Tài khoản của bạn đã bị khóa.", null, null);
                }

                // 3. Tạo JWT Token nội bộ của hệ thống bạn và trả về
                var token = GenerateJwtToken(user); // Dùng lại hàm GenerateJwtToken đã viết
                return (true, "Đăng nhập Google thành công", token, user.Role);
            }
            catch (Exception)
            {
                return (false, "Token Google không hợp lệ hoặc Client ID không khớp với cấu hình server.", null!, null!);
            }
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new Claim(ClaimTypes.Role, user.Role ?? "MEMBER"),
            new Claim("Name", user.Name ?? "")
        };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
