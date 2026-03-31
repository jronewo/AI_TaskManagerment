using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Task = System.Threading.Tasks.Task;

namespace Repository.I_Repository;

public interface IProjectEvaluationRepository
{
    Task<ProjectEvaluation?> GetByProjectIdAsync(int projectId);
    Task<ProjectEvaluation?> GetByIdAsync(int evaluationId);
    Task<bool> ExistsByProjectIdAsync(int projectId);
    Task AddAsync(ProjectEvaluation evaluation);
    Task UpdateAsync(ProjectEvaluation evaluation);
}
