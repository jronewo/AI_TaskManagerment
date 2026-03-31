using System;
using System.Collections.Generic;

namespace BusinessObject.DTOs;

public class TeamDto
{
    public int TeamId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int? CreatedBy { get; set; }
    public string? CreatorName { get; set; }
    public List<TeamMemberDto> Members { get; set; } = new();
}

public class TeamMemberDto
{
    public int Id { get; set; }
    public int TeamId { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public string? Role { get; set; }
}

public class CreateTeamDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int CreatedBy { get; set; }
}

public class AddTeamMemberDto
{
    public int TeamId { get; set; }
    public int UserId { get; set; }
    public string Role { get; set; } = "MEMBER";
}
