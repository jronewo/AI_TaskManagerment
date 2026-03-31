using System;

namespace BusinessObject.DTOs;

public class InvitationDto
{
    public int InvitationId { get; set; }
    public int? TeamId { get; set; }
    public string? TeamName { get; set; }
    public string? Email { get; set; }
    public string? Status { get; set; }
}

public class CreateInvitationDto
{
    public int TeamId { get; set; }
    public string Email { get; set; } = null!;
}

public class UpdateInvitationStatusDto
{
    public string Status { get; set; } = null!;
}
