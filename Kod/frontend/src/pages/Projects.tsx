import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { googleLogout } from "@react-oauth/google";
import ModelViewer from "./ModelViewer";
import sortIcon from "../assets/sort icon v2.png";
import addIcon from "../assets/plus.png";

import type { Project } from "../types";

interface ProjectsProps {
  setUsername: (username: string) => void;
}

type SortOption = "default" | "title-asc" | "title-desc";

const Projects: React.FC<ProjectsProps> = ({ setUsername }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const navigate = useNavigate();

  useEffect(() => {
    Axios.get("http://localhost:3001/projects/public")
      .then((res) => {
        setProjects(res.data);
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

  if (loading) return <p>Loading public projects...</p>;

  const sortedProj = [...projects];

  if (sortOption === "title-asc") {
    sortedProj.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === "title-desc") {
    sortedProj.sort((a, b) => b.title.localeCompare(a.title));
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
          <h1>Public projects</h1>
          <p className="public-posts-subtitle">
            Explore community collaborations, open roles and shared creative
            work.
          </p>
          <button
            className="createBtn"
            onClick={() => navigate("/projects/create")}
          >
            <img src={addIcon} alt="add icon" />
            Create project
          </button>
          <div className="section-divider" />

          <div className="posts-toolbar">
            <p className="post-count">{projects.length} items</p>

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

          {projects.length === 0 ? (
            <p className="empty-projects">No public projects yet</p>
          ) : (
            <div className="projects-list">
              {sortedProj.map((project) => (
                <div
                  key={project.project_id}
                  className={
                    project.status === "open"
                      ? "project-wide-card project-open"
                      : "project-wide-card"
                  }
                  onClick={() =>
                    navigate(`/projects/${project.project_id}`, {
                      state: { from: "/projects" },
                    })
                  }
                >
                  <div className="project-status">
                    {project.status === "open" ? "Open" : "Closed"}
                  </div>
                  <div className="project-wide-left">
                    <div className="project-wide-image">
                      {(() => {
                        const preview = project.file;

                        if (!preview) {
                          return (
                            <div className="project-no-preview">No preview</div>
                          );
                        }

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
                  </div>

                  <div className="project-wide-content">
                    <div className="project-wide-main">
                      <h3>{project.title}</h3>
                      <p className="project-team">Team: @{project.username}</p>

                      <div className="project-looking-for">
                        <span className="project-looking-label">
                          Looking for:
                        </span>
                        {project.lookingFor &&
                          project.lookingFor.length > 0 && (
                            <span className="project-looking-tag">
                              {project.lookingFor[0]}
                            </span>
                          )}
                      </div>

                      <div>
                        <span>Description:</span>
                        <p className="project-description">
                          {project.overview}
                        </p>
                      </div>

                      <button
                        className="project-show-btn"
                        onClick={() =>
                          navigate(`/projects/${project.project_id}`, {
                            state: { from: "/projects" },
                          })
                        }
                      >
                        Show
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Projects;
