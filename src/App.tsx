import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { PlusCircle, Pencil, Trash2, GripVertical } from 'lucide-react';
import { loadInitialTasks, saveTasks } from './utils/taskLoader';

interface Task {
  id: string;
  content: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'done';
}

const columnConfig = {
  todo: {
    title: 'TO DO',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-600',
    hoverColor: 'hover:bg-blue-600',
    description: 'Tasks that need to be started'
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
    bgColor: 'bg-green-500',
    borderColor: 'border-green-600',
    hoverColor: 'hover:bg-green-600',
    description: 'Completed tasks'
  }
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Task['status']>('todo');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    const initializeTasks = async () => {
      const loadedTasks = await loadInitialTasks();
      setTasks(loadedTasks);
    };
    initializeTasks();
  }, []);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const newTaskList = [...tasks, { 
      id: Date.now().toString(), 
      content: newTask,
      description: newDescription || undefined,
      status: selectedStatus
    }];
    
    setTasks(newTaskList);
    saveTasks(newTaskList);
    setNewTask('');
    setNewDescription('');
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
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, content: editingContent } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setEditingId(null);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const handleKeyPress = (e: React.KeyboardEvent, task: Task) => {
    if (editingId === task.id) return;
    if (e.key === 'Enter') {
      startEditing(task);
    }
    else if ((e.key === 'Delete' || e.key === 'Backspace')) {
      deleteTask(task.id);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // Don't do anything if dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Create new array of all tasks
    const allTasks = Array.from(tasks);
    
    // Find the task we're dragging
    const draggedTask = tasks.find(task => task.id === result.draggableId);
    if (!draggedTask) return;

    // Remove task from source
    const sourceColumnTasks = allTasks.filter(task => task.status === source.droppableId);
    sourceColumnTasks.splice(source.index, 1);

    // Update task status
    const updatedTask = {
      ...draggedTask,
      status: destination.droppableId as Task['status']
    };

    // Get destination column tasks
    const destinationColumnTasks = allTasks.filter(task => task.status === destination.droppableId);
    
    // Insert task at new position
    destinationColumnTasks.splice(destination.index, 0, updatedTask);

    // Combine all tasks
    const finalTasks = [
      ...allTasks.filter(task => 
        task.status !== source.droppableId && 
        task.status !== destination.droppableId
      ),
      ...sourceColumnTasks,
      ...destinationColumnTasks
    ];

    // Update state and save
    setTasks(finalTasks);
    saveTasks(finalTasks);
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Task Board</h1>
          <p className="text-gray-400">Organize and track your tasks</p>
        </header>

        <form onSubmit={addTask} className="mb-8 flex flex-col gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Task title..."
            className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white"
          />
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Task description (optional)..."
            className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white"
          />
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Task['status'])}
              className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white"
            >
              {Object.entries(columnConfig).map(([key, value]) => (
                <option key={key} value={key}>{value.title}</option>
              ))}
            </select>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle size={20} />
              <span>Add Task</span>
            </button>
          </div>
        </form>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                              } border-opacity-25 rounded-lg p-3 group ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
                              }`}
                              tabIndex={0}
                              onKeyDown={(e) => handleKeyPress(e, task)}
                            >
                              <div className="flex items-center gap-3">
                                <div {...provided.dragHandleProps} className="text-gray-400">
                                  <GripVertical size={20} />
                                </div>
                                <div className="flex-1">
                                  {editingId === task.id ? (
                                    <input
                                      type="text"
                                      value={editingContent}
                                      onChange={(e) => setEditingContent(e.target.value)}
                                      onBlur={() => saveEdit(task.id)}
                                      onKeyPress={(e) => e.key === 'Enter' && saveEdit(task.id)}
                                      className="w-full px-2 py-1 bg-gray-700 rounded text-white"
                                      autoFocus
                                    />
                                  ) : (
                                    <>
                                      <div className="text-white font-medium">{task.content}</div>
                                      {task.description && (
                                        <div className="text-sm text-gray-400 mt-1">
                                          {task.description}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => startEditing(task)}
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() => deleteTask(task.id)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
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