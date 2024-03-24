import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/login", { email, password })
      //   .then((res) => console.log(res.data))
      .then((res) => {
        if(res.data.Login){
            navigate("/dashboard");
        } else {
            navigate('/')
        }
        
      })
      .catch((error) => console.log(error));
  };
  return (
    <>
      <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
        <div className="bg-white p-3 rounded w-25">
          <h2> Login Form 📝 </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email">
                <strong>Email :</strong>
              </label>
              <input
                type="email"
                placeholder="Enter your Email"
                autoComplete="off"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                className="form-control rounded-0"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email">
                <strong>Password :</strong>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                autoComplete="off"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                className="form-control rounded-0"
              />
            </div>
            <button type="submit" className="btn btn-success w-100 rounded-0">
              Login
            </button>
          </form>
          <p> Don't have Account? 🕵🏻‍♂️</p>
          <button className="btn btn-default border w-100 rounded-0 bg-light text-decoration-none">
            Register
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;
