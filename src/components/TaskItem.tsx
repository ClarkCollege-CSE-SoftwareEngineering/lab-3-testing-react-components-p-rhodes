//import React from 'react';

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

    <div>
      <input
        type="checkbox"
        id={`task-${task.id}`}
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />

        {task.title}

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
      </div>


  );
}
