# DevOps Todo API

REST API quản lý todo bằng Node.js 18+, Express và SQLite. Project này minh họa quy trình DevOps gồm test/lint tự động, Docker image, GitHub Container Registry và deploy Render.

## Kiến trúc

- `src/app.js`: routes, validation, health check và logging.
- `src/db.js`: khởi tạo SQLite database.
- `src/todoRepository.js`: lớp truy cập dữ liệu CRUD.
- `tests/`: integration tests dùng Jest + Supertest.
- `.github/workflows/ci.yml`: chạy khi push hoặc pull request.
- `.github/workflows/cd.yml`: chạy sau CI thành công trên `main`, push image lên GHCR và gọi Render deploy hook.

## Chạy local

Yêu cầu Node.js >= 18.

```bash
cp .env.example .env
npm install
npm run lint
npm test
npm start
```

API mặc định ở `http://localhost:3000`.

## API endpoints

| Method | Path             | Mô tả                                                           |
| ------ | ---------------- | --------------------------------------------------------------- |
| GET    | `/health`        | Health check                                                    |
| GET    | `/api/todos`     | Danh sách todo                                                  |
| GET    | `/api/todos/:id` | Xem một todo                                                    |
| POST   | `/api/todos`     | Tạo todo, body `{ "title": "Learn Docker" }`                    |
| PUT    | `/api/todos/:id` | Cập nhật, body `{ "title": "Learn Docker", "completed": true }` |
| DELETE | `/api/todos/:id` | Xóa todo                                                        |

## Docker

```bash
docker compose up --build
```

Dữ liệu SQLite được giữ trong named volume `todo-data`. Kiểm tra:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/todos
```

## GitHub Actions và deploy Render

1. Push repository lên GitHub và bật package permissions cho Actions nếu cần.
2. Tạo Render Web Service từ repository, chọn Docker và bật health check `/health`.
3. Tạo Render Deploy Hook, sau đó thêm GitHub Secret tên `RENDER_DEPLOY_HOOK`.
4. Merge pull request vào `main`. CI phải pass; workflow CD sẽ build hai tag image trên GHCR và gọi hook Render.
5. Có thể kiểm tra image tại `ghcr.io/<github-username>/<repository>`.

Không commit `.env`, token, password hoặc deploy hook. File `.env.example` chỉ chứa giá trị mẫu.
