using System;

namespace BusinessObject.DTOs
{
    public class UserSearchDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Avatar { get; set; }
    }

    public class AddProjectMemberDto
    {
        public int ProjectId { get; set; }
        public string Email { get; set; } = null!;
        public string Role { get; set; } = "MEMBER";
    }

    public class UpdateProfileDto
    {
        public string? Name { get; set; }
        public string? Avatar { get; set; }
    }

    public class GetUserProfileDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Avatar { get; set; }
        public string? Role { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }
}
