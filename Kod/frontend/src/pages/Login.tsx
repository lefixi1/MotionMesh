import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { GoogleLogin } from "@react-oauth/google";

interface LoginProps {
  setUsername: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ setUsername }) => {
  const [loginStatus, setLoginStatus] = useState<string>("");
  const navigate = useNavigate();

  Axios.defaults.withCredentials = true;

  useEffect(() => {
    Axios.get("http://localhost:3001/login").then((response) => {
      if (response.data.loggedIn == true) {
        setLoginStatus(response.data.user[0].username);
      }
    });
  }, []);

  return (
    <>
      <div id="page">
        <Header
          logoTarget="/"
          rightActions={
            <>
              <button onClick={() => navigate("/register")}>Sign in</button>
            </>
          }
        />
        <main className="login">
          <h1>Login</h1>

          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const cred = credentialResponse?.credential;
              if (!cred) return;

              Axios.post(
                "http://localhost:3001/google-login",
                { credential: cred },
                { withCredentials: true },
              )
                .then((response) => {
                  if (response.data.status === "login_success") {
                    setUsername(response.data.user.username);
                    navigate("/main");
                  } else if (response.data.status === "user_not_registered") {
                    const confirmRegister = window.confirm(
                      "This Google account is not yet registered. Go to register page please.",
                    );

                    if (confirmRegister) {
                      Axios.post(
                        "http://localhost:3001/google-register",
                        {
                          ...response.data.googleData,
                        },
                        { withCredentials: true },
                      )
                        .then((res) => {
                          if (res.data.status === "register_success") {
                            setUsername(res.data.user.username);
                            navigate("/main");
                          }
                        })
                        .catch(() => alert("Registration failed"));
                    }
                  }
                })
                .catch(() => alert("Google login failed"));
            }}
            onError={() => console.log("Google login failed")}
            auto_select={false}
          ></GoogleLogin>
        </main>
        <h1>{loginStatus}</h1>
        <Footer />{" "}
      </div>
    </>
  );
};

export default Login;
