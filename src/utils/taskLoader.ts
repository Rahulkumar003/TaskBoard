interface InitialTask {
  id: string;
  content: string;
  status: 'todo' | 'inProgress' | 'done';
}

interface InitialTasksData {
  tasks: InitialTask[];
}

import initialTasks from '../assets/initial-tasks.json';

export const loadInitialTasks = async () => {
  try {
    const response = await fetch('/api/tasks');
    const existingTasks = await response.json();

    if (existingTasks.length === 0) {
      const typedInitialTasks = initialTasks as InitialTasksData;
      const promises = typedInitialTasks.tasks.map((task: InitialTask) =>
        fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(task)
        })
      );

      await Promise.all(promises);
    }
  } catch (error) {
    console.error('Error loading initial tasks:', error);
  }
};

export const resetTasks = async () => {
  try {
    const response = await fetch('/api/tasks');
    const existingTasks: InitialTask[] = await response.json();
    
    await Promise.all(
      existingTasks.map((task: InitialTask) =>
        fetch(`/api/tasks/${task.id}`, {
          method: 'DELETE'
        })
      )
    );

    await loadInitialTasks();
  } catch (error) {
    console.error('Error resetting tasks:', error);
  }
};