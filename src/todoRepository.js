function mapTodo(row) {
  return {
    id: row.id,
    title: row.title,
    completed: Boolean(row.completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createTodoRepository(database) {
  const findAllStatement = database.prepare(
    "SELECT * FROM todos ORDER BY id DESC",
  );
  const findByIdStatement = database.prepare(
    "SELECT * FROM todos WHERE id = ?",
  );
  const insertStatement = database.prepare(
    "INSERT INTO todos (title) VALUES (?)",
  );
  const updateStatement = database.prepare(
    "UPDATE todos SET title = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
  );
  const deleteStatement = database.prepare("DELETE FROM todos WHERE id = ?");

  return {
    findAll() {
      return findAllStatement.all().map(mapTodo);
    },
    findById(id) {
      const todo = findByIdStatement.get(id);
      return todo ? mapTodo(todo) : null;
    },
    create(title) {
      const result = insertStatement.run(title);
      return this.findById(result.lastInsertRowid);
    },
    update(id, title, completed) {
      const result = updateStatement.run(title, completed ? 1 : 0, id);
      return result.changes === 0 ? null : this.findById(id);
    },
    delete(id) {
      return deleteStatement.run(id).changes > 0;
    },
  };
}
