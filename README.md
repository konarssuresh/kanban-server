# Kanban Server

Express + MongoDB backend for the Kanban task management app.

## Features
- User signup/login with JWT stored in httpOnly cookie
- CRUD for boards, columns, tasks, and subtasks
- Drag-and-drop support via task move endpoint
- Swagger UI documentation at `/docs`

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT auth, cookie-based sessions

## Getting Started
1. Install dependencies:
   - `npm install`
2. Set environment variables (create `.env` in project root):
   - `PORT=8000`
   - `JWT_SECRET=your-secret`
   - `CORS_ORIGINS=http://localhost:5173`
3. Start the server:
   - `npm run dev`

## API Documentation
- Swagger UI: `http://localhost:8000/docs`
- OpenAPI spec: `src/api/openapi.yaml`

## Scripts
- `npm run dev` - Start with nodemon
- `npm start` - Start server

## Project Structure
- `src/routes` - API routes
- `src/models` - Mongoose schemas
- `src/middleware` - Auth middleware
- `src/api` - OpenAPI spec loader and YAML
