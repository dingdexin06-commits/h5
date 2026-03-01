# wecom-oa

## Frontend

```bash
cd frontend
npm install
npm run dev
npm test
npm run build
```

Vite 已将 `/api` 代理到 `http://localhost:3000`。

## Backend

```bash
cd backend
npm install
npm run start:dev
```

可用接口：

- `GET /api/health` 返回 `{ ok: true }`
- `GET /api/me` 返回固定测试用户（含部门、角色）

### 审批接口（forms）curl 示例

```bash
# 1) 普通员工发起审批（默认员工 id=u_1001）
curl -X POST http://localhost:3000/api/forms \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Laptop Purchase\",\"content\":\"Request 2 dev laptops\"}"

# 2) 查询我发起的审批
curl "http://localhost:3000/api/forms?scope=mine"

# 3) 经理查询待审批（需请求头 x-user-role=manager）
curl "http://localhost:3000/api/forms?scope=todo" \
  -H "x-user-role: manager"

# 4) 查询审批详情
curl "http://localhost:3000/api/forms/f_1"

# 5) 经理同意/拒绝审批
curl -X POST http://localhost:3000/api/forms/f_1/approve \
  -H "Content-Type: application/json" \
  -H "x-user-role: manager" \
  -d "{\"action\":\"APPROVE\",\"comment\":\"Approved\"}"
```

### 审批接口（forms）PowerShell 示例（推荐）

```powershell
# 1) 普通员工发起审批（默认员工 id=u_1001）
$body = @{
  title = "Laptop Purchase"
  content = "Request 2 dev laptops"
} | ConvertTo-Json

$created = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/forms" `
  -ContentType "application/json" -Body $body

# 2) 查询我发起的审批
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/forms?scope=mine"

# 3) 经理查询待审批（需请求头 x-user-role=manager）
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/forms?scope=todo" `
  -Headers @{ "x-user-role" = "manager" }

# 4) 查询审批详情
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/forms/$($created.id)"

# 5) 经理同意/拒绝审批
$approveBody = @{ action = "APPROVE"; comment = "Approved" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/forms/$($created.id)/approve" `
  -Headers @{ "x-user-role" = "manager" } -ContentType "application/json" -Body $approveBody
```

### 一键冒烟脚本

```bash
cd backend
npm run smoke:forms
```
