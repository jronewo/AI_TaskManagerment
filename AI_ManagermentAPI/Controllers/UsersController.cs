using BusinessObject.DTOs;
using Microsoft.AspNetCore.Mvc;
using Repository.I_Repository;
using Services.I_Services;
using System.Threading.Tasks;

namespace AI_ManagermentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IWebHostEnvironment _env;

        public UsersController(IUserRepository userRepository, ICloudinaryService cloudinaryService, IWebHostEnvironment env)
        {
            _userRepository = userRepository;
            _cloudinaryService = cloudinaryService;
            _env = env;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchByEmail([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return BadRequest("Email is required.");
            
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null) return NotFound("User not found.");

            var result = new UserSearchDto
            {
                UserId = user.UserId,
                Name = user.Name ?? "No Name",
                Email = user.Email ?? string.Empty,
                Avatar = user.Avatar
            };

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return NotFound("User not found.");

            return Ok(new GetUserProfileDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Avatar = user.Avatar,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            });
        }

        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileDto dto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return NotFound("User not found.");

            if (!string.IsNullOrWhiteSpace(dto.Name))
                user.Name = dto.Name;

            if (dto.Avatar != null)
                user.Avatar = dto.Avatar;

            user.UpdatedAt = System.DateTime.Now;
            await _userRepository.UpdateUserAsync(user);

            return Ok(new GetUserProfileDto
            {
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Avatar = user.Avatar,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            });
        }

        private async Task<string> HandleImageUploadFallbackAsync(IFormFile file, string folder)
        {
            string url = null;
            try
            {
                using var stream = file.OpenReadStream();
                url = await _cloudinaryService.UploadImageAsync(stream, file.FileName, folder);
            }
            catch (System.Exception)
            {
                // Cloudinary failed
                url = null;
            }

            if (!string.IsNullOrEmpty(url)) return url;

            // Fallback: Save local
            var webRootPath = _env.WebRootPath ?? System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsFolder = System.IO.Path.Combine(webRootPath, "uploads", folder.Replace("/", "_"));
            if (!System.IO.Directory.Exists(uploadsFolder))
                System.IO.Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = System.Guid.NewGuid().ToString() + "_" + file.FileName;
            var filePath = System.IO.Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // Return relative path for frontend (assuming backend serves from root /)
            return $"/uploads/{folder.Replace("/", "_")}/{uniqueFileName}";
        }

        [HttpPost("{id}/avatar")]
        public async Task<IActionResult> UploadAvatar(int id, IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");
            if (file.Length > 5 * 1024 * 1024) return BadRequest("File size must be less than 5MB.");

            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType)) return BadRequest("Only JPEG, PNG, GIF, and WebP images are allowed.");

            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return NotFound("User not found.");

            var url = await HandleImageUploadFallbackAsync(file, "taskgenie/avatars");

            user.Avatar = url;
            user.UpdatedAt = System.DateTime.Now;
            await _userRepository.UpdateUserAsync(user);

            return Ok(new { avatarUrl = url });
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file, [FromQuery] string folder = "taskgenie/comments")
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");
            if (file.Length > 10 * 1024 * 1024) return BadRequest("File size must be less than 10MB.");

            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType)) return BadRequest("Only JPEG, PNG, GIF, and WebP images are allowed.");

            var url = await HandleImageUploadFallbackAsync(file, folder);

            return Ok(new { imageUrl = url });
        }

        [HttpPut("{id}/change-password")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordDto dto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return NotFound("User not found.");

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.Password))
            {
                return BadRequest(new { message = "Mật khẩu hiện tại không đúng." });
            }

            // Hash new password
            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.UpdatedAt = System.DateTime.Now;
            
            await _userRepository.UpdateUserAsync(user);

            return Ok(new { message = "Đổi mật khẩu thành công." });
        }
    }
}
