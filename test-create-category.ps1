$login = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method POST -ContentType 'application/json' -Body (@{email='admin@shoppingcart.com';password='Admin123!'} | ConvertTo-Json)
$token = $login.data.accessToken
Write-Host "Token obtained"

$headers = @{'Authorization'="Bearer $token"}
$body = @{
    name = 'Test Category'
    description = 'Test description'
    displayOrder = 10
    isFeatured = $true
    isActive = $true
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri 'http://localhost:5000/api/categories' -Method POST -ContentType 'application/json' -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "Success:"
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error Status:" $_.Exception.Response.StatusCode
    Write-Host "Error Message:" $_.Exception.Message
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $reader.ReadToEnd()
}
