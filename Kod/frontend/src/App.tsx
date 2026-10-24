import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import Welcome from "./pages/Welcome";
import UploadPage from "./pages/UploadPage";
import "./styles/App.css";
import "./styles/Auth.css";
import "./styles/Main.css";
import "./styles/User.css";
import "./styles/Posts.css";
import "./styles/Projects.css";
import UserPage from "./pages/UserPage";
import PostDetails from "./pages/PostDetails";
import Posts from "./pages/Posts";
import RegisterRoute from "./routes/RegisterRoute";
import EditUserProfile from "./pages/EditUserProfile";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectFormPage from "./pages/ProjectFormPage";
import AdminPanel from "./pages/AdminPanel";

const App: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [canRegister, setCanRegister] = useState(false);
  const location = useLocation();

  Axios.defaults.withCredentials = true;

  useEffect(() => {
    Axios.get("http://localhost:3001/login").then((response) => {
      if (response.data.loggedIn && response.data.user.username) {
        setUsername(response.data.user.username);
      } else {
        setUsername("");
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Routes>
        <Route
          path="/auth"
          element={<Auth setCanRegister={setCanRegister} />}
        />
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login setUsername={setUsername} />} />
        <Route
          path="/register"
          element={
            <RegisterRoute canRegister={canRegister}>
              <Register setUsername={setUsername} />
            </RegisterRoute>
          }
        />
        <Route
          path="/main"
          element={
            <ProtectedRoute isAuthenticated={!!username}>
              <Main setUsername={setUsername} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/upload"
          element={
            <ProtectedRoute isAuthenticated={!!username}>
              <UploadPage setUsername={setUsername} mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update/:id"
          element={
            <ProtectedRoute isAuthenticated={!!username}>
              <UploadPage setUsername={setUsername} mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute isAuthenticated={!!username}>
              <UserPage setUsername={setUsername} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/edit"
          element={
            <ProtectedRoute isAuthenticated={!!username}>
              <EditUserProfile username={username} setUsername={setUsername} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/:userId"
          element={
            <ProtectedRoute isAuthenticated={!!username}>
              <UserPage setUsername={setUsername} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts/:id"
          element={
            <ProtectedRoute isAuthenticated={!!username}>
              <PostDetails setUsername={setUsername} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts"
          element={
            <ProtectedRoute isAuthenticated={!!username}>
              <Posts setUsername={setUsername} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute isAuthenticated={!!username}>
              <ProjectDetails setUsername={setUsername} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute isAuthenticated={!!username}>
              <Projects setUsername={setUsername} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/create"
          element={
            <ProtectedRoute isAuthenticated={!!username}>
              <ProjectFormPage setUsername={setUsername} mode="create" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/edit/:id"
          element={
            <ProtectedRoute isAuthenticated={!!username}>
              <ProjectFormPage setUsername={setUsername} mode="edit" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute isAuthenticated={!!username}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>

      {username &&
        ["/", "/auth", "/login", "/register"].includes(location.pathname) && (
          <Navigate to="/main" replace />
        )}
    </>
  );
};

export default App;
