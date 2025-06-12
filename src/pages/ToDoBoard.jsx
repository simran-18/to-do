import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { TodoService } from "../services/todoservice";
import { FaPlus } from "react-icons/fa";
import { FaPen } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import CreateTodoModal from "../components/CreateToDoModal";
import EditTodoModal from "../components/EditToDoModal";
import Pagination from "../components/Pagination";
import ScrollToTopBottom from "../components/ScrollToTopBottom";
import Loader from "../components/Loader";

const ToDoBoard = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedToDo, setSelectedToDo] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewOnly, setViewOnly] = useState(true);
  const columns = {
    pending: { title: "Pending", color: "bg-orange-100 border-orange-300" },
    "in-progress": {
      title: "In Progress",
      color: "bg-blue-100 border-blue-300",
    },
    completed: { title: "Completed", color: "bg-green-100 border-green-300" },
  };

  useEffect(() => {
    fetchTodos();
  }, [currentPage]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await TodoService.getTodos({ page: currentPage });
      const todosWithStatus = data.map((todo) => ({
        ...todo,
        status: todo.completed ? "completed" : "pending",
      }));
      setTodos(todosWithStatus);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = useCallback(async (newTodo) => {
    try {
      setLoading(true);
      const createdTodo = await TodoService.createTodo({
        todo: newTodo.todo,
        completed: newTodo.status === "completed",
        userId: 1,
      });

      setTodos((prev) => [...prev, { ...createdTodo, status: newTodo.status }]);
    } catch (error) {
      console.error("Failed to create todo:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const todoId = parseInt(draggableId);

    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? { ...todo, status: newStatus, completed: newStatus === "completed" }
          : todo
      )
    );

    try {
      await TodoService.updateTodo(todoId, {
        completed: newStatus === "completed",
        status: newStatus,
      });
    } catch (error) {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId
            ? {
                ...todo,
                status: source.droppableId,
                completed: source.droppableId === "completed",
              }
            : todo
        )
      );
      console.error("Failed to update todo status:", error);
    }
  };

  const handleEditTodo = async (updatedData) => {
    if (!updatedData.todo.trim()) return;

    try {
      setLoading(true);
      await TodoService.updateTodo(updatedData.id, {
        todo: updatedData.todo,
        status: updatedData.status,
        completed: updatedData.status === "completed",
      });
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === updatedData.id
            ? {
                ...todo,
                todo: updatedData.todo,
                status: updatedData.status,
                completed: updatedData.status === "completed",
              }
            : todo
        )
      );
      setSelectedToDo("");
    } catch (error) {
      console.error("Failed to update todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      setLoading(true);
      await TodoService.deleteTodo(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Failed to delete todo:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">To Do Board</h1>
          <p className="text-lg text-gray-600">
            Manage your tasks with drag & drop
          </p>
        </div>

        {/* Add New Task Button/Form */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg cursor-pointer transition-colors duration-200 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add New Task</span>
          </button>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(columns).map(([status, column]) => (
              <div
                key={status}
                className={`${column.color}rounded-lg shadow-lg overflow-hidden`}
              >
                {/* Column Header */}
                <div className={`p-4 ${column.color} border-b-4`}>
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center justify-between">
                    {column.title}
                    <span className="bg-white text-gray-700 text-sm px-2 py-1 rounded-full">
                      {todos.filter((todo) => todo.status === status).length}
                    </span>
                  </h2>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 min-h-96 transition-colors duration-200`}
                    >
                      {todos
                        .filter((todo) => todo.status === status)
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
                                className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-200 ${
                                  snapshot.isDragging
                                    ? "rotate-2 shadow-lg"
                                    : ""
                                }`}
                              >
                                {/* Draggable handle area */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing"
                                >
                                  <h1 className="text-gray-800 mb-2">
                                    {todo.todo}
                                  </h1>
                                  <p className="text-gray-500 text-sm">
                                    Task description of Task {todo.id}
                                  </p>
                                <div className="flex justify-end items-center text-xs text-gray-500 mt-2">
                                <FaUserCircle className="mr-1" />
                                <span>UserId : {todo.userId}</span>
                              </div>
                                </div>
                                     
                                <div className="w-full border border-gray-300 opacity-85 my-3"></div>

                                {/* Action Buttons (not draggable) */}
                                <div className="flex space-x-2 justify-end">
                                  <button
                                    onClick={() => {
                                      setSelectedToDo(todo);
                                      setViewOnly(true);
                                      setShowEditModal(true);
                                    }}
                                    className="text-green-600 hover:text-green-800 p-1"
                                  >
                                    <FaEye size={20} />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedToDo(todo);
                                      setViewOnly(false);
                                      setShowEditModal(true);
                                    }}
                                    className="text-blue-700 hover:text-blue-800 p-1"
                                  >
                                    <FaPen size={20} />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteTodo(todo.id)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                  >
                                    <MdDeleteForever size={20} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}

                      {/* Empty State */}
                      {todos.filter((todo) => todo.status === status).length ===
                        0 && (
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
          {showAddModal ? (
            <CreateTodoModal
              isOpen={showAddModal}
              onClose={setShowAddModal}
              onAddTodo={handleAddTodo}
            />
          ) : null}
          {showEditModal && (
            <EditTodoModal
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              onEditTodo={handleEditTodo}
              todo={selectedToDo}
              viewOnly={viewOnly}
            />
          )}
        </DragDropContext>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(254 / 30)}
          onPageChange={setCurrentPage}
        />
        <ScrollToTopBottom />
      </div>
    </div>
  );
};

export default ToDoBoard;
