import { useEffect, useState } from "react";

export default function EditTodoModal({ isOpen, onClose, onEditTodo, todo,viewOnly = false }) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (todo) {
      setTitle(todo.todo || "");
      setStatus(todo.status || "pending");
    }
  }, [todo]);

  const handleClose = () => {
    setTitle("");
    setStatus("pending");
    setToast(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setToast({ type: "error", message: "Please enter a todo title" });
      return;
    }

    try {
      setIsSubmitting(true);

      const updatedData = {
        id: todo.id,
        todo: title.trim(),
        status,
      };

      await onEditTodo(updatedData); // 🔁Pass updated data back

      setToast({ type: "success", message: "Todo updated successfully" });
      handleClose();
    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: "Failed to update todo" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 bg-opacity-50 transition-opacity">
      <div
        className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-md transform transition-all duration-200 ease-out ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">{viewOnly ? "View Task" : "Edit Task"}</h2>

        {toast && (
          <div
            className={`mb-4 p-2 text-sm rounded ${
              toast.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {toast.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              readOnly={viewOnly}
              required
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              disabled={viewOnly}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
             {viewOnly?'Close':'Cancel'} 
            </button>
          {!viewOnly && (  <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>)}
          </div>
        </form>
      </div>
    </div>
  );
}
