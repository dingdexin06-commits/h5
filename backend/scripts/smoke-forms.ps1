$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:3000/api"

Write-Host "[1/8] Login as employee"
$employeeLoginBody = @{
  username = "employee"
  password = "123456"
} | ConvertTo-Json

$employeeLogin = Invoke-RestMethod `
  -Method Post `
  -Uri "$baseUrl/auth/login" `
  -ContentType "application/json" `
  -Body $employeeLoginBody

$employeeHeaders = @{ Authorization = "Bearer $($employeeLogin.accessToken)" }

Write-Host "[2/8] Login as manager"
$managerLoginBody = @{
  username = "manager"
  password = "123456"
} | ConvertTo-Json

$managerLogin = Invoke-RestMethod `
  -Method Post `
  -Uri "$baseUrl/auth/login" `
  -ContentType "application/json" `
  -Body $managerLoginBody

$managerHeaders = @{ Authorization = "Bearer $($managerLogin.accessToken)" }

Write-Host "[3/8] Create form as employee"
$createBody = @{
  title = "Laptop Purchase"
  content = "Request 2 dev laptops"
} | ConvertTo-Json

$created = Invoke-RestMethod `
  -Method Post `
  -Uri "$baseUrl/forms" `
  -Headers $employeeHeaders `
  -ContentType "application/json" `
  -Body $createBody

Write-Host ("Created form id: " + $created.id)

Write-Host "[4/8] Query mine as employee"
$mine = Invoke-RestMethod `
  -Method Get `
  -Uri "$baseUrl/forms?scope=mine" `
  -Headers $employeeHeaders

Write-Host ("Mine count: " + @($mine).Count)

Write-Host "[5/8] Query todo as manager"
$todo = Invoke-RestMethod `
  -Method Get `
  -Uri "$baseUrl/forms?scope=todo" `
  -Headers $managerHeaders

Write-Host ("Todo count: " + @($todo).Count)

Write-Host "[6/8] Query detail before approve"
$detailBefore = Invoke-RestMethod `
  -Method Get `
  -Uri "$baseUrl/forms/$($created.id)" `
  -Headers $employeeHeaders

Write-Host ("Status before approve: " + $detailBefore.form.status)

Write-Host "[7/8] Approve as manager"
$approveBody = @{
  action = "APPROVE"
  comment = "Approved"
} | ConvertTo-Json

$approved = Invoke-RestMethod `
  -Method Post `
  -Uri "$baseUrl/forms/$($created.id)/approve" `
  -Headers $managerHeaders `
  -ContentType "application/json" `
  -Body $approveBody

Write-Host ("Approval id: " + $approved.id)

Write-Host "[8/8] Query detail after approve"
$detailAfter = Invoke-RestMethod `
  -Method Get `
  -Uri "$baseUrl/forms/$($created.id)" `
  -Headers $employeeHeaders

Write-Host ("Status after approve: " + $detailAfter.form.status)
Write-Host ("Approvals count: " + @($detailAfter.approvals).Count)

Write-Host ""
Write-Host "Smoke test completed successfully."
