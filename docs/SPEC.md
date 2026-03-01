# Approval API Spec

- POST /api/forms 发起审批（title, content）
- GET /api/forms?scope=mine|todo 我发起/待我审批
- GET /api/forms/:id 详情
- POST /api/forms/:id/approve 同意/拒绝（action, comment）
