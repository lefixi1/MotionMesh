import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import type { Visibility } from "../types";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { googleLogout } from "@react-oauth/google";
import ModelViewer from "./ModelViewer";

interface UploadEditPageProps {
  setUsername: (username: string) => void;
  mode?: "create" | "edit";
}

interface CurrentFile {
  name: string;
  path: string;
  type: string;
}

interface UserProject {
  project_id: number;
  title: string;
}

const UploadPage: React.FC<UploadEditPageProps> = ({
  setUsername,
  mode = "create",
}) => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [concept, setConcept] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<CurrentFile | null>(null);
  const [tagsInput, setTagsInput] = useState<string>("");
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    if (mode === "edit" && id) {
      setLoading(true);
      Axios.get(`http://localhost:3001/posts/${id}`)
        .then((response) => {
          const post = response.data;
          setTitle(post.title);
          setDescription(post.description || "");
          setConcept(post.concept || "");
          setResult(post.result || "");
          setVisibility(post.visibility);
          setSelectedProjectId(post.project_id ? String(post.project_id) : "");

          setTagsInput(
            post.tags && post.tags.length > 0 ? post.tags.join(", ") : "",
          );

          setCurrentFile({
            name: post.file?.file_name || "",
            path: post.file?.file_path || "",
            type: post.file?.file_type || "",
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error loading post:", err);
          setUploadStatus("Error loading post");
          setLoading(false);
        });
    }
  }, [mode, id]);

  useEffect(() => {
    Axios.get("http://localhost:3001/projects/user", {
      withCredentials: true,
    })
      .then((res) => {
        setUserProjects(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    const isAllowed =
      file.type.startsWith("image/") ||
      file.type.startsWith("video/") ||
      file.name.toLowerCase().endsWith(".glb");

    if (!isAllowed) {
      setUploadStatus("Only images, videos or .glb 3D files are allowed.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (mode === "create" && !selectedFile) {
      setUploadStatus("Please select file first.");
      return;
    }

    if (!title.trim()) {
      setUploadStatus("Please enter a title.");
      return;
    }

    setLoading(true);
    setUploadStatus(mode === "create" ? "Uploading..." : "Updating...");

    try {
      if (mode === "create") {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("concept", concept);
        formData.append("result", result);
        formData.append("visibility", visibility);

        formData.append(
          "tags",
          JSON.stringify(
            tagsInput
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          ),
        );

        if (selectedProjectId) {
          formData.append("project_id", selectedProjectId);
        }

        if (selectedFile) {
          formData.append("file", selectedFile);
        }

        const res = await Axios.post("http://localhost:3001/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });

        setUploadStatus(res.data.message || "Upload successful");
        setSelectedFile(null);
        setTitle("");
        setDescription("");
        setConcept("");
        setResult("");
        setVisibility("public");
        setTagsInput("");

        setTimeout(() => navigate("/user"), 1500);
      } else if (mode === "edit" && id) {
        const res = await Axios.put(
          `http://localhost:3001/posts/${id}`,
          {
            title,
            description,
            concept,
            result,
            visibility,
            project_id: selectedProjectId || null,
            tags: tagsInput
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          },
          { withCredentials: true },
        );

        setUploadStatus(res.data.message || "Update successful");

        setTimeout(() => navigate(`/posts/${id}`), 1500);
      }
    } catch (err: any) {
      console.error("Error:", err);
      if (err.response?.status === 401) {
        setUploadStatus("Session expired. Please log in again.");
        setUsername("");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setUploadStatus(
          mode === "create"
            ? "Upload failed. Try again."
            : "Update failed. Try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

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

  const isFormValid =
    mode === "create" ? title.trim() && selectedFile !== null : title.trim();

  const getFileExtension = (fileName: string) => {
    return fileName.split(".").pop()?.toLowerCase() || "";
  };

  const is3DFile = (fileName: string, fileType: string) => {
    const ext = getFileExtension(fileName);

    return fileType.includes("model") || ext === "glb";
  };

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
    const isImage = fileType.startsWith("image/");
    const isVideo = fileType.startsWith("video/");
    const is3D = is3DFile(fileName, fileType);

    if (isImage) {
      return <img src={fileUrl} alt={fileName} className="preview-image" />;
    }

    if (isVideo) {
      return <video src={fileUrl} controls className="preview-video" />;
    }

    if (is3D) {
      return (
        <div className="preview-model">
          <ModelViewer filePath={fileUrl} />
        </div>
      );
    }

    return (
      <div className="file-info">
        <p>📄 {fileName}</p>
      </div>
    );
  };

  const renderSelectedFilePreview = () => {
    if (!selectedFile) return null;

    const file = selectedFile;
    const fileType = file.type || "";
    const fileName = file.name || "";
    const previewUrl = URL.createObjectURL(file);

    if (fileType.startsWith("image/")) {
      return <img src={previewUrl} alt={fileName} className="preview-image" />;
    }

    if (fileType.startsWith("video/")) {
      return <video src={previewUrl} controls className="preview-video" />;
    }

    return (
      <div className="preview-model">
        <ModelViewer filePath={previewUrl} />
      </div>
    );

    return null;
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
        <div className="upload-edit-content">
          <h1>{mode === "create" ? "Upload Post" : "Edit Post"}</h1>

          <label>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            disabled={loading}
          />

          <label>Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description (optional)"
            disabled={loading}
          />

          <label>Concept</label>
          <input
            type="text"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Enter concept (optional)"
            disabled={loading}
          />

          <label>Result</label>
          <input
            type="text"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="Enter result (optional)"
            disabled={loading}
          />

          <label>Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            disabled={loading}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <label>Tags</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="3D, animation, design"
            disabled={loading}
          />

          <label>Project</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={loading}
          >
            <option value="">No project</option>
            {userProjects.map((project) => (
              <option key={project.project_id} value={project.project_id}>
                {project.title}
              </option>
            ))}
          </select>

          {mode === "create" && (
            <>
              <label>Upload files *</label>
              <input
                type="file"
                onChange={handleFileChange}
                disabled={loading}
                accept="image/*, video/*, .glb"
              />
            </>
          )}

          {mode === "edit" && currentFile && (
            <div className="current-file">
              <label>Current File</label>
              <div className="file-preview">
                {renderCurrentFilePreview()}
                <p className="file-note">
                  Note: File cannot be changed in edit mode. To change the file,
                  please create a new post.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            className="submit-button"
          >
            {loading
              ? mode === "create"
                ? "Uploading..."
                : "Updating..."
              : mode === "create"
                ? "Upload"
                : "Save Changes"}
          </button>

          <p
            className={`status-message ${
              uploadStatus.includes("expired") ||
              uploadStatus.includes("failed") ||
              uploadStatus.includes("Error")
                ? "error"
                : uploadStatus.includes("success") ||
                    uploadStatus.includes("succeddful")
                  ? "success"
                  : ""
            }`}
          >
            {uploadStatus}
          </p>

          {mode === "create" && selectedFile && (
            <div className="selected-files">
              <h3>Selected file:</h3>
              <p>{selectedFile.name}</p>

              <div className="file-preview">{renderSelectedFilePreview()}</div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UploadPage;
