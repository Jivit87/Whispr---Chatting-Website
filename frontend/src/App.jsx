import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';

const App = () => {

  const {user} = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={user ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      </Routes>
      <Toaster position="top-center" />
    </>
  );
}

export default App