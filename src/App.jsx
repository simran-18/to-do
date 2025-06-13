import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy,Suspense } from "react";
import Loader from "./components/Loader";
import { ToastContainer } from 'react-toastify';

const Login = lazy(() => import("./pages/Login"));
const ToDoBoard = lazy(() => import("./pages/ToDoBoard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <div>
<ToastContainer position="top-right" autoClose={3000} />
      <BrowserRouter>
       <Suspense fallback={<Loader/>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/board" element={<ToDoBoard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
  </div>
);

export default App;