import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { googleLogout } from "@react-oauth/google";
import MediaPreview from "../components/MediaPreview";
import profIcon from "../assets/profile icon 2.png";
import editIcon from "../assets/edit icon2.png";
import addIcon from "../assets/plus.png";

import type { User, Post, Project } from "../types";

interface UserPageProps {
  setUsername: (username: string) => void;
}

const UserPage: React.FC<UserPageProps> = ({ setUsername }) => {
  const { userId } = useParams<{ userId: string }>();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"portfolio" | "team-projects">(
    "portfolio",
  );
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError("");

    Axios.get("http://localhost:3001/login", { withCredentials: true })
      .then((loginRes) => {
        const loggedUser = loginRes.data.user;

        if (loginRes.data.loggedIn && loggedUser) {
          setCurrentUserId(loggedUser.user_id);
        }

        if (userId) {
          return Axios.get(`http://localhost:3001/users/${userId}`, {
            withCredentials: true,
          }).then((res) => {
            setProfileUser(res.data.user);
            setPosts(res.data.posts || []);
            setProjects(res.data.projects || []);
          });
        }

        return Promise.all([
          Axios.get("http://localhost:3001/user/edit", {
            withCredentials: true,
          }),
          Axios.get("http://localhost:3001/user", {
            withCredentials: true,
          }),
          Axios.get("http://localhost:3001/projects/user", {
            withCredentials: true,
          }),
        ]).then(([profileRes, postsRes, projectsRes]) => {
          setProfileUser(profileRes.data);
          setPosts(postsRes.data || []);
          setProjects(projectsRes.data || []);
        });
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile content");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (!profileUser) return <p>Profile not found.</p>;

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

  if (error) return <p>{error}</p>;

  const isOwnProfile = !userId || Number(userId) === currentUserId;

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
            <button className="addPostBtn" onClick={() => navigate("/upload")}>
              <img src={addIcon} alt="add icon" />
              Add
            </button>
            <button onClick={logout}>Logout</button>
          </>
        }
      />

      <main>
        <div className="user">
          <div className="profile-hero">
            <div className="profile-background" />
            <div className="profile-content">
              <div className="avatar">
                <img src={profIcon} alt="profile icon" />
              </div>
              <h2 className="name">
                {[profileUser.name, profileUser.surname]
                  .filter(Boolean)
                  .join(" ")}
              </h2>
              <p className="nickname">@{profileUser.username}</p>

              <div className="tags">
                {profileUser.tags && profileUser.tags.length > 0 ? (
                  profileUser.tags.map((tag: string) => (
                    <span key={tag}>#{tag}</span>
                  ))
                ) : (
                  <span>#</span>
                )}
              </div>

              <h4 className="descriptionH">Description</h4>
              <p className="descriptionP">{profileUser.description || "-"}</p>

              {isOwnProfile && (
                <button
                  className="editProf-btn"
                  onClick={() => navigate("/user/edit")}
                >
                  <img src={editIcon} alt="edit profile" />
                </button>
              )}
            </div>
          </div>

          <div className="profile-tabs">
            <button
              className={
                activeTab === "portfolio" ? "tab-button_active" : "tab-button"
              }
              onClick={() => setActiveTab("portfolio")}
            >
              Portfolio
            </button>

            <button
              className={
                activeTab === "team-projects"
                  ? "tab-button_active"
                  : "tab-button"
              }
              onClick={() => setActiveTab("team-projects")}
            >
              Team Project
            </button>
          </div>

          {activeTab === "portfolio" ? (
            <>
              {posts.length === 0 && <p>No posts yet.</p>}
              <div className="post">
                {posts.map((post) => {
                  return (
                    <div
                      key={post.post_id}
                      className="post-card"
                      onClick={() =>
                        navigate(`/posts/${post.post_id}`, {
                          state: { from: "/user" },
                        })
                      }
                    >
                      <div className="card-image">
                        {post.file ? (
                          <MediaPreview
                            file={post.file}
                            className="carf-preview-media"
                          />
                        ) : (
                          <div className="empty-card-media">
                            No preview available
                          </div>
                        )}
                      </div>

                      <div className="card-text">
                        <h3 className="post-card-title">{post.title}</h3>
                        <div className="post-buttons">
                          <button
                            onClick={() =>
                              navigate(`/posts/${post.post_id}`, {
                                state: { from: "/user" },
                              })
                            }
                          >
                            More
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {isOwnProfile && (
                <div className="user-projects-topbar">
                  <button
                    className="create-project-btn"
                    onClick={() => navigate("/projects/create")}
                  >
                    + Create Project
                  </button>
                </div>
              )}

              {projects.length === 0 ? (
                <p>No projects yet.</p>
              ) : (
                <div className="projects-list">
                  {projects.map((project) => (
                    <div
                      key={project.project_id}
                      className={
                        project.status === "open"
                          ? "project-wide-card project-open"
                          : "project-wide-card"
                      }
                      onClick={() =>
                        navigate(`/projects/${project.project_id}`, {
                          state: { from: "/user" },
                        })
                      }
                    >
                      <div className="project-wide-left">
                        <div className="project-wide-image">
                          {project.file ? (
                            <MediaPreview
                              file={project.file}
                              className="carf-preview-media"
                            />
                          ) : (
                            <div className="empty-card-media">
                              No preview available
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="project-wide-content">
                        <div className="project-wide-main">
                          <div className="project-wide-side">
                            <div
                              className={`project-status ${
                                project.status === "open"
                                  ? "status-open"
                                  : "status-closed"
                              }`}
                            >
                              <span>
                                {project.status === "open" ? "Open" : "Closed"}
                              </span>
                            </div>
                            <h3>{project.title}</h3>
                            <p className="project-team">
                              Team: @{project.username}
                            </p>

                            <div className="project-looking-for">
                              <span className="project-looking-label">
                                Looking for:
                              </span>

                              {project.lookingFor &&
                              project.lookingFor.length > 0 ? (
                                <span className="project-looking-tag">
                                  {project.lookingFor[0]}
                                </span>
                              ) : (
                                <span className="project-looking-empty">-</span>
                              )}
                            </div>

                            <div className="project-description-block">
                              <span className="project-description-label">
                                Description:
                              </span>
                              <p className="project-description">
                                {project.overview || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          className="project-show-btn"
                          onClick={() =>
                            navigate(`/projects/${project.project_id}`, {
                              state: { from: "/user" },
                            })
                          }
                        >
                          Show
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserPage;
