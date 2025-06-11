import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy,Suspense } from "react";
import Loader from "./components/Loader";

const queryClient = new QueryClient();
const Login = lazy(() => import("./pages/Login"));
const ToDoBoard = lazy(() => import("./pages/ToDoBoard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <QueryClientProvider client={queryClient}>
      <BrowserRouter>
       <Suspense fallback={<Loader/>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/board" element={<ToDoBoard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
  </QueryClientProvider>
);

export default App;