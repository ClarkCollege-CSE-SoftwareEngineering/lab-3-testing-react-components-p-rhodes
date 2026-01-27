import { useState, useEffect } from 'react';
import { TaskItem } from './TaskItem';
import { AddTaskForm } from './AddTaskForm';
import * as taskApi from '../api/taskApi';

export function TaskList() {
  const [tasks, setTasks] = useState<taskApi.Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTasks = await taskApi.fetchTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAdd(title: string) {
    try {
      const newTask = await taskApi.createTask({ title });
      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      setError('Failed to add task. Please try again.');
    }
  }

  async function handleToggle(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      const updatedTask = await taskApi.toggleTask(id, !task.completed);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updatedTask : t))
      );
    } catch (err) {
      setError('Failed to update task. Please try again.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await taskApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError('Failed to delete task. Please try again.');
    }
  }

  if (isLoading) {
    return <p role="status">Loading tasks...</p>;
  }

  return (
    <div>
      <h1>Task Manager</h1>

      {error && (
        <p role="alert" style={{ color: '#dc3545' }}>
          {error}
        </p>
      )}

      <AddTaskForm onAdd={handleAdd} />

      {tasks.length === 0 ? (
        <p>No tasks yet. Add one above!</p>
      ) : (
        <ul role="list" style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
