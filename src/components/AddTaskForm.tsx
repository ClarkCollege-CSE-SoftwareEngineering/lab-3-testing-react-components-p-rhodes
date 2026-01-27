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


    <form onSubmit={handleSubmit} aria-label="Add Task Form">
      <label>
        Task Title
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

      {error && (

        <p id='task-error' role='alert'>
          {error}
        </p>

      )}

        Add Task
        
        </label>
      </form>


  );
}
