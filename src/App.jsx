import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
} from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import Verify from './pages/Verify';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ChangePassword from './pages/ChangePassword';
import AuthSuccess from './pages/AuthSuccess';
import NotFound from './pages/NotFound';
import Courses from './pages/Courses';
import NewArrivals from './pages/NewArrivals';

// Layout component that conditionally shows Navbar
const RootLayout = () => {
  const location = useLocation();
  const path = location.pathname;

  // Paths where navbar should be hidden
  const isAuthPage =
    path === '/signup' ||
    path === '/login' ||
    path === '/forgot-password' ||
    path === '/auth-success' ||
    path.startsWith('/verify') || // covers /verify and /verify/:token
    path.startsWith('/verify-otp') ||
    path.startsWith('/change-password');

  return (
    <>
      {!isAuthPage && <Navbar />}
      <Outlet />
    </>
  );
};

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/signup', element: <Signup /> },
      { path: '/verify', element: <VerifyEmail /> },
      { path: '/verify/:token', element: <Verify /> },
      { path: '/login', element: <Login /> },
      { path: '/auth-success', element: <AuthSuccess /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/verify-otp/:email', element: <VerifyOTP /> },
      { path: '/change-password/:email', element: <ChangePassword /> },
            { path: '/new-arrivals', element: <NewArrivals /> },

      { path: '/courses', element: <Courses /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

const App = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;