$login = Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/login' -Method POST -ContentType 'application/json' -Body '{"email":"admin@shoppingcart.com","password":"Admin123!"}' | ConvertFrom-Json
$token = $login.data.accessToken
Write-Host "Token obtained: $($token.Substring(0, 50))..."

$headers = @{'Authorization' = "Bearer $token"}

$categoryBody = @{
    name = "Electronics"
    description = "Electronic devices and accessories"
    displayOrder = 1
    isFeatured = $true
    isActive = $true
} | ConvertTo-Json

$category = Invoke-WebRequest -Uri 'http://localhost:5000/api/categories' -Method POST -ContentType 'application/json' -Headers $headers -Body $categoryBody | ConvertFrom-Json
$category | ConvertTo-Json -Depth 5
