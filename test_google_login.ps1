# Script test API Google Login Mock (Dev Mode)
# Yêu cầu: Backend phải đang chạy tại http://localhost:5283 (hoặc port của bạn)

$baseUrl = "http://localhost:5283/api/auth/google"
$mockToken = "MOCK_GOOGLE_TOKEN_ADMIN"

$body = @{
    token = $mockToken
} | ConvertTo-Json

Write-Host "--- Testing Google Login API (MOCK) ---" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body -ContentType "application/json"
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "Message: $($response.message)"
    Write-Host "Role: $($response.role)"
    Write-Host "Token (Hệ thống):" -ForegroundColor Yellow
    Write-Host $response.token
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) { Write-Host $_.ErrorDetails }
}
Write-Host "---------------------------------------"
