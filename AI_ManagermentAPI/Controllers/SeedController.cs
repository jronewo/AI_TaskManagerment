using BusinessObject.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace AI_ManagermentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SeedController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SeedController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("init")]
        public async Task<IActionResult> InitSeedData()
        {
            try
            {
                // 1. Seed Users
                var admin = _context.Users.FirstOrDefault(u => u.Email == "admin@gmail.com");
                if (admin == null)
                {
                    admin = new User { Name = "Admin System", Email = "admin@gmail.com", Password = BCrypt.Net.BCrypt.HashPassword("123"), Role = "ADMIN", Status = 1, CreatedAt = DateTime.UtcNow };
                    _context.Users.Add(admin);
                }

                var leader = _context.Users.FirstOrDefault(u => u.Email == "leader@gmail.com");
                if (leader == null)
                {
                    leader = new User { Name = "Leader Org", Email = "leader@gmail.com", Password = BCrypt.Net.BCrypt.HashPassword("123"), Role = "ORGANIZATION_HR", Status = 1, CreatedAt = DateTime.UtcNow };
                    _context.Users.Add(leader);
                }

                var member = _context.Users.FirstOrDefault(u => u.Email == "member@gmail.com");
                if (member == null)
                {
                    member = new User { Name = "Member Team", Email = "member@gmail.com", Password = BCrypt.Net.BCrypt.HashPassword("123"), Role = "NORMAL_USER", Status = 1, CreatedAt = DateTime.UtcNow };
                    _context.Users.Add(member);
                }

                await _context.SaveChangesAsync();

                // 2. Seed Organization
                var org = _context.Organizations.FirstOrDefault(o => o.Name == "TechCorp Demo");
                if (org == null)
                {
                    org = new Organization { Name = "TechCorp Demo", Description = "Seed Data Organization", OwnerId = admin.UserId };
                    _context.Organizations.Add(org);
                    await _context.SaveChangesAsync();
                }

                // 3. Seed Team & Project
                var proName = "AI Agent Prototype";
                var project = _context.Projects.FirstOrDefault(p => p.Name == proName);
                if (project == null)
                {
                    var team = new Team { Name = "AI Dev Team", Description = "Demo AI Team", CreatedBy = leader.UserId };
                    _context.Teams.Add(team);
                    await _context.SaveChangesAsync();
                    
                    _context.TeamMembers.Add(new TeamMember { TeamId = team.TeamId, UserId = leader.UserId, Role = "LEADER" });
                    _context.TeamMembers.Add(new TeamMember { TeamId = team.TeamId, UserId = member.UserId, Role = "MEMBER" });
                    await _context.SaveChangesAsync();

                    project = new Project { 
                        Name = proName, 
                        Description = "Project có task giả lập để test quét rủi ro", 
                        CreatedBy = leader.UserId,
                        OrganizationId = org.OrganizationId,
                        TeamId = team.TeamId,
                        Status = "In Progress",
                        CreatedAt = DateTime.UtcNow,
                        Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7))
                    };
                    _context.Projects.Add(project);
                    await _context.SaveChangesAsync();

                    // 4. Seed Tasks
                    var tasks = new[]
                    {
                        new BusinessObject.Models.Task { ProjectId = project.ProjectId, Title = "Thiết kế UI", Description = "Dựng Figma giao diện", Status = "Done", Priority = "Medium", EstimatedTime = 8, Progress = 100, CreatedAt = DateTime.UtcNow.AddDays(-2), Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)) },
                        new BusinessObject.Models.Task { ProjectId = project.ProjectId, Title = "Cài đặt Authentication", Description = "Auth với JWT / Header", Status = "In Progress", Priority = "High", EstimatedTime = 20, Progress = 50, CreatedAt = DateTime.UtcNow, Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)), RiskLevel = "MEDIUM" },
                        new BusinessObject.Models.Task { ProjectId = project.ProjectId, Title = "Huấn luyện Model AI", Description = "Rất mất thời gian", Status = "Todo", Priority = "Highest", EstimatedTime = 100, Progress = 0, CreatedAt = DateTime.UtcNow.AddDays(-5), Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)), RiskLevel = "HIGH" },
                        new BusinessObject.Models.Task { ProjectId = project.ProjectId, Title = "Viết Document", Description = "Tài liệu hệ thống", Status = "Todo", Priority = "Low", EstimatedTime = 10, Progress = 0, CreatedAt = DateTime.UtcNow, Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10)), RiskLevel = "LOW" }
                    };

                    _context.Tasks.AddRange(tasks);
                    await _context.SaveChangesAsync();

                    // Assign tasks
                    _context.TaskAssignees.Add(new TaskAssignee { TaskId = tasks[1].TaskId, UserId = member.UserId });
                    _context.TaskAssignees.Add(new TaskAssignee { TaskId = tasks[2].TaskId, UserId = leader.UserId });
                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "Seed data created successfully! Passwords are '123'. Emails: admin@gmail.com, leader@gmail.com, member@gmail.com" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Seeding failed.", error = ex.Message });
            }
        }
    }
}
