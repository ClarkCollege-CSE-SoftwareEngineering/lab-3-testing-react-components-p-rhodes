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
  
  describe('createTask', () => {
    it('test successful creation', async () => {
      const newTask={ id: '3', title: 'New Task', completed: false };
      const data={ title: 'New Task' };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(newTask),
      } as Response);

      const result=await createTask(data);

      expect(result).toEqual(newTask);
      expect(global.fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }));
    });
    
    it('test error handling', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(createTask({ title: 'Bad' })).rejects.toThrow('Failed to create task');
    });
  });

  describe('deleteTask', () => {
    it('successful deletion', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
      } as Response);

      await expect(deleteTask('123')).resolves.toBeUndefined();

      expect(global.fetch).toHaveBeenCalledWith('/api/tasks/123', expect.objectContaining({
        method: 'DELETE',
      }));
    });

    it('error handling', async () => {
      vi.mocked(global.fetch).mockResolvedValue({ ok: false, status: 500 } as Response);

      await expect(deleteTask('123')).rejects.toThrow('Failed to delete task');
    });
  });

  describe('toggleTask', () => {
    it('successful toggle', async () => {
      const updated = { id: '1', title: 'Task 1', completed: true };
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(updated),
      } as Response);

      const result = await toggleTask('1', true);

      expect(result).toEqual(updated);
      expect(global.fetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      }));
    });

    it('error handling', async () => {
      vi.mocked(global.fetch).mockResolvedValue({ ok: false } as Response);

      await expect(toggleTask('1', false)).rejects.toThrow('Failed to update task');
    });
  });
  
  describe('edge cases', () => {
    it('handles empty task list', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      const result = await fetchTasks();

      expect(result).toEqual([]);
    });

    it('ensures created tasks do not have titles longer than 64 characters', async () => {
      const longTitle='b'.repeat(80);
      const truncated=longTitle.slice(0, 64);
      const returned={ id: '200', title: truncated, completed: false };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(returned),
      } as Response);

      const result = await createTask({ title: longTitle });

      expect(global.fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: truncated }),
      }));

      expect(result.title.length).toBeLessThanOrEqual(64);
    });
  });
});