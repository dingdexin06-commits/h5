$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:3000/api"

Write-Host "[1/6] Create form"
$createBody = @{
  title = "Laptop Purchase"
  content = "Request 2 dev laptops"
} | ConvertTo-Json

$created = Invoke-RestMethod `
  -Method Post `
  -Uri "$baseUrl/forms" `
  -ContentType "application/json" `
  -Body $createBody

Write-Host ("Created form id: " + $created.id)

Write-Host "[2/6] Query mine"
$mine = Invoke-RestMethod `
  -Method Get `
  -Uri "$baseUrl/forms?scope=mine"

Write-Host ("Mine count: " + @($mine).Count)

Write-Host "[3/6] Query manager todo"
$todo = Invoke-RestMethod `
  -Method Get `
  -Uri "$baseUrl/forms?scope=todo" `
  -Headers @{ "x-user-role" = "manager" }

Write-Host ("Todo count: " + @($todo).Count)

Write-Host "[4/6] Query detail before approve"
$detailBefore = Invoke-RestMethod `
  -Method Get `
  -Uri "$baseUrl/forms/$($created.id)"

Write-Host ("Status before approve: " + $detailBefore.form.status)

Write-Host "[5/6] Approve as manager"
$approveBody = @{
  action = "APPROVE"
  comment = "Approved"
} | ConvertTo-Json

$approved = Invoke-RestMethod `
  -Method Post `
  -Uri "$baseUrl/forms/$($created.id)/approve" `
  -Headers @{ "x-user-role" = "manager" } `
  -ContentType "application/json" `
  -Body $approveBody

Write-Host ("Approval id: " + $approved.id)

Write-Host "[6/6] Query detail after approve"
$detailAfter = Invoke-RestMethod `
  -Method Get `
  -Uri "$baseUrl/forms/$($created.id)"

Write-Host ("Status after approve: " + $detailAfter.form.status)
Write-Host ("Approvals count: " + @($detailAfter.approvals).Count)

Write-Host ""
Write-Host "Smoke test completed successfully."
