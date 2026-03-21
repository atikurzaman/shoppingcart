$login = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method POST -ContentType 'application/json' -Body (@{email='admin@shoppingcart.com';password='Admin123!'} | ConvertTo-Json)
$token = $login.data.accessToken
Write-Host "Token obtained"

$headers = @{'Authorization'="Bearer $token"}

# Get categories to get a valid categoryId
$categories = Invoke-RestMethod -Uri 'http://localhost:5000/api/categories/all' -Method GET -Headers $headers
$categoryId = $categories.data[0].id
Write-Host "Using categoryId: $categoryId"

$body = @{
    name = 'Test Product API'
    shortDescription = 'This is a test product created via API'
    description = 'Full description of the test product'
    price = 999.99
    costPrice = 500.00
    categoryId = $categoryId
    isFeatured = $false
    isBestSeller = $false
    isNewArrival = $true
    minimumStockLevel = 10
    reorderLevel = 5
    weight = 0.5
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri 'http://localhost:5000/api/products' -Method POST -ContentType 'application/json' -Headers $headers -Body $body
    Write-Host "Success!"
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error Status:" $_.Exception.Response.StatusCode
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $reader.ReadToEnd()
}
