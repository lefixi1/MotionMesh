import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { googleLogout } from "@react-oauth/google";
import ModelViewer from "./ModelViewer";
import profIcon from "../assets/profile icon 2.png";
import sortIcon from "../assets/sort icon v2.png";
import addIcon from "../assets/plus.png";

import type { Post } from "../types";

interface PostsProps {
  setUsername: (username: string) => void;
}

type SortOption = "default" | "title-asc" | "title-desc";

const Posts: React.FC<PostsProps> = ({ setUsername }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const navigate = useNavigate();

  useEffect(() => {
    Axios.get("http://localhost:3001/posts/public")
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(true);
      });
  }, []);

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

  if (loading) return <p>Loading public posts...</p>;

  // if (posts.length === 0) return <p>No public posts yet</p>;

  const sortedPosts = [...posts];

  if (sortOption === "title-asc") {
    sortedPosts.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === "title-desc") {
    sortedPosts.sort((a, b) => b.title.localeCompare(a.title));
  }

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

      <main>
        <div className="public-posts">
          <h1>Public posts</h1>
          <p className="public-posts-subtitle">
            Explore community creations, 3D models, animations and shared work.
          </p>
          <button className="createBtn" onClick={() => navigate("/upload")}>
            <img src={addIcon} alt="add icon" />
            Create post
          </button>
          <div className="section-divider" />

          <div className="posts-toolbar">
            <p className="post-count">{posts.length} items</p>

            <div className="posts-actions">
              <label htmlFor="sort" className="sort-label">
                <img src={sortIcon} alt="sort icon" />
              </label>
              <select
                id="sort"
                className="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
              >
                <option value="default">Default</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>
            </div>
          </div>

          <div className="post">
            {sortedPosts.length === 0 ? (
              <p>No public posts yet</p>
            ) : (
              sortedPosts.map((post) => (
                <div
                  key={post.post_id}
                  className="post-card"
                  onClick={() =>
                    navigate(`/posts/${post.post_id}`, {
                      state: { from: "/posts" },
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
                          <ModelViewer filePath={url} />
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
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Posts;
