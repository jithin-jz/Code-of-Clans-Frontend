import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SkeletonGenericPage } from "../common/SkeletonPrimitives";

const GameRedirectPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/home");
  }, [navigate]);
  return <SkeletonGenericPage />;
};

export default GameRedirectPage;
