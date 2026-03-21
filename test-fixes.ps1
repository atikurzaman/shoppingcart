$login = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method POST -ContentType 'application/json' -Body (@{email='admin@shoppingcart.com';password='Admin123!'} | ConvertTo-Json)
$token = $login.data.accessToken
Write-Host "Token obtained: $($token.Substring(0, 30))..."
$headers = @{'Authorization'="Bearer $token"}

Write-Host "`n=== 1. CART - Add Item ==="
try {
    $cart = Invoke-RestMethod -Uri 'http://localhost:5000/api/cart/items' -Method POST -ContentType 'application/json' -Headers $headers -Body (@{productId=8;quantity=1} | ConvertTo-Json)
    $cart | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: " $_.Exception.Message
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    Write-Host $reader.ReadToEnd()
}

Write-Host "`n=== 2. WISHLIST - Add Item ==="
try {
    $wishlist = Invoke-RestMethod -Uri 'http://localhost:5000/api/wishlist' -Method POST -ContentType 'application/json' -Headers $headers -Body (@{productId=8} | ConvertTo-Json)
    $wishlist | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: " $_.Exception.Message
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    Write-Host $reader.ReadToEnd()
}

Write-Host "`n=== 3. REPORTS - Dashboard ==="
try {
    $dashboard = Invoke-RestMethod -Uri 'http://localhost:5000/api/reports/dashboard' -Method GET -Headers $headers
    $dashboard | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: " $_.Exception.Message
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    Write-Host $reader.ReadToEnd()
}
