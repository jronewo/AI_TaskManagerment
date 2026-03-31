using BusinessObject.DTOs;
using Microsoft.AspNetCore.Mvc;
using Services.I_Services;

namespace AI_ManagermentAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class OrganizationsController : ControllerBase
{
    private readonly IOrganizationService _organizationService;
    private readonly IProjectEvaluationService _evaluationService;

    public OrganizationsController(
        IOrganizationService organizationService,
        IProjectEvaluationService evaluationService)
    {
        _organizationService = organizationService;
        _evaluationService = evaluationService;
    }

    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAllOrganizations()
    {
        // In a real app, you would add [Authorize(Roles = "ADMIN")] here
        var orgs = await _organizationService.GetAllOrganizationsAsync();
        return Ok(orgs);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyOrganization()
    {
        var userIdHeader = Request.Headers["X-User-Id"].FirstOrDefault();
        if (userIdHeader == null || !int.TryParse(userIdHeader, out var userId))
        {
            return Unauthorized(new { message = "User identity is required." });
        }

        var orgs = await _organizationService.GetAllOrganizationsAsync();
        // Just find the org where this user is the Owner
        // Alternatively, use IOrganizationRepository directly, but since we are in Controller, we can filter GetAll
        // Or better yet, we can add GetOrganizationByOwnerId to IOrganizationService.
        // For simplicity right now, filtering the loaded list or modifying service.
        var myOrg = orgs.FirstOrDefault(o => o.OwnerId == userId);
        
        if (myOrg == null) return NotFound(new { message = "You do not own any organization." });

        // Let's get the full structure (projects, teams) for the dashboard
        var fullOrg = await _organizationService.GetOrganizationAsync(myOrg.OrganizationId);
        var projects = await _organizationService.GetOrganizationProjectsAsync(myOrg.OrganizationId);
        
        return Ok(new { org = fullOrg, projects = projects });
    }

    [HttpGet("{orgId}")]
    public async Task<IActionResult> GetOrganization(int orgId)
    {
        var org = await _organizationService.GetOrganizationAsync(orgId);
        if (org == null) return NotFound("Organization not found.");
        return Ok(org);
    }

    [HttpGet("{orgId}/projects")]
    public async Task<IActionResult> GetOrganizationProjects(int orgId)
    {
        var projects = await _organizationService.GetOrganizationProjectsAsync(orgId);
        return Ok(projects);
    }

    [HttpGet("{orgId}/projects/{projectId}")]
    public async Task<IActionResult> GetProjectDetail(int orgId, int projectId)
    {
        var project = await _organizationService.GetProjectDetailAsync(orgId, projectId);
        if (project == null) return NotFound("Project not found in this organization.");
        return Ok(project);
    }

    [HttpPost("{orgId}/projects/{projectId}/evaluate")]
    public async Task<IActionResult> EvaluateProject(int orgId, int projectId, [FromBody] CreateProjectEvaluationRequest request)
    {
        var project = await _organizationService.GetProjectDetailAsync(orgId, projectId);
        if (project == null) return NotFound("Project not found in this organization.");
        if (project.Status != "Completed") return BadRequest("Can only evaluate completed projects.");

        var success = await _evaluationService.EvaluateProjectAsync(projectId, request);
        if (!success) return BadRequest("Project has already been evaluated.");

        return Ok("Project evaluation submitted successfully.");
    }

    [HttpGet("{orgId}/projects/{projectId}/evaluation")]
    public async Task<IActionResult> GetProjectEvaluation(int orgId, int projectId)
    {
        var project = await _organizationService.GetProjectDetailAsync(orgId, projectId);
        if (project == null) return NotFound("Project not found in this organization.");

        var evaluation = await _evaluationService.GetEvaluationAsync(projectId);
        if (evaluation == null) return NotFound("Evaluation not found for this project.");

        return Ok(evaluation);
    }
}
