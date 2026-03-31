using System.Collections.Generic;

namespace BusinessObject.DTOs;

public class SkillDto
{
    public int SkillId { get; set; }
    public string SkillName { get; set; } = null!;
}

public class UserSkillDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public int SkillId { get; set; }
    public string? SkillName { get; set; }
    public int? Level { get; set; } // 1-5 or similar
}

public class AddUserSkillDto
{
    public int UserId { get; set; }
    public int SkillId { get; set; }
    public int Level { get; set; }
}

public class CreateSkillDto
{
    public string SkillName { get; set; } = null!;
}
