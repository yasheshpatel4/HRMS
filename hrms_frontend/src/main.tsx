import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './index.css'
import Layout from './Layout'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Post from './components/Post'
import Games from './components/Games'
import Notification from './components/Notification'
import Job from './components/Job'
import Organization from './components/Organization'
import Travel from './components/Travel'

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      { path: "dashboard", element: <Dashboard /> },
      { path: "posts", element: <Post /> },
      { path: "travel", element: <Travel /> },
      { path: "games", element: <Games /> },
      { path: "jobs", element: <Job /> },
      { path: "organization", element: <Organization /> },
      { path: "notifications", element: <Notification /> },
    ],
  },
  {
    path: "*",
    element: <div>404 - Page Not Found</div>,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
