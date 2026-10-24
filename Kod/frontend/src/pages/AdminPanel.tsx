import { useEffect, useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

import type { User } from "../types";

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const navigate = useNavigate();

  const loadUsers = () => {
    Axios.get("http://localhost:3001/admin/users", {
      withCredentials: true,
    })
      .then((res) => setUsers(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateUser = (user: User) => {
    Axios.put(`http://localhost:3001/admin/users/${user.user_id}`, user, {
      withCredentials: true,
    })
      .then(() => {
        setStatusMessage(`User "${user.username}" updated successfully`);
        loadUsers();

        setTimeout(() => {
          setStatusMessage("");
        }, 3000);
      })
      .catch(() => {
        setStatusMessage("Update failed");

        setTimeout(() => {
          setStatusMessage("");
        }, 3000);
      });
  };

  const deleteUser = (userId: number) => {
    if (!window.confirm("Delete this user?")) return;

    Axios.delete(`http://localhost:3001/admin/users/${userId}`, {
      withCredentials: true,
    })
      .then(loadUsers)
      .catch((err) => alert(err.response?.data?.message || "Delete failed"));
  };

  return (
    <div id="page">
      <Header
        logoTarget="/main"
        centerActions={
          <>
            <button onClick={() => navigate("/posts")}>Posts</button>
            <button onClick={() => navigate("/projects")}>Projects</button>
          </>
        }
        rightActions={
          <>
            <button onClick={() => navigate("/user")}>Profile</button>
          </>
        }
      />
      <main className="admin-page">
        <h1>Admin Panel</h1>
        {statusMessage && (
          <p className="admin-status-message">{statusMessage}</p>
        )}

        <button onClick={() => navigate(-1)}>Back</button>

        <h2>Users</h2>

        <div className="admin-users-list">
          {users.map((user) => (
            <div key={user.user_id} className="admin-user-card">
              <input
                value={user.name || ""}
                onChange={(e) =>
                  setUsers((prev) =>
                    prev.map((u) =>
                      u.user_id === user.user_id
                        ? { ...u, name: e.target.value }
                        : u,
                    ),
                  )
                }
                placeholder="Name"
              />

              <input
                value={user.surname || ""}
                onChange={(e) =>
                  setUsers((prev) =>
                    prev.map((u) =>
                      u.user_id === user.user_id
                        ? { ...u, surname: e.target.value }
                        : u,
                    ),
                  )
                }
                placeholder="Surname"
              />

              <input
                value={user.username || ""}
                onChange={(e) =>
                  setUsers((prev) =>
                    prev.map((u) =>
                      u.user_id === user.user_id
                        ? { ...u, username: e.target.value }
                        : u,
                    ),
                  )
                }
                placeholder="Username"
              />

              <input value={user.email || ""} disabled />

              <textarea
                value={user.description || ""}
                onChange={(e) =>
                  setUsers((prev) =>
                    prev.map((u) =>
                      u.user_id === user.user_id
                        ? { ...u, description: e.target.value }
                        : u,
                    ),
                  )
                }
                placeholder="Description"
              />

              <select
                value={user.role}
                onChange={(e) =>
                  setUsers((prev) =>
                    prev.map((u) =>
                      u.user_id === user.user_id
                        ? { ...u, role: e.target.value as "user" | "admin" }
                        : u,
                    ),
                  )
                }
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>

              <button onClick={() => updateUser(user)}>Save</button>
              <button onClick={() => deleteUser(user.user_id)}>Delete</button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;
