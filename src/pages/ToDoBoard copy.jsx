import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  Box,
  Chip,
  IconButton,
  Paper,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Close as CloseIcon, 
  Check as CheckIcon 
} from '@mui/icons-material';
import { todoService } from '../services/todoService';

const ToDoBoard = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [newTodoText, setNewTodoText] = useState('');
  const [showNewTodoForm, setShowNewTodoForm] = useState(false);

  const columns = {
    pending: { title: 'Pending', color: '#ff9800' },
    'in-progress': { title: 'In Progress', color: '#2196f3' },
    completed: { title: 'Completed', color: '#4caf50' }
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading your board...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Project Board
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your tasks with drag & drop
        </Typography>
      </Box>

      <Box display="flex" justifyContent="center" mb={4}>
        {!showNewTodoForm ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowNewTodoForm(true)}
            size="large"
          >
            Add New Task
          </Button>
        ) : (
          <Card sx={{ width: '100%', maxWidth: 400 }}>
            <CardContent>
              <TextField
                fullWidth
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Enter task description..."
                variant="outlined"
                sx={{ mb: 2 }}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
              />
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={handleAddTodo}
                >
                  Add
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CloseIcon />}
                  onClick={() => {
                    setShowNewTodoForm(false);
                    setNewTodoText('');
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={3}>
          {Object.entries(columns).map(([status, column]) => (
            <Grid item xs={12} md={4} key={status}>
              <Paper elevation={3} sx={{ height: '100%' }}>
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: column.color + '20',
                    borderBottom: `3px solid ${column.color}`
                  }}
                >
                  <Typography variant="h6" component="h2">
                    {column.title}
                    <Chip 
                      label={todos.filter(todo => todo.status === status).length}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
                
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        p: 2,
                        minHeight: 500,
                        bgcolor: snapshot.isDraggingOver ? 'grey.100' : 'transparent'
                      }}
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
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  mb: 2,
                                  cursor: 'grab',
                                  transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                                  boxShadow: snapshot.isDragging ? 4 : 1
                                }}
                              >
                                <CardContent>
                                  {editingId === todo.id ? (
                                    <Box>
                                      <TextField
                                        fullWidth
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        sx={{ mb: 2 }}
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleEditTodo(todo.id)}
                                      />
                                      <Box display="flex" gap={1} justifyContent="flex-end">
                                        <IconButton
                                          color="success"
                                          onClick={() => handleEditTodo(todo.id)}
                                          size="small"
                                        >
                                          <CheckIcon />
                                        </IconButton>
                                        <IconButton
                                          onClick={cancelEditing}
                                          size="small"
                                        >
                                          <CloseIcon />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  ) : (
                                    <Box>
                                      <Typography variant="body1" sx={{ mb: 2 }}>
                                        {todo.todo}
                                      </Typography>
                                      <Box display="flex" gap={1} justifyContent="flex-end">
                                        <IconButton
                                          onClick={() => startEditing(todo)}
                                          size="small"
                                          color="primary"
                                        >
                                          <EditIcon />
                                        </IconButton>
                                        <IconButton
                                          onClick={() => handleDeleteTodo(todo.id)}
                                          size="small"
                                          color="error"
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                      
                      {todos.filter(todo => todo.status === status).length === 0 && (
                        <Box textAlign="center" py={6} color="text.secondary">
                          <Typography variant="h4" sx={{ mb: 1 }}>📝</Typography>
                          <Typography>No tasks in {column.title.toLowerCase()}</Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Droppable>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>
    </Container>
  );
};

export default ToDoBoard;
