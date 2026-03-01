# Approval API Spec

## Auth

- POST /api/auth/login (username, password) -> accessToken
- Protected APIs require `Authorization: Bearer <token>`

## Forms

- POST /api/forms create approval form (title, content)
- GET /api/forms?scope=mine|todo mine / pending-for-me
- GET /api/forms/:id detail
- POST /api/forms/:id/approve approve or reject (action, comment)
