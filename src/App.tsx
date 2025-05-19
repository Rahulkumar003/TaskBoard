import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PlusCircle, Pencil, Trash2, GripVertical } from 'lucide-react';
import { loadInitialTasks } from './utils/taskLoader';

// Replace quadrantConfig with columnConfig
const columnConfig = {
  todo: {
    title: 'TO DO',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-600',
    hoverColor: 'hover:bg-blue-600',
    description: 'Tasks to be started'
  },
  inProgress: {
    title: 'IN PROGRESS',
    bgColor: 'bg-amber-500',
    borderColor: 'border-amber-600',
    hoverColor: 'hover:bg-amber-600',
    description: 'Tasks currently being worked on'
  },
  done: {
    title: 'DONE',
    bgColor: 'bg-emerald-500',
    borderColor: 'border-emerald-600',
    hoverColor: 'hover:bg-emerald-600',
    description: 'Completed tasks'
  }
};

// Update Task interface
interface Task {
  id: string;
  content: string;
  status: 'todo' | 'inProgress' | 'done'; // Replace quadrant with status
}

function App(){
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Task['status']>('todo');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Add these functions to handle backend communication
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const resetTasks = async () => {
    try {
      await fetch('/api/reset-tasks', { method: 'POST' });
      await fetchTasks();
    } catch (error) {
      console.error('Error resetting tasks:', error);
    }
  };

  // Modify addTask to include API call
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newTask,
          status: selectedStatus
        })
      });
      const task = await response.json();
      setTasks([...tasks, task]);
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditingContent(task.content);
  };

  const saveEdit = (id: string) => {
    if (!editingContent.trim()) {
      deleteTask(id);
      return;
    }
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, content: editingContent } : task
    ));
    setEditingId(null);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent, task: Task) => {
    if (editingId===task.id)return;
    if (e.key === 'Enter') {
      startEditing(task);
    }
    else if ((e.key === 'Delete' || e.key === 'Backspace')  ) {
      deleteTask(task.id);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    const taskList = Array.from(tasks);
    const [movedTask] = taskList.splice(source.index, 1);
    
    movedTask.status = destination.droppableId as Task['status'];
    
    const sourceStatusTasks = taskList.filter(task => task.status === source.droppableId);
    const destStatusTasks = taskList.filter(task => task.status === destination.droppableId);
    
    const remainingTasks = taskList.filter(
      task => task.status !== source.droppableId && task.status !== destination.droppableId
    );
    
    destStatusTasks.splice(destination.index, 0, movedTask);
    
    const newTasks = [
      ...remainingTasks,
      ...sourceStatusTasks,
      ...destStatusTasks
    ];
    
    setTasks(newTasks);
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  // Modify your useEffect to load initial tasks
  useEffect(() => {
    const initializeApp = async () => {
      await loadInitialTasks();
      await fetchTasks();
    };
    
    initializeApp();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Task Manager
          </h1>
          <p className="text-gray-400">
            Organize your tasks using a Kanban Board
          </p>
        </header>

        {import.meta.env.DEV && (
          <button
            onClick={resetTasks}
            className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reset Tasks
          </button>
        )}

        <form onSubmit={addTask} className="mb-8 flex gap-2 max-w-2xl mx-auto">
          <div className="flex-1">
            <label htmlFor="newTask" className="sr-only">New task</label>
            <input
              id="newTask"
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              aria-label="New task input"
            />
          </div>
          <div>
            <label htmlFor="status" className="sr-only">Select status</label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Task['status'])}
              className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              aria-label="Select task status"
            >
              {Object.entries(columnConfig).map(([key, value]) => (
                <option key={key} value={key}>{value.title}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            aria-label="Add task"
          >
            <PlusCircle size={20} />
            <span>Add</span>
          </button>
        </form>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(columnConfig).map(([statusKey, statusValue]) => (
              <div key={statusKey} className="bg-gray-800 rounded-lg p-4">
                <div className="mb-4">
                  <h2 className={`text-lg font-bold text-white text-center py-2 rounded ${statusValue.bgColor}`}>
                    {statusValue.title}
                  </h2>
                  <p className="text-sm text-gray-400 mt-2 text-center">
                    {statusValue.description}
                  </p>
                </div>
                <Droppable droppableId={statusKey}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-3 min-h-[200px] rounded-lg p-2 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-gray-700 bg-opacity-50' : ''
                      }`}
                    >
                      {getTasksByStatus(statusKey as Task['status']).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`${statusValue.bgColor} bg-opacity-10 border ${
                                statusValue.borderColor
                              } border-opacity-25 rounded-lg p-3 flex items-center gap-3 group ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
                              } hover:bg-opacity-20 transition-all focus-within:ring-2 focus-within:ring-blue-500`}
                              role="listitem"
                              tabIndex={0}
                              onKeyDown={(e) => handleKeyPress(e, task)}
                              aria-label={`Task: ${task.content}. Press Enter to edit, Delete to remove`}
                            >
                              <div 
                                {...provided.dragHandleProps} 
                                className="text-gray-400 hover:text-gray-300"
                                aria-label="Drag handle"
                              >
                                <GripVertical size={20} />
                              </div>
                              
                              {editingId === task.id ? (
                                <input
                                  type="text"
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                  onBlur={() => saveEdit(task.id)}
                                  onKeyPress={(e) => e.key === 'Enter' && saveEdit(task.id)}
                                  className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                                  autoFocus
                                  aria-label="Edit task"
                                />
                              ) : (
                                <span className="flex-1 text-white">{task.content}</span>
                              )}
                              
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditing(task)}
                                  className="text-blue-400 hover:text-blue-300 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  aria-label="Edit task"
                                >
                                  <Pencil size={18} />
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="text-red-400 hover:text-red-300 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                  aria-label="Delete task"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

export default App;