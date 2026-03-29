namespace BusinessObject.DTOs;

public class GoogleLoginDTO
{
    /// <summary>JWT id_token từ Google Identity Services (credential).</summary>
    public string Token { get; set; } = null!;
}
