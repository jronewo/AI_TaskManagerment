using System.IO;
using System.Threading.Tasks;

namespace Services.I_Services;

public interface ICloudinaryService
{
    Task<string?> UploadImageAsync(Stream imageStream, string fileName, string folder = "taskgenie");
}
