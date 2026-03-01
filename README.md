# wecom-oa

## Frontend

```bash
cd frontend
npm install
npm run dev
npm test
npm run build
```

Vite proxies `/api` to `http://localhost:3000`.

## Backend

```bash
cd backend
npm install
npm run start:dev
```

## Auth

### Login accounts (demo)

- employee / 123456
- manager / 123456

### Login API

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"employee","password":"123456"}'
```

The response includes `accessToken`. Use it as `Authorization: Bearer <token>`.

## APIs

- `GET /api/health` -> `{ ok: true }`
- `GET /api/me` -> current user from token
- `POST /api/forms` create form
- `GET /api/forms?scope=mine|todo` list forms
- `GET /api/forms/:id` detail
- `POST /api/forms/:id/approve` approve/reject

### curl example for forms

```bash
# 1) login as employee
EMP_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"employee","password":"123456"}' | jq -r '.accessToken')

# 2) create form
curl -X POST http://localhost:3000/api/forms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMP_TOKEN" \
  -d '{"title":"Laptop Purchase","content":"Request 2 dev laptops"}'

# 3) login as manager
MGR_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager","password":"123456"}' | jq -r '.accessToken')

# 4) list manager todo
curl "http://localhost:3000/api/forms?scope=todo" \
  -H "Authorization: Bearer $MGR_TOKEN"
```

### PowerShell example for forms

```powershell
# 1) login as employee
$employeeLoginBody = @{ username = "employee"; password = "123456" } | ConvertTo-Json
$employeeToken = (Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/auth/login" `
  -ContentType "application/json" -Body $employeeLoginBody).accessToken

# 2) create form
$createBody = @{ title = "Laptop Purchase"; content = "Request 2 dev laptops" } | ConvertTo-Json
$created = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/forms" `
  -Headers @{ Authorization = "Bearer $employeeToken" } -ContentType "application/json" -Body $createBody

# 3) login as manager
$managerLoginBody = @{ username = "manager"; password = "123456" } | ConvertTo-Json
$managerToken = (Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/auth/login" `
  -ContentType "application/json" -Body $managerLoginBody).accessToken

# 4) manager todo list
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/forms?scope=todo" `
  -Headers @{ Authorization = "Bearer $managerToken" }

# 5) manager approves
$approveBody = @{ action = "APPROVE"; comment = "Approved" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/forms/$($created.id)/approve" `
  -Headers @{ Authorization = "Bearer $managerToken" } -ContentType "application/json" -Body $approveBody
```

### One-command smoke test

```bash
cd backend
npm run smoke:forms
```
