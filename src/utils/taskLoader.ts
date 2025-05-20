interface Task {
  id: string;
  content: string;
  status: 'todo' | 'inProgress' | 'done';
}

interface RawTask {
  id: string;
  content: string;
  status: string;
}

import initialTasksData from '../assets/initial-tasks.json';

const generateId = () => Math.random().toString(36).substr(2, 9);

const isValidStatus = (status: string): status is Task['status'] => {
  return ['todo', 'inProgress', 'done'].includes(status);
};

// Helper to ensure task type safety
const validateTask = (task: RawTask): Task => ({
  id: task.id || generateId(),
  content: task.content,
  status: isValidStatus(task.status) ? task.status : 'todo'
});

export const loadInitialTasks = async (): Promise<Task[]> => {
  try {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks) as RawTask[];
      return parsedTasks.map(validateTask);
    }

    // First time load from initial tasks
    const rawTasks = initialTasksData.tasks as RawTask[];
    const tasks = rawTasks.map(validateTask);
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    return tasks;
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

export const saveTasks = (tasks: Task[]) => {
  try {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('Error saving tasks:', error);
    return false;
  }
};

export const resetTasks = async (): Promise<boolean> => {
  try {
    localStorage.removeItem('tasks');
    const tasks = await loadInitialTasks();
    localStorage.setItem('tasks', JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('Error resetting tasks:', error);
    return false;
  }
};