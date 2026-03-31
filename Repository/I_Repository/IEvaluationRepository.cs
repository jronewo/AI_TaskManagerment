using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface IEvaluationRepository
{
    Task<Evaluation?> GetByIdAsync(int evaluationId);
    Task<List<Evaluation>> GetByUserIdAsync(int userId);
    Task<List<Evaluation>> GetByLeaderIdAsync(int leaderId);
    Task AddAsync(Evaluation evaluation);
    Task UpdateAsync(Evaluation evaluation);
    Task DeleteAsync(int evaluationId);
}
