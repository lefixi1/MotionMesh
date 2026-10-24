import React, { useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

type AuthProps = {
  setCanRegister: (value: boolean) => void;
};

const Auth: React.FC<AuthProps> = ({ setCanRegister }) => {
  const [codeAuth, setCodeAuth] = useState<string>("");
  const [authMessage, setAuthMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  Axios.defaults.withCredentials = true;

  const auth = () => {
    if (!codeAuth) {
      setAuthMessage("Please enter your authorization code");
      setIsSuccess(false);
      return;
    }
    Axios.post("http://localhost:3001/auth", {
      code: codeAuth,
    })
      .then((response) => {
        if (response.data.authStat) {
          setAuthMessage(response.data.message);
          setIsSuccess(true);

          setCanRegister(true);

          setTimeout(() => {
            navigate("/register");
          }, 1000);
        } else {
          setAuthMessage(response.data.message);
          setIsSuccess(false);
        }
      })
      .catch(() => {
        setAuthMessage("Server error, please try again later");
        setIsSuccess(false);
      });
  };

  return (
    <div id="page">
      <Header logoTarget="/" />
      <main className="Auth-cont">
        <div className="Auth-box">
          <h1>Type auth code</h1>
          <label>Your code</label>
          <input
            type="password"
            value={codeAuth}
            onChange={(e) => {
              setCodeAuth(e.target.value);
            }}
          />
          <button onClick={auth}>Check</button>
          <p className={`authMessage ${isSuccess ? "success" : "error"}`}>
            {authMessage}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
