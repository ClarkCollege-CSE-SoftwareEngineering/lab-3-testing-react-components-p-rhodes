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
