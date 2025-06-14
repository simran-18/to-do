import { useState, useEffect, useCallback,useMemo } from "react";
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
import useDebounce from "../hooks/useDebounce";
import { showErrorToast,showInfoToast,showSuccessToast } from "../utils/toast";

const ToDoBoard = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedToDo, setSelectedToDo] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewOnly, setViewOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("all");
  const [total,setTotal]=useState(0);
  const debouncedValue=useDebounce(searchQuery,200); 

  const columns = {
    pending: { title: "Pending", color: "bg-orange-100 border-orange-300" },
    "in-progress": {
      title: "In Progress",
      color: "bg-blue-100 border-blue-300",
    },
    completed: { title: "Completed", color: "bg-green-100 border-green-300" },
  };

  // filter the items based on the search query or the selectedUserId
 const filteredTodos = useMemo(() => {
  if (!Array.isArray(todos)) return [];
  return todos.filter((todo) => {
    const matchesSearch = todo.todo
      ?.toLowerCase()
      .includes(debouncedValue?.toLowerCase());
    const matchesUser =
      selectedUserId === "all" || todo.userId.toString() === selectedUserId;
    return matchesSearch && matchesUser;
  });
}, [todos, debouncedValue, selectedUserId]);


  useEffect(() => {
    fetchTodos();
  }, [currentPage]);

  // api call for get the todo tasks
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await TodoService.getTodos({ page: currentPage });
      const todosWithStatus = data.map((todo) => ({
        ...todo,
        status: todo.completed ? "completed" : "pending",
      }));
      setTodos(todosWithStatus);
      setTotal(data.total)
    } catch (error) {
      console.error("Failed to fetch todos:", error);
      showErrorToast("Failed to fetch todos.");
    } finally {
      setLoading(false);
    }
  };

  // api call to add new task
  const handleAddTodo = useCallback(async (newTodo) => {
    try {
      setLoading(true);
      const createdTodo = await TodoService.createTodo({
        todo: newTodo.todo,
        completed: newTodo.status === "completed",
        userId: 76,
      });

      setTodos((prev) => [...prev, { ...createdTodo, status: newTodo.status }]);
      showSuccessToast("Todo created successfully!");
    } catch (error) {
      console.error("Failed to create todo:", error);
      showErrorToast("Failed to create todo.");
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
     showInfoToast(`Task moved to ${newStatus.replace("-", " ")}`);
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
       showErrorToast("Failed to update status.");
      console.error("Failed to update todo status:", error);
    }
  };

  // api call to edit the existing task
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
      showSuccessToast("Todo updated successfully!");
      showErrorToast("Failed to update todo.");
    } catch (error) {
      console.error("Failed to update todo:", error);
    } finally {
      setLoading(false);
    }
  };

  // api call to delete the existing task 
  const handleDeleteTodo = async (id) => {
    try {
      setLoading(true);
      await TodoService.deleteTodo(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      showSuccessToast("Todo deleted successfully!");
    } catch (error) {
      console.error("Failed to delete todo:", error);
      showErrorToast("Failed to delete todo.");
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

         {/* Search and Filter */}
       <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-64"
        />
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-48"
        >
          <option value="all">All Users</option>
          {[...new Set(filteredTodos?.map((todo) => todo.userId))].map((id) => (
            <option key={id} value={id}>
              User {id}
            </option>
          ))}
        </select>
        
        <button
          onClick={() => {
            setSearchQuery("");
            setSelectedUserId("all");
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Clear Filters
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
                      {filteredTodos?.filter((todo) => todo.status === status).length}
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
                      {filteredTodos
                        ?.filter((todo) => todo.status === status)
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

                      {/* Empty State if the filteredTodos array is empty */}
                      {filteredTodos?.filter((todo) => todo.status === status).length ===
                        0 && (
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-4xl mb-2">📝</div>
                          <p>No tasks in {column.title?.toLowerCase()}</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
          {/* Modal to create a new task */}
          {showAddModal ? (
            <CreateTodoModal
              isOpen={showAddModal}
              onClose={setShowAddModal}
              onAddTodo={handleAddTodo}
            />
          ) : null}

          {/* Modal to view/edit a new task (dynamically handled the view and editing of the modal baased on the action icon selected*/}
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

        {/* Pagination Bar with the current limit set to 30 per page */}
        {filteredTodos.length>0 ?<Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(total / 30)}
          onPageChange={setCurrentPage}
        />:null}

        {/* Scrolling icon for better user navigation experience  */}
        <ScrollToTopBottom />
      </div>
    </div>
  );
};

export default ToDoBoard;
