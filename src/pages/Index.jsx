import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { todoService } from '../services/todoService';
import { FaPlus } from "react-icons/fa";
import { FaPen } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const Index = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [newTodoText, setNewTodoText] = useState('');
  const [showNewTodoForm, setShowNewTodoForm] = useState(false);

  const columns = {
    pending: { title: 'Pending', color: 'bg-orange-100 border-orange-300' },
    'in-progress': { title: 'In Progress', color: 'bg-blue-100 border-blue-300' },
    completed: { title: 'Completed', color: 'bg-green-100 border-green-300' }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todoService.getTodos();
      const todosWithStatus = data.map((todo) => ({
        ...todo,
        status: todo.completed ? 'completed' : 'pending'
      }));
      setTodos(todosWithStatus);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const todoId = parseInt(draggableId);
    
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;
    
    setTodos(prev => prev.map(todo => 
      todo.id === todoId 
        ? { ...todo, status: newStatus, completed: newStatus === 'completed' }
        : todo
    ));

    try {
      await todoService.updateTodo(todoId, { 
        completed: newStatus === 'completed',
        status: newStatus 
      });
    } catch (error) {
      setTodos(prev => prev.map(todo => 
        todo.id === todoId 
          ? { ...todo, status: source.droppableId, completed: source.droppableId === 'completed' }
          : todo
      ));
      console.error('Failed to update todo status:', error);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodoText.trim()) return;

    try {
      const newTodo = await todoService.createTodo({
        todo: newTodoText,
        completed: false,
        userId: 1
      });
      
      setTodos(prev => [...prev, { ...newTodo, status: 'pending' }]);
      setNewTodoText('');
      setShowNewTodoForm(false);
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const handleEditTodo = async (id) => {
    if (!editText.trim()) return;

    try {
      await todoService.updateTodo(id, { todo: editText });
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, todo: editText } : todo
      ));
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await todoService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.todo);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-700 mt-4">Loading your board...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">To Do Board</h1>
          <p className="text-lg text-gray-600">Manage your tasks with drag & drop</p>
        </div>

        {/* Add New Task Button/Form */}
        <div className="flex justify-center mb-8">
          {!showNewTodoForm ? (
            <button
              onClick={() => setShowNewTodoForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <FaPlus/>
              <span>Add New Task</span>
            </button>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Enter task description..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
              />
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={handleAddTodo}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Add</span>
                </button>
                <button
                  onClick={() => {
                    setShowNewTodoForm(false);
                    setNewTodoText('');
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(columns).map(([status, column]) => (
              <div key={status} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Column Header */}
                <div className={`p-4 ${column.color} border-b-4`}>
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center justify-between">
                    {column.title}
                    <span className="bg-white text-gray-700 text-sm px-2 py-1 rounded-full">
                      {todos.filter(todo => todo.status === status).length}
                    </span>
                  </h2>
                </div>
                
                {/* Droppable Area */}
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 min-h-96 transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      {todos
                        .filter(todo => todo.status === status)
                        .map((todo, index) => (
                          <Draggable
                            key={todo.id}
                            draggableId={todo.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 cursor-grab shadow-sm hover:shadow-md transition-all duration-200 ${
                                  snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                                }`}
                              >
                                {editingId === todo.id ? (
                                  <div>
                                    <input
                                      type="text"
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-3"
                                      autoFocus
                                      onKeyDown={(e) => e.key === 'Enter' && handleEditTodo(todo.id)}
                                    />
                                    <div className="flex space-x-2 justify-end">
                                      <button
                                        onClick={() => handleEditTodo(todo.id)}
                                        className="text-green-600 hover:text-green-800 p-1"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={cancelEditing}
                                        className="text-gray-600 hover:text-gray-800 p-1"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <h1 className="text-gray-800 mb-3">{todo.todo}</h1>
                                    <p className='text-gray-500 text-sm'>Task description of Task {todo.id}</p>
                                    <div className='w-full border-1 opacity-85 border-gray-300 my-3'></div>
                                    <div className="flex space-x-2 justify-end">
                                      <button
                                        onClick={() => startEditing(todo)}
                                        className="text-blue-700 hover:text-blue-800 p-1"
                                      >
                                       <FaPen size={20}/>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTodo(todo.id)}
                                        className="text-red-600 hover:text-red-800 p-1"
                                      >
                                       <MdDeleteForever size={20}/>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                      
                      {/* Empty State */}
                      {todos.filter(todo => todo.status === status).length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-4xl mb-2">📝</div>
                          <p>No tasks in {column.title.toLowerCase()}</p>
                        </div>
                      )}
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
};

export default Index;