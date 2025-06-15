import { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { TodoColumn } from "./TodoColumn";
import { CreateTodoModal } from "./CreateTodoModal";
import { EditTodoModal } from "./EditTodoModal";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { todoService } from "@/services/todoService";

const KanbanBoard = () => {
  const [todos, setTodos] = useState([]); // Store the list of todos
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [isError, setIsError] = useState(false); // Track error state
  const [modalOpen, setModalOpen] = useState(false); // Modal open state
  const [editTodo, setEditTodo] = useState(null); // For editing a specific todo

  // Fetch todos using useEffect on component mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch("/api/todos"); // Adjust API URL if needed
        const data = await response.json(); // Parse the JSON response
        setTodos(data); // Update state with fetched todos
        setIsLoading(false); // Set loading state to false once data is fetched
      } catch (error) {
        setIsError(true); // Set error state if fetching fails
        setIsLoading(false); // Set loading state to false if fetching fails
      }
    };

    fetchTodos();
  }, []); // Empty dependency array ensures it runs only once when the component mounts

  // Handle the drag-and-drop functionality to reorder todos
  const handleDragEnd = (result) => {
    if (!result.destination) return; // If dropped outside, do nothing
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTodos(items); // Update the state with the new order
  };

  // Open the modal to create a new todo
  const openModal = () => {
    setModalOpen(true);
  };

  // Close the modal (for both Create and Edit modals)
  const closeModal = () => {
    setModalOpen(false);
    setEditTodo(null); // Reset editTodo when modal is closed
  };

  // Open the modal to edit a specific todo
  const openEditModal = (todo) => {
    setEditTodo(todo);
    setModalOpen(true);
  };

  return (
    <div>
      {/* Display loading or error messages */}
      {isError && <div>Error loading todos.</div>}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="todos">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="kanban-board"
              >
                {todos.map((todo, index) => (
                  <TodoColumn
                    key={todo.id}
                    todo={todo}
                    index={index}
                    openEditModal={openEditModal} // Pass the edit function as a prop
                  />
                ))}
                {provided.placeholder} {/* Placeholder for drag-and-drop */}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Button to open the modal for creating a new todo */}
      <Button onClick={openModal}>
        <Plus /> Add Todo
      </Button>

      {/* Create Todo Modal */}
      {modalOpen && !editTodo && (
        <CreateTodoModal closeModal={closeModal} />
      )}

      {/* Edit Todo Modal */}
      {modalOpen && editTodo && (
        <EditTodoModal todo={editTodo} closeModal={closeModal} />
      )}
    </div>
  );
};

export default KanbanBoard;
