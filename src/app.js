import express from "express";
import morgan from "morgan";
import { createTodoRepository } from "./todoRepository.js";

function validateTodoPayload(payload, requireAllFields = false) {
  if (!payload || typeof payload !== "object") {
    return "Request body must be a JSON object";
  }
  if (requireAllFields && typeof payload.completed !== "boolean") {
    return "`completed` must be a boolean";
  }
  if (typeof payload.title !== "string" || payload.title.trim().length === 0) {
    return "`title` is required and must be a non-empty string";
  }
  if (payload.title.trim().length > 200) {
    return "`title` must be 200 characters or fewer";
  }
  if (
    payload.completed !== undefined &&
    typeof payload.completed !== "boolean"
  ) {
    return "`completed` must be a boolean";
  }
  return null;
}

export function createApp(database) {
  const app = express();
  const todos = createTodoRepository(database);

  app.use(express.json({ limit: "10kb" }));
  app.use(morgan("combined"));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", service: "todo-api" });
  });

  app.get("/api/todos", (_request, response) => {
    response.json(todos.findAll());
  });

  app.get("/api/todos/:id", (request, response) => {
    const todo = todos.findById(Number(request.params.id));
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    return response.json(todo);
  });

  app.post("/api/todos", (request, response) => {
    const validationError = validateTodoPayload(request.body);
    if (validationError) {
      return response.status(400).json({ error: validationError });
    }
    const todo = todos.create(request.body.title.trim());
    return response.status(201).json(todo);
  });

  app.put("/api/todos/:id", (request, response) => {
    const validationError = validateTodoPayload(request.body, true);
    if (validationError) {
      return response.status(400).json({ error: validationError });
    }
    const todo = todos.update(
      Number(request.params.id),
      request.body.title.trim(),
      request.body.completed,
    );
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    return response.json(todo);
  });

  app.delete("/api/todos/:id", (request, response) => {
    const deleted = todos.delete(Number(request.params.id));
    if (!deleted) {
      return response.status(404).json({ error: "Todo not found" });
    }
    return response.status(204).send();
  });

  app.use((_request, response) => {
    response.status(404).json({ error: "Route not found" });
  });

  app.use((error, _request, response, _next) => {
    if (error instanceof SyntaxError && "body" in error) {
      return response
        .status(400)
        .json({ error: "Request body contains invalid JSON" });
    }
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  });

  return app;
}
