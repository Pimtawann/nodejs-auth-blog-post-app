import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = React.createContext();

function AuthProvider(props) {
  const [state, setState] = useState({
    loading: null,
    error: null,
    user: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const userData = jwtDecode(token);
        setState({loading: false, error: null, user: userData });
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = async (data) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const result = await axios.post("http://localhost:4000/auth/login", data);
      const token = result.data.token;
      localStorage.setItem("token", token);
      const userDataFromToken = jwtDecode(token);
      navigate("/");

    } catch (error) {
      setState({
        loading: false,
        error: error.response?.data?.message || "Login Failed",
        user: null,
      });
    }
  };

  const register = async (data) => {
    await axios.post("http://localhost:4000/auth/register", data);
    navigate("/login");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setState({loading: false, error: null, user: null});
    navigate("/login");
  };

  const isAuthenticated = Boolean(state.user);

  return (
    <AuthContext.Provider
      value={{ state, login, logout, register, isAuthenticated }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

// this is a hook that consume AuthContext
const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
