README - Trello-Style Todo Board
1. How to Run the Project Locally

To run the project locally, follow these steps:

1. Clone the Repository:
   git clone https://github.com/your-username/to-do.git
   cd to-do

2. Install Dependencies:
   npm install
   or
   yarn install

3. Start the Development Server:
   npm run dev
   or
   yarn dev

The app will run by default at http://localhost:5173 (Vite-based setup).

------------------------------------------------------------

2. Project Approach

This project is a Trello-style Todo Board implemented using React.js and Tailwind CSS. The board supports task management across three columns—Pending, In Progress, and Completed—using drag-and-drop functionality powered by @hello-pangea/dnd. Users can add, edit, delete, and filter tasks by search or user, and navigate through paginated data.

Key Technologies Used:
- React.js
- Tailwind CSS
- @hello-pangea/dnd for drag-and-drop
- Vite for bundling
- useMemo, useCallback for performance optimization
- Custom hooks like useDebounce for better UX

-------------------------------------------------------------

3. Folder Structure & Component Responsibilities

src/
├── components/           # Reusable, UI-focused components
│   ├── CreateTodoModal.jsx
│   ├── EditTodoModal.jsx
│   ├── Loader.jsx
│   ├── Pagination.jsx
│   └── ScrollToTopBottom.jsx
├── hooks/
│   └── useDebounce.js
├── pages/
│   └── ToDoBoard.jsx
    └── NotFound.jsx
    └── Login.jsx
├── services/
│   └── Todoservice.js
├── App.jsx
├── main.jsx
└── index.css

Component Breakdown

1. CreateTodoModal.jsx:A modal form to add a new todo item. Includes fields for the task and status. Uses local state to handle form inputs and calls onAddTodo passed via props.

2. EditTodoModal.jsx:Handles both viewing and editing a todo item. Accepts a viewOnly flag to toggle between read-only and editable modes. Updates are submitted using onEditTodo.

3. Loader.jsx:Displays a centered spinner during data fetch operations or form submissions.

4. Pagination.jsx:Renders pagination controls with page number and navigation arrows. Accepts currentPage, totalPages, and a callback onPageChange.

5. ScrollToTopBottom.jsx:Provides floating action buttons to scroll to the top or bottom of the page for improved usability on longer lists.

6. useDebounce.jsx:Custom hook that debounces a given value with a specified delay to reduce API calls or filtering operations on every keystroke.

7. Login.jsx:Input validation for email format with show/hide password toggle and navigates to Board on valid login(require a valid password format like username@gamil.com and any password would work)

8. NotFound,.jsx: If the user tries to access any random page it will be redirected to this page.

9. ToDoBoard.jsx
Main logic and UI for:

Search and filter

Drag-and-drop functionality (via @hello-pangea/dnd)

Task display by status (Pending, In Progress, Completed)

API integration via todoservice.js

Modal handling for create/edit

8. Todoservice.js:Abstracts the API layer and provides methods:

getTodos({ page })

createTodo(data)

updateTodo(id, data)

deleteTodo(id)

-------------------------------------------------------------

4. Trade-offs and Improvements

Trade-offs Made:
- Local state was used instead of Redux or Zustand to keep the project lightweight.
- The user list was derived from the task data, which may limit scalability.
- Pagination is static and fixed to a size of 30 per page.

Potential Improvements:
- Introduce Redux or Zustand for scalable global state management.
- Improve accessibility with ARIA labels.
- Add test cases using Jest and React Testing Library.
- Allow dynamic pagination size selection.
- Support user authentication for multi-user boards.
- Add analytics and reporting features.

------------------------------------------------------------

5. Design Decisions and Optimizations

- Component-based architecture with separation of concerns (modals, pagination, board).
- Debounced search using a custom hook to prevent unnecessary re-renders.
- Filtering and pagination handled with useMemo to avoid redundant recalculations.
- Drag-and-drop updates task state optimistically for snappy UX.
- Conditional rendering used for performance (modals, loaders, pagination).

-------------------------------------------------------------

6. Known Limitations and Enhancements

- No real backend integration; data is assumed to be mocked from dummy api.
- Accessibility improvements needed for full screen-reader support.
- No testing framework integration currently.
- No user authentication or real-time updates.
- Filtering and search are case-sensitive in some areas.



