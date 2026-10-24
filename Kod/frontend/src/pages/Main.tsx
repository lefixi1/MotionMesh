import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { googleLogout } from "@react-oauth/google";
import ModelViewer from "./ModelViewer";
import teamWorkPic from "../assets/TeamWork.png";
import illustrationPic from "../assets/illustration.jpg";
import modelPic from "../assets/3d.jpg";
import animatPic from "../assets/animation.jpg";
import profIcon from "../assets/profile icon 2.png";
import addIcon from "../assets/plus.png";

import type { Post } from "../types";

interface MainProps {
  setUsername: (username: string) => void;
}

const Main: React.FC<MainProps> = ({ setUsername }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [randomPosts, setRandomPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"posts" | "users">("posts");
  const words = ["Create", "Animate", "Collaborate"];
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed] = useState(150);
  const navigate = useNavigate();

  Axios.defaults.withCredentials = true;

  useEffect(() => {
    Axios.get("http://localhost:3001/posts/random")
      .then((res) => {
        setPosts(res.data);
        setRandomPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching posts:", err);
        setError("Failed to load posts");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setPosts(randomPosts);
      return;
    }

    Axios.get(
      `http://localhost:3001/posts/search?q=${encodeURIComponent(
        searchQuery,
      )}&mode=${searchMode}`,
    )
      .then((res) => {
        setPosts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.log(err));
  }, [searchQuery, searchMode, randomPosts]);

  useEffect(() => {
    const currentWord = words[wordIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(currentWord.substring(0, text.length + 1));

        if (text === currentWord) {
          setIsDeleting(true);
        }
      } else {
        setText(currentWord.substring(0, text.length - 1));

        if (text === "") {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, speed]);

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

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error}</p>;

  const filteredPosts = posts;

  const isSearching = searchQuery.trim() !== "";

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

      <main className="main-p">
        <div className="main-top">
          <div className="left-top">
            <h1>Streamline your creative process with teamwork.</h1>
            <div className="animateText">
              {text}
              <span style={{ opacity: 1 }}>|</span>
            </div>

            <div className="searchDiv">
              <input
                type="text"
                placeholder={
                  searchMode === "posts"
                    ? "Find creative works..."
                    : "Search for artists, animators, or graphic designer..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="searchBar"
              />
              <div className="modeBtns">
                <button
                  onClick={() => setSearchMode("posts")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    background: searchMode === "posts" ? "#333745" : "none",
                    margin: "0 1rem",
                  }}
                >
                  Posts
                </button>

                <button
                  onClick={() => setSearchMode("users")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    background: searchMode === "users" ? "#333745" : "none",
                  }}
                >
                  Users
                </button>
              </div>
            </div>
          </div>
          <div className="right-top">
            <img src={teamWorkPic} alt="teamWork" className="teamWorkPic" />
          </div>
        </div>

        {!isSearching && (
          <div className="browse">
            <h3>Discover collaboration projects</h3>
            <div className="typesPro">
              <div className="tPro">
                <img src={illustrationPic} alt="illustration" />
                <p>2D Illustrations</p>
              </div>
              <div className="tPro">
                <img src={modelPic} alt="3d model" />
                <p>3D Models</p>
              </div>
              <div className="tPro">
                <img src={animatPic} alt="animation" />
                <p>Animations</p>
              </div>
            </div>
          </div>
        )}

        {posts.length === 0 ? (
          <div>
            <p>No public posts yet.</p>
            <button onClick={() => navigate("/upload")}>
              Make your first post
            </button>
          </div>
        ) : (
          <div className="posts">
            <h2>{isSearching ? "Search results" : "Recommended for you"}</h2>
            <div className="post">
              {filteredPosts.map((post) => (
                <div
                  key={post.post_id}
                  className="post-card"
                  onClick={() =>
                    navigate(`/posts/${post.post_id}`, {
                      state: { from: "/main" },
                    })
                  }
                >
                  <div className="card-image">
                    {(() => {
                      const preview = post.file;

                      if (!preview) return null;

                      const url = `http://localhost:3001/${preview.file_path.replace(/\\/g, "/")}`;

                      if (preview.file_type?.startsWith("image/")) {
                        return <img src={url} alt={preview.file_name} />;
                      }

                      if (preview.file_type?.startsWith("video/")) {
                        return (
                          <video src={url} muted loop autoPlay playsInline />
                        );
                      }

                      return (
                        <div className="model-wrapper">
                          <ModelViewer filePath={url} />;
                        </div>
                      );
                    })()}
                  </div>

                  <div className="card-text">
                    <p className="post-card-title">{post.title}</p>
                    <div
                      className="card-profile"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/${post.user_id}`);
                      }}
                    >
                      <p>{post.username}</p>
                      <img src={profIcon} alt="profileIcon" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!isSearching && (
              <button className="more-btn" onClick={() => navigate("/posts")}>
                Explore more
              </button>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Main;
