import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AuthProvider, useAuth } from './Context/AuthContext'

import './index.css'
import Layout from './Layout'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Post from './components/Posts/Post'
import Games from './components/Games/Games'
import Notification from './components/Notifications/Notification'
import Job from './components/Jobs/Job'
import Travel from './components/Travels/Travel'
import OrgChart from './components/Organization/OrgChart'

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoading,isAuthenticated } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>; 
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
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
      element: <Dashboard />
    },
      { path: "dashboard", element: <Dashboard /> },
      { path: "posts", element: <Post /> },
      { path: "travel", element: <Travel /> },
      { path: "games", element: <Games /> },
      { path: "jobs", element: <Job /> },
      { path: "organization", element: <OrgChart /> },
      { path: "notifications", element: <Notification /> },
    ],
  },
  {
    path: "*",
    element: <div>Page Not Found..!</div>,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
