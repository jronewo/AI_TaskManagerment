using BusinessObject.Models;
using Task = System.Threading.Tasks.Task;

namespace Services.I_Services;

public interface ITaskProgressService
{
    Task UpdateProgressAsync(int taskId, int progress, string? note, string? risk);
}
