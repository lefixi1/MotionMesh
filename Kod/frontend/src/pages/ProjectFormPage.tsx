import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { googleLogout } from "@react-oauth/google";
import ModelViewer from "./ModelViewer";

import type { ProjectStatus } from "../types";

interface ProjectFormPageProps {
  setUsername: (username: string) => void;
  mode?: "create" | "edit";
}

interface FoundUser {
  user_id: number;
  username: string;
  name?: string;
  surname?: string;
}

interface CurrentFile {
  name: string;
  path: string;
  type: string;
}

const ProjectFormPage: React.FC<ProjectFormPageProps> = ({
  setUsername,
  mode = "create",
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [progressPercent, setProgressPercent] = useState<string>("0");
  const [status, setStatus] = useState<ProjectStatus>("open");
  const [deadline, setDeadline] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [lookingForInput, setLookingForInput] = useState("");
  const [tasks, setTasks] = useState([
    {
      title: "",
      description: "",
      status: "todo" as "todo" | "done",
    },
  ]);
  const [formStatus, setFormStatus] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<FoundUser[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<FoundUser[]>(
    [],
  );
  const [currentProjectParticipants, setCurrentProjectParticipants] = useState<
    FoundUser[]
  >([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [participantRole, setParticipantRole] = useState("Teammate");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFile, setCurrentFile] = useState<CurrentFile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && id) {
      setLoading(true);

      Axios.get(`http://localhost:3001/projects/${id}`, {
        withCredentials: true,
      })
        .then((response) => {
          const project = response.data;

          setTitle(project.title || "");
          setOverview(project.overview || "");
          setProgressPercent(String(project.progress_percent ?? 0));
          setStatus(project.status || "open");
          setDeadline(
            project.deadline ? String(project.deadline).slice(0, 10) : "",
          );
          setTagsInput(
            project.tags && project.tags.length > 0
              ? project.tags.join(", ")
              : "",
          );
          setLookingForInput(
            project.lookingFor && project.lookingFor.length > 0
              ? project.lookingFor.join(", ")
              : "",
          );
          setTasks(
            project.tasks && project.tasks.length > 0
              ? project.tasks
              : [{ title: "", status: "todo" }],
          );
          setCurrentFile({
            name: project.file?.file_name || "",
            path: project.file?.file_path || "",
            type: project.file?.file_type || "",
          });
          setCurrentProjectParticipants(project.participants || []);

          setLoading(false);
        })
        .catch((err) => {
          console.log("Error loading project:", err);
          setFormStatus("Error loading project");
          setLoading(false);
        });
    }
  }, [mode, id]);

  const logout = () => {
    googleLogout();
    Axios.post("http://localhost:3001/logout")
      .then(() => {
        setUsername("");
        navigate("/");
      })
      .catch(() => {
        alert("Logout failed, try again");
      });
  };

  const handleUserSearch = async () => {
    if (!userSearch.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await Axios.get(
        `http://localhost:3001/users/search?q=${encodeURIComponent(userSearch)}`,
        { withCredentials: true },
      );

      const users = Array.isArray(res.data) ? res.data : [];

      const existingProjectUserIds =
        mode === "edit" && currentProjectParticipants.length > 0
          ? currentProjectParticipants.map((p) => p.user_id)
          : [];

      const filtered = users.filter(
        (user: FoundUser) =>
          user.user_id !== currentUserId &&
          !selectedParticipants.some(
            (selected) => selected.user_id === user.user_id,
          ) &&
          !existingProjectUserIds.includes(user.user_id),
      );

      setSearchResults(filtered);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    Axios.get("http://localhost:3001/login", { withCredentials: true }).then(
      (res) => {
        if (res.data.loggedIn) {
          setCurrentUserId(res.data.user.user_id);
        }
      },
    );
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleUserSearch();
    }, 300);

    return () => clearTimeout(timeout);
  }, [userSearch, selectedParticipants]);

  const handleAddParticipant = (user: FoundUser) => {
    if (selectedParticipants.some((p) => p.user_id === user.user_id)) return;

    setSelectedParticipants((prev) => [...prev, user]);
    setSearchResults((prev) => prev.filter((u) => u.user_id !== user.user_id));
    setUserSearch("");
  };

  const handleRemoveParticipant = (userId: number) => {
    setSelectedParticipants((prev) =>
      prev.filter((participant) => participant.user_id !== userId),
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setFormStatus("Please enter a title");
      return;
    }

    const progressValue =
      progressPercent.trim() === "" ? 0 : Number(progressPercent);

    if (progressValue < 0 || progressValue > 100) {
      setFormStatus("Progress must be between 0 and 100.");
      return;
    }

    setLoading(true);
    setFormStatus(mode === "create" ? "Creating..." : "Updating...");

    try {
      if (mode === "create") {
        const formData = new FormData();

        formData.append("title", title);
        formData.append("overview", overview);
        formData.append("progress_percent", String(progressValue));
        formData.append("status", status);
        formData.append("deadline", deadline || "");

        formData.append(
          "tags",
          JSON.stringify(
            tagsInput
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          ),
        );

        formData.append(
          "lookingFor",
          JSON.stringify(
            lookingForInput
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          ),
        );

        formData.append(
          "tasks",
          JSON.stringify(tasks.filter((task) => task.title.trim() !== "")),
        );

        formData.append(
          "participants",
          JSON.stringify(
            selectedParticipants.map((participant) => ({
              user_id: participant.user_id,
              role_name: participantRole || "Teammate",
            })),
          ),
        );

        if (selectedFile) {
          formData.append("file", selectedFile);
        }

        const res = await Axios.post(
          "http://localhost:3001/projects",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          },
        );

        setFormStatus(res.data.message || "Project created successfully");

        setTimeout(() => {
          if (res.data.project_id) {
            navigate(`/projects/${res.data.project_id}`);
          } else {
            navigate("/projects");
          }
        }, 1200);
      } else if (mode === "edit" && id) {
        const payload = {
          title,
          overview,
          progress_percent: progressValue,
          status,
          deadline: deadline || null,
          tags: tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          lookingFor: lookingForInput
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          tasks: tasks.filter((task) => task.title.trim() !== ""),
        };

        const res = await Axios.put(
          `http://localhost:3001/projects/${id}`,
          payload,
          { withCredentials: true },
        );

        setFormStatus(res.data.message || "Project updated successfully");

        setTimeout(() => {
          navigate(`/projects/${id}`);
        }, 1200);
      }
    } catch (err: any) {
      console.error("Error:", err);

      if (err.response?.status === 401) {
        setFormStatus("Session expired. Please log in again.");
        setUsername("");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setFormStatus(
          mode === "create"
            ? "Project creation failed. Try again."
            : "Project update failed. Try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    const isAllowed =
      file.type.startsWith("image/") ||
      file.type.startsWith("video/") ||
      file.name.toLowerCase().endsWith(".glb");

    if (!isAllowed) {
      setFormStatus("Only images, videos or .glb 3D files are allowed.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const isFormValid = title.trim().length > 0;

  const renderCurrentFilePreview = () => {
    if (!currentFile) return null;

    const fileType = currentFile.type || "";
    const fileName = currentFile.name || "";
    const filePath = currentFile.path || "";

    if (!filePath) {
      return (
        <div className="file-info">
          <p>📄 {fileName || "Unknown file"}</p>
        </div>
      );
    }

    const fileUrl = `http://localhost:3001/${filePath.replace(/\\/g, "/")}`;

    if (fileType.startsWith("image/")) {
      return <img src={fileUrl} alt={fileName} className="preview-image" />;
    }

    if (fileType.startsWith("video/")) {
      return <video src={fileUrl} controls className="preview-video" />;
    }

    return (
      <div className="preview-model">
        <ModelViewer filePath={fileUrl} />
      </div>
    );
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
            <button onClick={logout}>Logout</button>
          </>
        }
      />

      <main className="upload-edit-page">
        <div className="upload-edit-content project-form-content">
          <h1>{mode === "create" ? "Create Project" : "Edit Project"}</h1>

          <label>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter project title"
            disabled={loading}
          />

          <label>Overview</label>
          <textarea
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            placeholder="Short project overview"
            disabled={loading}
          />

          <label>Progress (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={progressPercent}
            onChange={(e) => setProgressPercent(e.target.value)}
            disabled={loading}
          />

          <label>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            disabled={loading}
          >
            <option value="open">Open</option>
            <option value="completed">Completed</option>
          </select>

          <label>Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={loading}
          />

          <label>Tags</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="3D, animation, game"
            disabled={loading}
          />

          <label>Looking for</label>
          <input
            type="text"
            value={lookingForInput}
            onChange={(e) => setLookingForInput(e.target.value)}
            placeholder="2D animator, modeler"
            disabled={loading}
          />

          {mode === "create" && (
            <>
              <label>Upload files</label>
              <input
                type="file"
                onChange={handleFileChange}
                disabled={loading}
                accept="image/*, video/*, .glb"
              />

              {selectedFile && (
                <div className="selected-files">
                  <h3>Selected file:</h3>
                  <p>{selectedFile.name}</p>
                </div>
              )}
            </>
          )}

          {mode === "edit" && currentFile && (
            <div className="current-file">
              <label>Current File</label>

              <div className="file-preview">
                {renderCurrentFilePreview()}

                <p className="file-note">
                  Note: File cannot be changed in edit mode. To change the file,
                  please create a new project.
                </p>
              </div>
            </div>
          )}

          <label>Add teammates by username</label>

          <div className="participant-form-box">
            <div className="participant-search-row">
              <input
                type="text"
                value={participantRole}
                onChange={(e) => setParticipantRole(e.target.value)}
                placeholder="Role name"
                disabled={loading}
              />

              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by username"
                disabled={loading}
              />
            </div>

            {searchResults.length > 0 && (
              <div className="participant-search-results">
                {searchResults.map((user) => (
                  <div key={user.user_id} className="participant-search-item">
                    <span>@{user.username}</span>
                    <button
                      type="button"
                      onClick={() => handleAddParticipant(user)}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedParticipants.length > 0 && (
              <div className="selected-participants-box">
                <h3>Selected teammates</h3>

                {selectedParticipants.map((user) => (
                  <div key={user.user_id} className="selected-participant-item">
                    <span>
                      @{user.username} — {participantRole || "Teammate"}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(user.user_id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label>Tasks</label>

          <div className="tasks-form-list">
            {tasks.map((task, index) => (
              <div key={index} className="task-form-item">
                <input
                  type="text"
                  value={task.title}
                  placeholder="Task title"
                  disabled={loading}
                  onChange={(e) => {
                    const updatedTasks = [...tasks];
                    updatedTasks[index].title = e.target.value;
                    setTasks(updatedTasks);
                  }}
                />

                <select
                  value={task.status}
                  disabled={loading}
                  onChange={(e) => {
                    const updatedTasks = [...tasks];
                    updatedTasks[index].status = e.target.value as
                      | "todo"
                      | "done";
                    setTasks(updatedTasks);
                  }}
                >
                  <option value="todo">To do</option>
                  <option value="done">Done</option>
                </select>

                <button
                  type="button"
                  className="remove-task-btn"
                  onClick={() => {
                    const updatedTasks = tasks.filter((_, i) => i !== index);
                    setTasks(
                      updatedTasks.length > 0
                        ? updatedTasks
                        : [{ title: "", description: "", status: "todo" }],
                    );
                  }}
                  disabled={loading}
                >
                  Remove task
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="add-task-btn"
            onClick={() =>
              setTasks([
                ...tasks,
                { title: "", description: "", status: "todo" },
              ])
            }
            disabled={loading}
          >
            + Add task
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            className="submit-button"
          >
            {loading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
                ? "Create Project"
                : "Save Changes"}
          </button>

          <p
            className={`status-message ${
              formStatus.includes("expired") ||
              formStatus.includes("failed") ||
              formStatus.includes("Error")
                ? "error"
                : formStatus.includes("successful") ||
                    formStatus.includes("success")
                  ? "success"
                  : ""
            }`}
          >
            {formStatus}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default ProjectFormPage;
