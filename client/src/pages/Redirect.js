import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Redirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token) {
      navigate("/register");
    } else if (user?.role === "admin") {
      navigate("/admin-panel");
    } else {
      navigate("/dashboard");
    }
  }, []);

  return null;
};

export default Redirect;
