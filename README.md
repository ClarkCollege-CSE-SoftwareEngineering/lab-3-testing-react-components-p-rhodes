[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/OFlm_OiO)
# Lab 3: Testing React Components

## Week 3 | Testing III

## Overview

In this lab, you'll apply the React Testing Library principles from this week's readings to test React components. You'll work with a small task management application, writing tests that interact with components the way users do—not by testing implementation details, but by querying elements as users would find them.

You'll practice:

- Using Testing Library queries (getByRole, getByLabelText, getByText)
- Testing user interactions with fireEvent and userEvent
- Mocking API calls and testing async behavior
- Using spies to verify function calls

**Time Estimate:** 90-120 minutes  
**Prerequisites:** Completion of Lab 1 and 2 (Vitest fundamentals, TDD), Week 3 readings, [Node.js](https://nodejs.org/en/download/current) 20+ installed, Familiarity with [React](https://react.dev/learn) basics

> [!IMPORTANT]
> **Windows Users:** We recommend using [PowerShell](https://microsoft.com/powershell) rather than Command Prompt. Where commands differ between operating systems, both versions are provided. PowerShell commands are compatible with the Linux/macOS versions in most cases.

## Learning Objectives

By the end of this lab, you will be able to:

1. **Configure** a React + TypeScript project with Vitest and React Testing Library
2. **Apply** Testing Library's guiding principles to query elements by role, label, and text
3. **Test** user interactions including form submissions and button clicks
4. **Mock** API calls using Vitest's mocking capabilities
5. **Write** async tests using findBy queries and waitFor utilities
6. **Verify** function calls using spies

## Connection to Readings

This lab directly applies concepts from your Week 3 readings:

### From "Testing Library: Guiding Principles"

- **Query priority:** The documentation establishes a clear hierarchy: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`. In this lab, you'll practice choosing the right query—preferring semantic queries that reflect how users actually find elements on screen.
- **Testing user behavior, not implementation:** The guiding principles state that utilities should "deal with DOM nodes rather than component instances." You'll see this in action as we query buttons by their accessible names rather than by internal component state.

### From "Introducing the react-testing-library" (Kent C. Dodds)

- **Why Testing Library replaced Enzyme:** Kent explains that Enzyme's utilities made it too easy to test implementation details. In this lab, you'll experience the Testing Library philosophy firsthand—writing tests that would still pass even if you refactored component internals.
- **The guiding principle:** Kent's famous quote—_"The more your tests resemble the way your software is used, the more confidence they can give you"_—shapes every test we write. When you test a form, you'll type into inputs and click buttons just as a user would.

### From "React Testing Library GitHub README"

- **The render() function and screen object:** You'll use `render()` to mount components and `screen` to query the rendered output. The README explains that `screen` has every query pre-bound to `document.body`, simplifying your test code.
- **Query variants (getBy, queryBy, findBy):** The README distinguishes between queries that throw on failure (`getBy`), return null (`queryBy`), and wait asynchronously (`findBy`). You'll use all three strategically—`getBy` for elements that must exist, `queryBy` for asserting absence, and `findBy` for async operations.

---

## Part 1: Project Setup (15 minutes)

### Step 1.1: Clone Your Repository

After accepting the GitHub Classroom assignment, you'll have a personal repository. Clone it to your local machine:

```bash
git clone git@github.com:ClarkCollege-CSE-SoftwareEngineering/lab-3-testing-react-components-YOURUSERNAME.git
cd lab-3-testing-react-components-YOURUSERNAME
```

> [!NOTE]
> Replace `YOURUSERNAME` with your actual GitHub username. You can copy the exact clone URL from your repository page on GitHub.

Your cloned repository already contains:

- `README.md` -- These lab instructions
- `.gitignore` -- Pre-configured to ignore `node_modules/`, `dist/`, `coverage/`, etc.
- `.github/workflows/test.yml` -- GitHub Actions workflow for automated testing

### Step 1.2: Initialize and Install Dependencies

```bash
npm init -y
```

```bash
npm install react react-dom
npm install -D typescript vitest @vitest/coverage-v8 jsdom
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @types/react @types/react-dom @types/node
```

### Step 1.3: Create TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

### Step 1.4: Create Vitest Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/setupTests.ts",
        "**/*.d.ts",
        "**/*.config.*",
        "src/main.tsx",
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
```

### Step 1.5: Create Test Setup File

Create `src/setupTests.ts`:

```typescript
import "@testing-library/jest-dom";
```

### Step 1.6: Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "typecheck": "tsc --noEmit"
  }
}
```

✅ **Checkpoint:** Run `npm run typecheck` — it should complete with no errors.

---

## Part 2: Building the Task Component (20 minutes)

We'll build a simple `TaskItem` component and test it following Testing Library principles.

### Step 2.1: Create the TaskItem Component

Create `src/components/TaskItem.tsx`:

```tsx
export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li
      role="listitem"
      aria-label={`Task: ${task.title}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        borderBottom: '1px solid #eee',
      }}
    >
      <input
        type="checkbox"
        id={`task-${task.id}`}
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />
      <label
        htmlFor={`task-${task.id}`}
        style={{
          flex: 1,
          textDecoration: task.completed ? 'line-through' : 'none',
          color: task.completed ? '#888' : 'inherit',
        }}
      >
        {task.title}
      </label>
      <button
        onClick={() => onDelete(task.id)}
        aria-label={`Delete "${task.title}"`}
        style={{
          background: '#dc3545',
          color: 'white',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Delete
      </button>
    </li>
  );
}
```

### Step 2.2: Create TaskItem Tests

Create `src/__tests__/TaskItem.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem, Task } from '../components/TaskItem';

describe('TaskItem', () => {
  // Helper to create a test task
  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: '1',
    title: 'Test Task',
    completed: false,
    ...overrides,
  });

  describe('rendering', () => {
    it('displays the task title', () => {
      const task = createTask({ title: 'Buy groceries' });
      render(
        <TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} />
      );

      // Using getByText - appropriate here because the title IS the content users see
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    it('shows checkbox as unchecked for incomplete tasks', () => {
      const task = createTask({ completed: false });
      render(
        <TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} />
      );

      // Using getByRole with name - the preferred query method
      const checkbox = screen.getByRole('checkbox', {
        name: /mark "test task" as complete/i,
      });
      expect(checkbox).not.toBeChecked();
    });

    it('shows checkbox as checked for completed tasks', () => {
      const task = createTask({ completed: true });
      render(
        <TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} />
      );

      const checkbox = screen.getByRole('checkbox', {
        name: /mark "test task" as incomplete/i,
      });
      expect(checkbox).toBeChecked();
    });

    it('applies strikethrough style to completed task title', () => {
      const task = createTask({ completed: true, title: 'Completed task' });
      render(
        <TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} />
      );

      const label = screen.getByText('Completed task');
      expect(label).toHaveStyle({ textDecoration: 'line-through' });
    });
  });

  describe('interactions', () => {
    it('calls onToggle with task id when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const task = createTask({ id: 'task-123' });

      render(
        <TaskItem task={task} onToggle={onToggle} onDelete={vi.fn()} />
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onToggle).toHaveBeenCalledWith('task-123');
    });

    it('calls onDelete with task id when delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      const task = createTask({ id: 'task-456', title: 'Task to delete' });

      render(
        <TaskItem task={task} onToggle={vi.fn()} onDelete={onDelete} />
      );

      // Using getByRole with accessible name
      const deleteButton = screen.getByRole('button', {
        name: /delete "task to delete"/i,
      });
      await user.click(deleteButton);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith('task-456');
    });
  });
});
```

✅ **Checkpoint:** Run `npm test` — all 6 tests should pass.

🤔 **Reflection Question:** Notice how we're using `getByRole` with accessible names like `name: /delete "task to delete"/i`. How does this approach differ from using `getByTestId('delete-button')`? Which approach better reflects how users interact with the UI? (Hint: Consider Kent C. Dodds' guiding principle from your readings.)

---

## Part 3: Testing Forms with User Events (25 minutes)

Now let's create a form component and test user input.

### Step 3.1: Create the AddTaskForm Component

Create `src/components/AddTaskForm.tsx`:

```tsx
import React, { useState } from 'react';

export interface AddTaskFormProps {
  onAdd: (title: string) => void;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Task title is required');
      return;
    }

    if (trimmedTitle.length < 3) {
      setError('Task title must be at least 3 characters');
      return;
    }

    onAdd(trimmedTitle);
    setTitle('');
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Add new task">
      <div style={{ marginBottom: '8px' }}>
        <label htmlFor="task-title">Task Title</label>
        <input
          type="text"
          id="task-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Enter task title..."
          aria-describedby={error ? 'task-error' : undefined}
          aria-invalid={error ? 'true' : 'false'}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px',
            marginTop: '4px',
            border: error ? '2px solid #dc3545' : '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>
      {error && (
        <p
          id="task-error"
          role="alert"
          style={{ color: '#dc3545', margin: '0 0 8px 0' }}
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Add Task
      </button>
    </form>
  );
}
```

### Step 3.2: Create AddTaskForm Tests

Create `src/__tests__/AddTaskForm.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTaskForm } from '../components/AddTaskForm';

describe('AddTaskForm', () => {
  describe('rendering', () => {
    it('renders a form with label, input, and button', () => {
      render(<AddTaskForm onAdd={vi.fn()} />);

      // Using getByLabelText - the preferred query for form fields
      expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
    });

    it('input is initially empty', () => {
      render(<AddTaskForm onAdd={vi.fn()} />);

      const input = screen.getByLabelText(/task title/i);
      expect(input).toHaveValue('');
    });
  });

  describe('form submission', () => {
    it('calls onAdd with trimmed title on valid submission', async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(<AddTaskForm onAdd={onAdd} />);

      const input = screen.getByLabelText(/task title/i);
      const button = screen.getByRole('button', { name: /add task/i });

      await user.type(input, '  Buy groceries  ');
      await user.click(button);

      expect(onAdd).toHaveBeenCalledWith('Buy groceries');
    });

    it('clears input after successful submission', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAdd={vi.fn()} />);

      const input = screen.getByLabelText(/task title/i);

      await user.type(input, 'New task');
      await user.click(screen.getByRole('button', { name: /add task/i }));

      expect(input).toHaveValue('');
    });

    it('allows submission with Enter key', async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(<AddTaskForm onAdd={onAdd} />);

      const input = screen.getByLabelText(/task title/i);
      await user.type(input, 'Task via Enter{Enter}');

      expect(onAdd).toHaveBeenCalledWith('Task via Enter');
    });
  });

  describe('validation', () => {
    it('shows error when submitting empty title', async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(<AddTaskForm onAdd={onAdd} />);

      await user.click(screen.getByRole('button', { name: /add task/i }));

      // Using getByRole('alert') - semantic query for error messages
      expect(screen.getByRole('alert')).toHaveTextContent(/required/i);
      expect(onAdd).not.toHaveBeenCalled();
    });

    it('shows error when title is less than 3 characters', async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(<AddTaskForm onAdd={onAdd} />);

      await user.type(screen.getByLabelText(/task title/i), 'ab');
      await user.click(screen.getByRole('button', { name: /add task/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/at least 3 characters/i);
      expect(onAdd).not.toHaveBeenCalled();
    });

    it('clears error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAdd={vi.fn()} />);

      // Trigger an error
      await user.click(screen.getByRole('button', { name: /add task/i }));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Start typing - error should clear
      await user.type(screen.getByLabelText(/task title/i), 'a');

      // queryBy returns null instead of throwing
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('marks input as invalid when there is an error', async () => {
      const user = userEvent.setup();
      render(<AddTaskForm onAdd={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: /add task/i }));

      const input = screen.getByLabelText(/task title/i);
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
```

✅ **Checkpoint:** Run `npm test` — all tests should pass (15+ tests now).

🤔 **Reflection Question:** We used `queryByRole('alert')` instead of `getByRole('alert')` when checking that an error message does NOT exist. Why? What would happen if we used `getByRole` for an element that doesn't exist?

---

## Part 4: Mocking API Calls and Async Testing (30 minutes)

Now let's test a component that fetches data from an API.

### Step 4.1: Create an API Module

Create `src/api/taskApi.ts`:

```typescript
export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface CreateTaskData {
  title: string;
}

const API_BASE = '/api/tasks';

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

export async function createTask(data: CreateTaskData): Promise<Task> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  return response.json();
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
}

export async function toggleTask(id: string, completed: boolean): Promise<Task> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  if (!response.ok) {
    throw new Error('Failed to update task');
  }
  return response.json();
}
```

### Step 4.2: Create the TaskList Component

Create `src/components/TaskList.tsx`:

```tsx
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
```

### Step 4.3: Create TaskList Tests with Mocked API

Create `src/__tests__/TaskList.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from '../components/TaskList';
import * as taskApi from '../api/taskApi';

// Mock the entire API module
vi.mock('../api/taskApi');

// Type the mocked module
const mockedTaskApi = vi.mocked(taskApi);

describe('TaskList', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
  });

  describe('loading state', () => {
    it('shows loading message while fetching tasks', () => {
      // Mock fetchTasks to never resolve during this test
      mockedTaskApi.fetchTasks.mockImplementation(
        () => new Promise(() => {})
      );

      render(<TaskList />);

      expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
    });
  });

  describe('displaying tasks', () => {
    it('renders fetched tasks', async () => {
      mockedTaskApi.fetchTasks.mockResolvedValue([
        { id: '1', title: 'First task', completed: false },
        { id: '2', title: 'Second task', completed: true },
      ]);

      render(<TaskList />);

      // Using findBy for async - waits for elements to appear
      expect(await screen.findByText('First task')).toBeInTheDocument();
      expect(await screen.findByText('Second task')).toBeInTheDocument();
    });

    it('shows empty state when no tasks exist', async () => {
      mockedTaskApi.fetchTasks.mockResolvedValue([]);

      render(<TaskList />);

      expect(await screen.findByText(/no tasks yet/i)).toBeInTheDocument();
    });

    it('shows error message when fetch fails', async () => {
      mockedTaskApi.fetchTasks.mockRejectedValue(new Error('Network error'));

      render(<TaskList />);

      expect(await screen.findByRole('alert')).toHaveTextContent(/failed to load/i);
    });
  });

  describe('adding tasks', () => {
    it('adds new task via the form', async () => {
      const user = userEvent.setup();

      mockedTaskApi.fetchTasks.mockResolvedValue([]);
      mockedTaskApi.createTask.mockResolvedValue({
        id: 'new-1',
        title: 'New task',
        completed: false,
      });

      render(<TaskList />);

      // Wait for loading to complete
      await screen.findByText(/no tasks yet/i);

      // Fill out form and submit
      await user.type(screen.getByLabelText(/task title/i), 'New task');
      await user.click(screen.getByRole('button', { name: /add task/i }));

      // Verify the new task appears
      expect(await screen.findByText('New task')).toBeInTheDocument();

      // Verify API was called correctly
      expect(mockedTaskApi.createTask).toHaveBeenCalledWith({ title: 'New task' });
    });
  });

  describe('toggling tasks', () => {
    it('toggles task completion status', async () => {
      const user = userEvent.setup();

      mockedTaskApi.fetchTasks.mockResolvedValue([
        { id: '1', title: 'Test task', completed: false },
      ]);
      mockedTaskApi.toggleTask.mockResolvedValue({
        id: '1',
        title: 'Test task',
        completed: true,
      });

      render(<TaskList />);

      // Wait for task to load
      await screen.findByText('Test task');

      // Click the checkbox
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      // Verify API was called
      expect(mockedTaskApi.toggleTask).toHaveBeenCalledWith('1', true);

      // Verify checkbox is now checked
      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });
    });
  });

  describe('deleting tasks', () => {
    it('removes task when delete button is clicked', async () => {
      const user = userEvent.setup();

      mockedTaskApi.fetchTasks.mockResolvedValue([
        { id: '1', title: 'Task to delete', completed: false },
      ]);
      mockedTaskApi.deleteTask.mockResolvedValue();

      render(<TaskList />);

      // Wait for task to load
      await screen.findByText('Task to delete');

      // Click delete button
      await user.click(screen.getByRole('button', { name: /delete/i }));

      // Verify API was called
      expect(mockedTaskApi.deleteTask).toHaveBeenCalledWith('1');

      // Verify task is removed from the list
      await waitFor(() => {
        expect(screen.queryByText('Task to delete')).not.toBeInTheDocument();
      });
    });
  });

  // TODO: Add your own test - test error handling when createTask fails
  // Hint: Use mockRejectedValue and check for the error alert
});
```

✅ **Checkpoint:** Run `npm test` — all tests should pass.

🤔 **Reflection Question:** Compare how we used `screen.findByText` (returns a Promise, waits for element) versus `screen.getByText` (synchronous, throws immediately if not found). When should you use each? How does this connect to the discussion of `findBy` queries in the React Testing Library documentation?

---

## Part 5: Your Turn — Write Your Own Tests (20 minutes)

Now it's time to apply what you've learned. You'll write several tests on your own.

### Task 5.1: Complete the TODO in TaskList.test.tsx

Find the TODO comment in `TaskList.test.tsx` and implement a test for error handling when `createTask` fails.

Requirements:

- Mock `createTask` to reject with an error
- Verify the error alert appears with appropriate message
- Verify the task is NOT added to the list

### Task 5.2: Add Tests for the API Module

Create `src/__tests__/taskApi.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTasks, createTask, deleteTask, toggleTask } from '../api/taskApi';

describe('taskApi', () => {
  // Store the original fetch
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  afterEach(() => {
    // Restore original fetch after tests
    global.fetch = originalFetch;
  });

  describe('fetchTasks', () => {
    it('returns tasks on successful response', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', completed: false },
        { id: '2', title: 'Task 2', completed: true },
      ];

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTasks),
      } as Response);

      const result = await fetchTasks();

      expect(result).toEqual(mockTasks);
      expect(global.fetch).toHaveBeenCalledWith('/api/tasks');
    });

    it('throws error on failed response', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(fetchTasks()).rejects.toThrow('Failed to fetch tasks');
    });
  });

  // TODO: Add tests for createTask
  // - Test successful creation (mock POST request, verify body and headers)
  // - Test error handling

  // TODO: Add tests for deleteTask
  // - Test successful deletion (mock DELETE request)
  // - Test error handling

  // TODO: Add tests for toggleTask
  // - Test successful toggle (mock PATCH request, verify body)
  // - Test error handling
});
```

Complete the TODOs above to test the remaining API functions.

### Task 5.3: Add Edge Case Tests

Add at least 2 more tests to any of the test files that cover edge cases. Ideas:

- What happens if a user tries to add a task with only whitespace?
- What happens if tasks have very long titles?
- Test keyboard navigation (can users Tab through the form?)

---

## Deliverables

Your submission should include:

```text
react-test-lab/
├── src/
│   ├── components/
│   │   ├── TaskItem.tsx
│   │   ├── AddTaskForm.tsx
│   │   └── TaskList.tsx
│   ├── api/
│   │   └── taskApi.ts
│   ├── __tests__/
│   │   ├── TaskItem.test.tsx
│   │   ├── AddTaskForm.test.tsx
│   │   ├── TaskList.test.tsx
│   │   └── taskApi.test.ts
│   └── setupTests.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md (your reflection)
```

### README.md Requirements

Your `README.md` must include:

1. **Your Name and Date**

2. **Reflection Section** (minimum 200 words) answering:
   - How does using `getByRole` and `getByLabelText` improve test reliability compared to `getByTestId`?
   - Describe a situation where you would use `queryBy` instead of `getBy`.
   - What are the trade-offs of mocking API calls vs. testing against a real backend?

3. **Key Concepts** section listing 3-5 concepts you learned

### Requirements Summary

- [ ] Minimum **25 passing tests**
- [ ] Minimum **90% code coverage**
- [ ] All TODOs completed
- [ ] README.md with reflection and key concepts
- [ ] TypeScript compiles without errors

---

## Grading Rubric

| Criteria                                                                   | Points  |
| -------------------------------------------------------------------------- | ------- |
| Project setup correct (dependencies, Vitest config, TypeScript)            | 15      |
| Core component tests pass (TaskItem, AddTaskForm with appropriate queries) | 20      |
| Async and mocking tests pass (TaskList, taskApi with proper mocking)       | 20      |
| Student-added tests complete (all TODOs + 2 edge cases)                    | 20      |
| README complete with reflection (200+ words) and key concepts              | 15      |
| Code quality (90%+ coverage, clean code, proper TypeScript)                | 10      |
| **Total**                                                                  | **100** |

---

## Stretch Goals

If you finish early, try these challenges:

1. **Add Snapshot Testing**: Create a snapshot test for the `TaskItem` component and research when snapshot tests are (and aren't) useful.

2. **Test Accessibility**: Use `@testing-library/jest-dom`'s accessibility matchers to verify ARIA attributes.

3. **Test with MSW**: Replace the vi.mock approach with [Mock Service Worker (MSW)](https://mswjs.io/) for more realistic API mocking.

4. **Add Sorting Tests**: Add a feature to sort tasks and write tests for it.

---

## Troubleshooting

### "Cannot find module '@testing-library/react'"

```bash
npm install -D @testing-library/react @testing-library/jest-dom
```

### "TextEncoder is not defined"

Add to your `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    environment: "jsdom",
    // ... other config
  },
});
```

### Tests are timing out

- Make sure you're awaiting all async operations
- Check that mocked promises are resolving/rejecting as expected
- Use `waitFor` with a longer timeout if needed: `await waitFor(() => {...}, { timeout: 3000 })`

### Coverage not meeting threshold

- Run `npm run test:coverage` to see the detailed report
- Check `coverage/index.html` in a browser to see uncovered lines
- Make sure to test error paths, not just happy paths

---

## Submission

1. Push your code to your GitHub repository
2. Verify GitHub Actions passes all checks
3. Submit your repository URL via Canvas

**Due:** Monday of Week 4

---

## Resources

- 🔗 [Testing Library Documentation](https://testing-library.com/docs/)
- 🔗 [Testing Library Query Priority](https://testing-library.com/docs/queries/about#priority)
- 🔗 [Vitest Documentation](https://vitest.dev/)
- 🔗 [Common Testing Library Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
