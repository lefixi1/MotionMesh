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

import type { Post } from "../types";

interface DetailsProps {
  setUsername: (username: string) => void;
}

const PostDetails: React.FC<DetailsProps> = ({ setUsername }) => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/posts";

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
    Axios.get(`http://localhost:3001/posts/${id}`)
      .then((response) => {
        setPost(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [id]);

  const loadComments = () => {
    Axios.get(`http://localhost:3001/posts/${id}/comments`)
      .then((res) => {
        setComments(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (!id) return;
    loadComments();
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

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    Axios.post(
      `http://localhost:3001/posts/${id}/comments`,
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

  if (loading) return <p>Loading post...</p>;
  if (!post) return <p>Post not found.</p>;

  const mainFile = post.file;

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
              <img
                src={back}
                alt="back"
                className="back"
                onClick={() => navigate(-1)}
              />
              Back
            </button>
          </div>

          <div className="details-top">
            <div className="details-heading">
              <h1>{post.title}</h1>

              <div className="details-tags">
                {post.tags && post.tags.length > 0 ? (
                  post.tags.map((tag) => <span key={tag}>#{tag}</span>)
                ) : (
                  <span>#</span>
                )}
              </div>
            </div>

            <div className="details-author">
              <div className="details-author-avatar">
                <img src={profIcon} alt="profile icon" />{" "}
              </div>
              <div className="details-author-info">
                <p className="author-username">@{post.username}</p>
                <button
                  className="visit-profile-btn"
                  onClick={() => navigate(`/user/${post.user_id}`)}
                >
                  Visit profile
                </button>
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
              <h2>Description</h2>
              <p>{post.description}</p>
            </section>

            <section>
              <h2>Concept</h2>
              <p>{post.concept ?? "-"}</p>
            </section>

            <section>
              <h2>Result</h2>
              <p>{post.result ?? "-"}</p>
            </section>
          </div>

          <div className="details-divider" />

          {(post.username === currentUser || isAdmin) && (
            <div className="post-actions">
              {post.username === currentUser && (
                <button onClick={() => navigate(`/update/${post.post_id}`)}>
                  Edit
                </button>
              )}

              <button
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to delete this post?")
                  ) {
                    const url =
                      isAdmin && post.username !== currentUser
                        ? `http://localhost:3001/admin/posts/${post.post_id}`
                        : `http://localhost:3001/posts/${post.post_id}`;

                    Axios.delete(url, {
                      withCredentials: true,
                    })
                      .then(() => {
                        alert("Post deleted successfully");
                        navigate(from);
                      })
                      .catch((err) => {
                        console.log(err);
                        alert("Failed to delete post");
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
                        <img src={profIcon} alt="profileIcon" />
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

                              Axios.delete(url, { withCredentials: true })
                                .then(() => loadComments())
                                .catch((err) => console.log(err));
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

export default PostDetails;
