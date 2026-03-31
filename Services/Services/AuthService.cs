using BCrypt.Net;
using BusinessObject.DTOs;
using BusinessObject.Models;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Repository.I_Repository;
using Services.I_Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Services.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        private readonly IOrganizationRepository _orgRepo;

        public AuthService(IUserRepository userRepository, IConfiguration configuration, IOrganizationRepository orgRepo)
        {
            _userRepository = userRepository;
            _configuration = configuration;
            _orgRepo = orgRepo;
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
                Role = "NORMAL_USER",
                Status = 1,
                CreatedAt = DateTime.Now
            };

            await _userRepository.AddUserAsync(newUser);
            return (true, "Đăng ký thành công.");
        }

        public async Task<(bool Success, string Message, int UserId, string? Name, string? Email, string Role, bool IsFirstLogin, bool IsOrgOwner)> LoginAsync(LoginDTO request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return (false, "Email hoặc mật khẩu không đúng.", 0, null!, null!, null!, false, false);
            }

            if (user.Status != 1)
            {
                return (false, "Tài khoản của bạn đã bị khóa.", 0, null!, null!, null!, false, false);
            }

            var skills = await _userRepository.GetUserSkillsAsync(user.UserId);
            bool isFirstLogin = skills == null || skills.Count == 0;
            
            var org = await _orgRepo.GetByOwnerIdAsync(user.UserId);
            bool isOrgOwner = org != null;

            return (true, "Đăng nhập thành công", user.UserId, user.Name, user.Email, user.Role ?? "NORMAL_USER", isFirstLogin, isOrgOwner);
        }

        public async Task<(bool Success, string Message, int UserId, string? Name, string? Email, string Role, bool IsFirstLogin, bool IsOrgOwner)> GoogleLoginAsync(GoogleLoginDTO request)
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
                    return (false, "Google Sign-In chưa được cấu hình (GoogleAuth:ClientId).", 0, null!, null!, null!, false, false);

                // [DEV MODE] Hỗ trợ test nhanh không cần cấu hình Google Client ID thật
                if (request.Token == "MOCK_GOOGLE_TOKEN_ADMIN")
                {
                    var mockUser = await _userRepository.GetByEmailAsync("admin@taskgenie.com");
                    if (mockUser == null)
                    {
                        mockUser = new User
                        {
                            Name = "Admin Mock",
                            Email = "admin@taskgenie.com",
                            Password = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                            Role = "ADMIN",
                            Status = 1,
                            CreatedAt = DateTime.Now
                        };
                        await _userRepository.AddUserAsync(mockUser);
                    }
                    return (true, "Đăng nhập Google MOCK (ADMIN) thành công", mockUser.UserId, mockUser.Name, mockUser.Email, mockUser.Role ?? "ADMIN", false, true);
                }

                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = audience,
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token, settings);

                if (string.IsNullOrWhiteSpace(payload.Email))
                    return (false, "Google không trả về email cho tài khoản này.", 0, null!, null!, null!, false, false);

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
                        Role = "NORMAL_USER",
                        Status = 1,
                        CreatedAt = DateTime.Now,
                        Avatar = payload.Picture,
                    };
                    await _userRepository.AddUserAsync(user);
                }
                else if (user.Status != 1)
                {
                    return (false, "Tài khoản của bạn đã bị khóa.", 0, null!, null!, null!, false, false);
                }

                var skills = await _userRepository.GetUserSkillsAsync(user.UserId);
                bool isFirstLogin = skills == null || skills.Count == 0;

                var org = await _orgRepo.GetByOwnerIdAsync(user.UserId);
                bool isOrgOwner = org != null;

                return (true, "Đăng nhập Google thành công", user.UserId, user.Name, user.Email, user.Role ?? "NORMAL_USER", isFirstLogin, isOrgOwner);
            }
            catch (Exception ex)
            {
                return (false, $"Lỗi Google Auth: {ex.Message} (Kiểm tra ClientID hoặc Token)", 0, null!, null!, null!, false, false);
            }
        }
    }
}
