import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { createApp } from "../src/app.js";
import { createDatabase } from "../src/db.js";

let database;
let app;

beforeEach(() => {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "todo-api-"),
  );
  database = createDatabase(path.join(temporaryDirectory, "test.db"));
  app = createApp(database);
});

afterEach(() => {
  database.close();
});

test("reports a healthy service", async () => {
  const response = await request(app).get("/health");

  expect(response.status).toBe(200);
  expect(response.body.status).toBe("ok");
});

test("supports the todo CRUD lifecycle", async () => {
  const createResponse = await request(app)
    .post("/api/todos")
    .send({ title: "Learn Docker" });

  expect(createResponse.status).toBe(201);
  expect(createResponse.body.completed).toBe(false);

  const todoId = createResponse.body.id;
  const listResponse = await request(app).get("/api/todos");
  expect(listResponse.body).toHaveLength(1);

  const updateResponse = await request(app)
    .put(`/api/todos/${todoId}`)
    .send({ title: "Learn Docker well", completed: true });
  expect(updateResponse.status).toBe(200);
  expect(updateResponse.body.completed).toBe(true);

  const deleteResponse = await request(app).delete(`/api/todos/${todoId}`);
  expect(deleteResponse.status).toBe(204);

  const missingResponse = await request(app).get(`/api/todos/${todoId}`);
  expect(missingResponse.status).toBe(404);
});

test("rejects invalid todo input", async () => {
  const response = await request(app).post("/api/todos").send({ title: "" });

  expect(response.status).toBe(400);
  expect(response.body.error).toContain("title");
});
