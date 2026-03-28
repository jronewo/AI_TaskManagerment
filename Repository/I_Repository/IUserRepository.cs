using BusinessObject.Models;


namespace Repository.I_Repository;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int userId);
    Task<List<User>> GetAllAsync();
    Task<List<User>> GetByTeamIdAsync(int teamId);
    Task<List<UserSkill>> GetUserSkillsAsync(int userId);
    Task<List<UserAvailability>> GetUserAvailabilityAsync(int userId);
    Task<List<Evaluation>> GetUserEvaluationsAsync(int userId);
    Task<int> CountActiveTasksByUserAsync(int userId);
    Task<User> GetByEmailAsync(string email);
    System.Threading.Tasks.Task AddUserAsync(User user);
}
