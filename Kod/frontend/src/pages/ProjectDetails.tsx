import React, { useEffect, useState } from "react";
import Axios from "axios";
import back from "../assets/return.png";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { googleLogout } from "@react-oauth/google";
import MediaPreview from "../components/MediaPreview";
import profIcon from "../assets/profile icon 2.png";
import sendIcon from "../assets/send.png";
import addIcon from "../assets/plus.png";
import editIcon from "../assets/edit icon2.png";
import deleteIcon from "../assets/delete icon.png";

import type { ProjectDetail, ParticipationPost, Comment } from "../types";

interface DetailsProps {
  setUsername: (username: string) => void;
}

const ProjectDetails: React.FC<DetailsProps> = ({ setUsername }) => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinStatus, setJoinStatus] = useState("");
  const [participationPosts, setParticipationPosts] = useState<
    ParticipationPost[]
  >([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/projects";

  useEffect(() => {
    Axios.get("http://localhost:3001/login", { withCredentials: true })
      .then((res) => {
        if (res.data.loggedIn) {
          setCurrentUser(res.data.user.username);
          setCurrentUserId(res.data.user.user_id);
          setIsAdmin(res.data.user.role === "admin");
        }
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    Axios.get(`http://localhost:3001/projects/${id}`, {
      withCredentials: true,
    })
      .then((response) => {
        setProject(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;

    Axios.get(`http://localhost:3001/projects/${id}/participation-posts`, {
      withCredentials: true,
    })
      .then((res) => {
        setParticipationPosts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.log(err));
  }, [id]);

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

  const isOwner = project?.owner?.username === currentUser;
  const isParticipant =
    project?.participants?.some(
      (participant) => participant.username === currentUser,
    ) || false;

  const handleJoinRequest = () => {
    if (!project) return;

    Axios.post(
      `http://localhost:3001/projects/${project.project_id}/join-request`,
      { message: joinMessage },
      { withCredentials: true },
    )
      .then((res) => {
        setJoinStatus(res.data.message || "Join request sent successfully");
        setJoinMessage("");
      })
      .catch((err) => {
        console.log(err);
        setJoinStatus(
          err.response?.data?.message || "Failed to send join request",
        );
      });
  };

  const loadComments = () => {
    Axios.get(`http://localhost:3001/projects/${id}/comments`, {
      withCredentials: true,
    })
      .then((res) => {
        setComments(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (!id) return;
    loadComments();
  }, [id]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    Axios.post(
      `http://localhost:3001/projects/${id}/comments`,
      { content: newComment },
      { withCredentials: true },
    )
      .then(() => {
        setNewComment("");
        loadComments();
      })
      .catch((err) => console.log(err));
  };

  const handleSaveEditedComment = (commentId: number) => {
    if (!editingCommentText.trim()) return;

    Axios.put(
      `http://localhost:3001/comments/${commentId}`,
      { content: editingCommentText },
      { withCredentials: true },
    ).then(() => {
      setEditingCommentId(null);
      setEditingCommentText("");
      loadComments();
    });
  };

  if (loading) return <p>Loading project...</p>;
  if (!project) return <p>Project not found.</p>;

  const mainFile = project.file;
  const formattedDeadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString("sk-SK")
    : "Unknown";

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
            <button onClick={() => navigate("/user")}>Profile</button>
            <button onClick={logout}>Logout</button>
          </>
        }
      />

      <main className="post-details-page">
        <div className="details-shell">
          <div className="back-button">
            <button onClick={() => navigate(-1)}>
              <img src={back} alt="back" className="back" />
              Back
            </button>
          </div>

          <div className="details-top">
            <div className="details-heading">
              <h1>{project.title}</h1>

              <div className="details-tags">
                {project.tags && project.tags.length > 0 ? (
                  project.tags.map((tag, index) => (
                    <span key={`${tag}-${index}`}>#{tag}</span>
                  ))
                ) : (
                  <span>#</span>
                )}
              </div>
            </div>

            <div className="details-author project-details-sideinfo">
              <div className="details-author-avatar">
                <img src={profIcon} alt="profile icon" />
              </div>

              <div className="details-author-info">
                <p className="author-username">@{project.owner?.username}</p>

                <button
                  className="visit-profile-btn"
                  onClick={() => navigate(`/user/${project.owner?.user_id}`)}
                >
                  Visit profile
                </button>

                <p
                  className={`project-status-text ${
                    project.status === "open" ? "status-open" : "status-closed"
                  }`}
                >
                  {project.status === "open" ? "Open" : "Closed"}
                </p>

                <div className="project-looking-for details-looking-for">
                  <span className="project-looking-label">Looking for:</span>
                  {project.lookingFor && project.lookingFor.length > 0 ? (
                    <span className="project-looking-tag">
                      {project.lookingFor[0]}
                    </span>
                  ) : (
                    <span className="project-looking-empty">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="details-media-panel">
            <div className="details-main-preview">
              {mainFile ? (
                <MediaPreview
                  file={mainFile}
                  className="details-main-preview-media"
                />
              ) : (
                <div className="details-empty-media">No preview available</div>
              )}
            </div>
          </div>

          <div className="details-text-sections">
            <section>
              <h2>Overview</h2>
              <p>{project.overview || "-"}</p>
            </section>

            <section>
              <h2>Progress</h2>

              <div className="project-progress-row">
                <div className="project-progress-bar">
                  <div
                    className="project-progress-fill"
                    style={{ width: `${project.progress_percent || 0}%` }}
                  />
                </div>
                <span className="project-progress-value">
                  {project.progress_percent || 0}%
                </span>
              </div>

              <div>
                <div className="tasks-list">
                  {project.tasks && project.tasks.length > 0 ? (
                    <div>
                      {project.tasks.map((task) => (
                        <p
                          key={task.task_id}
                          className={
                            task.status === "done"
                              ? "project-task_done"
                              : "project-task_todo"
                          }
                        >
                          · {task.title}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p>No tasks yet</p>
                  )}
                </div>

                <p className="project-deadline">
                  Deadline: {formattedDeadline}
                </p>
              </div>
            </section>

            <section>
              <h2>Participation</h2>

              <div className="participants-grid">
                {participationPosts.length > 0 ? (
                  participationPosts.map((post) => {
                    return (
                      <div key={post.post_id} className="participant-card">
                        <div className="participant-thumb">
                          {post.file ? (
                            <MediaPreview
                              file={post.file}
                              className="participant-preview-media"
                            />
                          ) : (
                            <div className="participant-preview-empty-media">
                              No preview available
                            </div>
                          )}
                        </div>

                        <h4>{post.title}</h4>
                        <p>@{post.username}</p>
                        <p>
                          {post.user_id === project.owner.user_id
                            ? "Project Creator"
                            : "Confirmed Teammate"}
                        </p>

                        <button
                          onClick={() => navigate(`/posts/${post.post_id}`)}
                        >
                          Show post
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p>No participation posts yet</p>
                )}
              </div>

              {isOwner && (
                <button
                  className="add-participant-btn"
                  onClick={() =>
                    navigate(`/projects/edit/${project.project_id}`)
                  }
                >
                  + Add participant
                </button>
              )}

              {!isOwner && !isParticipant && (
                <div>
                  <button onClick={handleJoinRequest}>Request to join</button>
                  {joinStatus && <p className="join-status">{joinStatus}</p>}
                </div>
              )}

              {(isOwner || isParticipant) && (
                <button onClick={() => navigate("/upload")}>+ Add</button>
              )}
            </section>
          </div>

          <div className="details-divider" />
          {(isOwner || isAdmin) && (
            <div className="post-actions">
              {isOwner && (
                <button
                  onClick={() =>
                    navigate(`/projects/edit/${project.project_id}`)
                  }
                >
                  Edit
                </button>
              )}

              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this project?",
                    )
                  ) {
                    const url =
                      isAdmin && !isOwner
                        ? `http://localhost:3001/admin/projects/${project.project_id}`
                        : `http://localhost:3001/projects/${project.project_id}`;

                    Axios.delete(url, { withCredentials: true })
                      .then(() => {
                        alert("Project deleted successfully");
                        navigate(from);
                      })
                      .catch((err) => {
                        console.log(err);
                        alert("Failed to delete project");
                      });
                  }
                }}
              >
                Delete
              </button>
            </div>
          )}

          <div className="comments-section">
            <h2>Comments</h2>

            <div className="comment-input-row">
              <div className="comment-avatar">
                <img src={profIcon} alt="profileIcon" />
              </div>
              <div className="comment-input-box">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment"
                />
                <button className="sendComBtn" onClick={handleAddComment}>
                  <img src={sendIcon} alt="send icon" />
                </button>
              </div>
            </div>

            {comments.length > 0 ? (
              <div className="comments-list">
                {comments.map((c) => (
                  <div key={c.comment_id} className="comment-item">
                    <div className="comment-avatar-block">
                      <div className="comment-avatar">
                        <img src={profIcon} alt="profile icon" />
                      </div>
                      <span>@{c.username}</span>
                    </div>
                    {editingCommentId === c.comment_id ? (
                      <div className="comment-edit-box">
                        <input
                          type="text"
                          value={editingCommentText}
                          onChange={(e) =>
                            setEditingCommentText(e.target.value)
                          }
                        />

                        <button
                          onClick={() => handleSaveEditedComment(c.comment_id)}
                        >
                          Save
                        </button>

                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingCommentText("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p>{c.content}</p>
                    )}

                    {editingCommentId !== c.comment_id && (
                      <div className="comment-actions">
                        {c.user_id === currentUserId && (
                          <button
                            onClick={() => {
                              setEditingCommentId(c.comment_id);
                              setEditingCommentText(c.content);
                            }}
                          >
                            <img src={editIcon} alt="edit btn" />
                          </button>
                        )}

                        {(c.user_id === currentUserId || isAdmin) && (
                          <button
                            onClick={() => {
                              const url =
                                isAdmin && c.user_id !== currentUserId
                                  ? `http://localhost:3001/admin/comments/${c.comment_id}`
                                  : `http://localhost:3001/comments/${c.comment_id}`;

                              Axios.delete(url, { withCredentials: true }).then(
                                loadComments,
                              );
                            }}
                          >
                            <img src={deleteIcon} alt="delete btn" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No comments yet</p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetails;
