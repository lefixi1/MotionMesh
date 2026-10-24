import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface EditUserProfilepProps {
  username: string;
  setUsername: (username: string) => void;
}

const EditUserProfile: React.FC<EditUserProfilepProps> = ({ setUsername }) => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [usernameIn, setUsernameIn] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Axios.get("http://localhost:3001/user/edit", {
      withCredentials: true,
    }).then((res) => {
      setName(res.data.name);
      setSurname(res.data.surname);
      setUsernameIn(res.data.username);
      setDescription(res.data.description || "");
      setTagsInput(
        res.data.tags && res.data.tags.length > 0
          ? res.data.tags.join(", ")
          : "",
      );
    });
  }, []);

  const updateProfile = () => {
    Axios.put(
      "http://localhost:3001/user/edit",
      {
        name,
        surname,
        username: usernameIn,
        description,
        tags: tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      },
      { withCredentials: true },
    ).then((res) => {
      console.log(res.data);
      setStatus(res.data.message);

      if (res.data.message === "Profile updated successfully") {
        setUsername(usernameIn);
        setTimeout(() => {
          navigate("/user");
        }, 1000);
      }
    });
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

      <main className="upload-edit-page">
        <h1>Edit profile</h1>

        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <label>Surname</label>
        <input value={surname} onChange={(e) => setSurname(e.target.value)} />
        <label>Username</label>
        <input
          value={usernameIn}
          onChange={(e) => setUsernameIn(e.target.value)}
        />
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell something about yourself"
        />
        <label>Tags</label>
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="3D, animation, design"
        />

        <button onClick={updateProfile}>Save changes</button>

        <p style={{ color: status.includes("success") ? "green" : "red" }}>
          {status}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default EditUserProfile;
