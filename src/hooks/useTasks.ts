import { useState, useEffect, useCallback } from 'react';
import { taskService, TaskQueryParams, AdminTaskQueryParams, Task, transformTaskData } from '../services/taskService';
import { toast } from 'sonner';

interface UseTasksOptions {
  autoFetch?: boolean;
  searchTerm?: string;
  statusFilter?: string;
  userRole?: 'student' | 'admin';
  priorityFilter?: string;
  typeFilter?: string;
  assignedAdminFilter?: string;
  studentFilter?: string;
}

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (params?: TaskQueryParams) => Promise<void>;
  refreshTasks: () => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<Task | null>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task | null>;
  updateTaskStatus: (taskId: string, status: Task['status'], reason?: string, feedback?: string) => Promise<Task | null>;
  updateAdminTaskStatus: (taskId: string | number, status: Task['status'], reason?: string, feedback?: string) => Promise<Task | null>;
  deleteTask: (taskId: string, reason?: string) => Promise<boolean>;
  assignTask: (taskId: string, adminId: string) => Promise<Task | null>;
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const {
    autoFetch = true,
    searchTerm = '',
    statusFilter = 'all',
    userRole = 'student',
    priorityFilter = 'all',
    typeFilter = 'all',
    assignedAdminFilter = 'all',
    studentFilter = 'all'
  } = options;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQueryParams = useCallback(() => {
    if (userRole === 'admin') {
      const params: any = {};

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (priorityFilter !== 'all') {
        params.priority = priorityFilter;
      }

      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      if (assignedAdminFilter !== 'all') {
        params.assigned_admin_id = assignedAdminFilter;
      }

      if (studentFilter !== 'all') {
        params.user_id = studentFilter;
      }

      return params;
    } else {
      const params: TaskQueryParams = {};

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter as TaskQueryParams['status'];
      }

      return params;
    }
  }, [searchTerm, statusFilter, userRole, priorityFilter, typeFilter, assignedAdminFilter, studentFilter]);

  const fetchTasks = useCallback(async (customParams?: any) => {
    setLoading(true);
    setError(null);

    try {
      const params = customParams || buildQueryParams();
      const response = userRole === 'admin' 
        ? await taskService.getAdminTasks(params)
        : await taskService.getTasks(params);

      if (response.success) {
        console.log('Raw tasks from backend:', response.data);
        
        // Transform backend data to frontend format
        let transformedTasks = response.data.map(transformTaskData);
        console.log('Transformed tasks:', transformedTasks);
        
        // Fetch deliverables for each task if they're not included
        const tasksWithDeliverables = await Promise.all(
          transformedTasks.map(async (task) => {
            try {
              // Only fetch deliverables if not already present or empty
              if (!task.deliverables || task.deliverables.length === 0) {
                console.log(`Fetching deliverables for task: ${task.title} (ID: ${task.id})`);
                const deliverablesResponse = await taskService.getTaskDeliverables(task.id);
                console.log(`Deliverables response for ${task.title}:`, deliverablesResponse);
                if (deliverablesResponse.success) {
                  console.log(`Found ${deliverablesResponse.data.length} deliverables for ${task.title}`);
                  return {
                    ...task,
                    deliverables: deliverablesResponse.data
                  };
                }
              } else {
                console.log(`Task ${task.title} already has ${task.deliverables.length} deliverables`);
              }
              return task;
            } catch (error) {
              console.warn(`Failed to fetch deliverables for task ${task.id}:`, error);
              // Return task without deliverables rather than failing completely
              return task;
            }
          })
        );
        
        console.log('Final tasks with deliverables:', tasksWithDeliverables);
        setTasks(tasksWithDeliverables);
      } else {
        throw new Error('Failed to fetch tasks');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
      
      // Show error toast
      toast.error('Failed to load tasks', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: () => fetchTasks(customParams),
        },
      });
      
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  const refreshTasks = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (taskData: Partial<Task>): Promise<Task | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await taskService.createTask(taskData);
      
      if (response.success) {
        const transformedTask = transformTaskData(response.data);
        
        // Add the new task to the beginning of the list
        setTasks(prev => [transformedTask, ...prev]);
        
        toast.success('Task created successfully', {
          description: `"${transformedTask.title}" has been created.`,
        });
        
        return transformedTask;
      } else {
        throw new Error('Failed to create task');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      
      toast.error('Failed to create task', {
        description: errorMessage,
      });
      
      console.error('Error creating task:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await taskService.updateTask(taskId, updates);
      
      if (response.success) {
        const transformedTask = transformTaskData(response.data);
        
        // Update the task in the list
        setTasks(prev => prev.map(task => 
          task.id === taskId ? transformedTask : task
        ));
        
        toast.success('Task updated successfully', {
          description: `"${transformedTask.title}" has been updated.`,
        });
        
        return transformedTask;
      } else {
        throw new Error('Failed to update task');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      
      toast.error('Failed to update task', {
        description: errorMessage,
      });
      
      console.error('Error updating task:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (
    taskId: string, 
    status: Task['status'], 
    reason?: string, 
    feedback?: string
  ): Promise<Task | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await taskService.updateTaskStatus(taskId, status, reason, feedback);
      
      if (response.success) {
        const transformedTask = transformTaskData(response.data);
        
        // Update the task in the list
        setTasks(prev => prev.map(task => 
          task.id === taskId ? transformedTask : task
        ));
        
        const statusMessages = {
          pending: 'marked as pending',
          in_progress: 'marked as in progress',
          completed: 'marked as completed',
          revision_needed: 'marked as needing revision',
          rejected: 'rejected',
        };
        
        toast.success('Task status updated', {
          description: `"${transformedTask.title}" has been ${statusMessages[status]}.`,
        });
        
        return transformedTask;
      } else {
        throw new Error('Failed to update task status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task status';
      setError(errorMessage);
      
      toast.error('Failed to update task status', {
        description: errorMessage,
      });
      
      console.error('Error updating task status:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string, reason?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await taskService.deleteTask(taskId, reason);
      
      if (response.success) {
        // Remove the task from the list
        const deletedTask = tasks.find(task => task.id === taskId);
        setTasks(prev => prev.filter(task => task.id !== taskId));
        
        toast.success('Task deleted successfully', {
          description: deletedTask ? `"${deletedTask.title}" has been deleted.` : 'Task has been deleted.',
        });
        
        return true;
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      
      toast.error('Failed to delete task', {
        description: errorMessage,
      });
      
      console.error('Error deleting task:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [tasks]);

  const assignTask = useCallback(async (taskId: string, adminId: string): Promise<Task | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await taskService.assignTask(taskId, adminId);
      
      if (response.success) {
        const transformedTask = transformTaskData(response.data);
        
        // Update the task in the list
        setTasks(prev => prev.map(task => 
          task.id === taskId ? transformedTask : task
        ));
        
        toast.success('Task assigned successfully', {
          description: `"${transformedTask.title}" has been assigned.`,
        });
        
        return transformedTask;
      } else {
        throw new Error('Failed to assign task');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign task';
      setError(errorMessage);
      
      toast.error('Failed to assign task', {
        description: errorMessage,
      });
      
      console.error('Error assigning task:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch tasks on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchTasks();
    }
  }, [fetchTasks, autoFetch]);

  const updateAdminTaskStatus = useCallback(async (
    taskId: string | number, 
    status: Task['status'],
    reason?: string,
    feedback?: string
  ): Promise<Task | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await taskService.updateAdminTaskStatus(taskId, status, reason, feedback);
      
      if (response.success) {
        const transformedTask = transformTaskData(response.data);
        
        // Update the task in the list
        setTasks(prev => prev.map(task => 
          task.id === taskId.toString() ? transformedTask : task
        ));
        
        const statusMessages = {
          pending: 'marked as pending',
          in_progress: 'marked as in progress',
          completed: 'marked as completed',
          revision_needed: 'marked as needing revision',
          rejected: 'rejected',
        };
        
        toast.success('Task status updated', {
          description: `"${transformedTask.title}" has been ${statusMessages[status]}.`,
        });
        
        return transformedTask;
      } else {
        throw new Error('Failed to update task status');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
      setError(errorMessage);
      
      toast.error('Failed to update task status', {
        description: errorMessage,
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    refreshTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    updateAdminTaskStatus,
    deleteTask,
    assignTask,
  };
}

// Additional hooks for specific use cases

export function useTaskById(taskId: string) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await taskService.getTaskById(taskId);
      
      if (response.success) {
        const transformedTask = transformTaskData(response.data);
        setTask(transformedTask);
      } else {
        throw new Error('Failed to fetch task');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch task';
      setError(errorMessage);
      console.error('Error fetching task:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return { task, loading, error, refetch: fetchTask };
}