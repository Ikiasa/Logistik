# GPS Simulation menggunakan PowerShell dengan UUID dari database
$baseUrl = "http://localhost:3000/api/api/tracking/update"
$token = "mock-jwt|user-1|00000000-0000-0000-0000-000000000000|admin@logistik.com"

$vehicles = @(
    @{ id = "11111111-2222-3333-4444-555555555551"; name = "Vehicle 1"; lat = -6.1751; lng = 106.8272 }
    @{ id = "11111111-2222-3333-4444-555555555552"; name = "Vehicle 2"; lat = -6.2; lng = 106.8166 }
)

Write-Host "🚀 Starting GPS Simulation..." -ForegroundColor Green
Write-Host "Target: $baseUrl" -ForegroundColor Cyan
Write-Host "Vehicles: $($vehicles.Count)" -ForegroundColor Cyan
Write-Host ""

$count = 0

while ($true) {
    foreach ($v in $vehicles) {
        # Update position randomly
        $v.lat += (Get-Random -Minimum -0.001 -Maximum 0.001)
        $v.lng += (Get-Random -Minimum -0.001 -Maximum 0.001)
        
        $body = @{
            vehicle_id = $v.id
            driver_id  = "driver-1"  # Not used but required by interface
            latitude   = [double]$v.lat
            longitude  = [double]$v.lng
            speed      = Get-Random -Minimum 40 -Maximum 80
            heading    = Get-Random -Minimum 0 -Maximum 360
            accuracy   = 5
        } | ConvertTo-Json
        
        try {
            $headers = @{
                "Content-Type"  = "application/json"
                "Authorization" = "Bearer $token"
            }
            
            $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body -Headers $headers -ErrorAction Stop
            $count++
            Write-Host "✅ [$((Get-Date).ToString('HH:mm:ss'))] $($v.name) -> OK [Total: $count]" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ [$((Get-Date).ToString('HH:mm:ss'))] $($v.name) FAILED: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Seconds 4
}
