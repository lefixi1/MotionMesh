import React from "react";
import logo from "../assets/Logo final.png";
import { useNavigate } from "react-router-dom";

const Footer: React.FC = () => {
  const navigate = useNavigate();
  return (
    <footer>
      <img
        src={logo}
        alt="Logo"
        className="logo-down"
        onClick={() => navigate("/main")}
      />
      <p>motionmesh.support@gmail.com</p>
      <p>+421 987 654 321</p>
      <p className="copyright">{"\u00A9"} 2026 MotionMesh</p>
    </footer>
  );
};

export default Footer;
