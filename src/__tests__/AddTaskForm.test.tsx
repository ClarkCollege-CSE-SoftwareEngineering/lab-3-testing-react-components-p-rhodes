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
