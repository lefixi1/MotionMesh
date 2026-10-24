import React from "react";
import { Navigate } from "react-router-dom";

interface RegisterRouteProps {
  canRegister: boolean;
  children: React.ReactNode;
}

const RegisterRoute: React.FC<RegisterRouteProps> = ({
  canRegister,
  children,
}) => {
  if (!canRegister) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

export default RegisterRoute;
