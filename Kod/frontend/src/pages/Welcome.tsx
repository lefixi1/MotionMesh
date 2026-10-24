import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Welcome: React.FC = () => {
  return (
    <div id="page">
      <Header
        logoTarget="/"
        rightActions={
          <>
            <button
              className="regB"
              onClick={() => (window.location.href = "/auth")}
            >
              Sign up
            </button>
            <button
              className="loginB"
              onClick={() => (window.location.href = "/login")}
            >
              Login
            </button>
          </>
        }
      />

      <main>
        <h1>Welcome</h1>
        <h4>This is a closed platform</h4>
        <h4>Please login or type auth code and register to continue</h4>
      </main>
      <Footer />
    </div>
  );
};

export default Welcome;
