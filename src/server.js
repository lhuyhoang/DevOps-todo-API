import "dotenv/config";
import { createApp } from "./app.js";
import { createDatabase } from "./db.js";

const port = Number(process.env.PORT || 3000);
const databasePath = process.env.DATABASE_PATH || "./data/todos.db";
const database = createDatabase(databasePath);
const app = createApp(database);

const server = app.listen(port, () => {
  console.log(`Todo API listening on port ${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
