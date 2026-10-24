import React, { useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { GoogleLogin } from "@react-oauth/google";

interface RegisterProps {
  setUsername: (username: string) => void;
}

const Register: React.FC<RegisterProps> = ({ setUsername }) => {
  const [regStatus] = useState<string>("");
  const navigate = useNavigate();

  Axios.defaults.withCredentials = true;

  return (
    <div id="page">
      <Header
        logoTarget="/"
        rightActions={
          <>
            <button onClick={() => navigate("/login")}>Login</button>
          </>
        }
      />
      <main className="registration">
        <h1>Registration</h1>

        <GoogleLogin
          onSuccess={(credentialResponse) => {
            const cred = credentialResponse?.credential;
            if (!cred) return;

            Axios.post(
              "http://localhost:3001/google-login",
              { credential: cred },
              { withCredentials: true },
            ).then((response) => {
              if (response.data.status === "user_not_registered") {
                Axios.post(
                  "http://localhost:3001/google-register",
                  {
                    ...response.data.googleData,
                  },
                  { withCredentials: true },
                ).then((res) => {
                  if (res.data.status === "register_success") {
                    setUsername(res.data.user.username);
                    navigate("/main");
                  }
                });
              } else if (response.data.status === "login_success") {
                setUsername(response.data.user.username);
                navigate("/main");
              }
            });
          }}
          onError={() => console.log("Google registration failed")}
        />

        <p>{regStatus}</p>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
