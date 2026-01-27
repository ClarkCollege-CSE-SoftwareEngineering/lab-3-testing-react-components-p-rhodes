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
