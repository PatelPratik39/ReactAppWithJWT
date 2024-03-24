import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import StudentModel from "./models/Student.js";

// const express = require("express");

const app = express();
app.use(cookieParser());
app.use(express.json());
// using cores we can handle the errors.
// i am passing original URL if any error occured
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true
  })
);

mongoose.connect("mongodb://127.0.0.1:27017/school");

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  StudentModel.create({ name, email, password })
    .then((user) => res.json(user))
    .catch((error) => res.json(error));
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  StudentModel.findOne({ email })
    .then((user) => {
      if (user) {
        // res.json(user);
        // if we find user then it will check password that should be match too.
        // then I store secret key for using jwt inaccess and refresh token for 1m and 5m respectivly
        if (user.password === password) {
          const accessToken = jwt.sign(
            { email: email },
            "jwt-access-token-secret-key",
            { expiresIn: "1m" }
          );
          const refreshToken = jwt.sign(
            { email: email },
            "jwt-refresh-token-secret-key",
            { expiresIn: "5m" }
          );
          res.cookie("accessToken", accessToken, { maxAge: 60000 });
          /*
               used maxAge: 300000, becuase i am setting a thresold limit to 300000 miliseconds and need to regenerate token 
                                        if we use same browser
            used httpOnly: true, javascript validations to store in browser cookies
            used secure: true, javascript validations to store in browser cookies
            used sameSite: "strict" javascript validations to store in browser cookies
          */
          res.cookie("refreshToken", refreshToken, {
            maxAge: 300000,
            httpOnly: true,
            secure: true,
            sameSite: "strict"
          });
          return res.json({ Login: true });
        }
      } else {
        res.json({ Login: false, message: "No record Found" });
      }
    })
    .catch((error) => res.json(error));
});

const verifyUser = (req, res, next) => {
  const accesstoken = req.cookies.accessToken;
  if (!accesstoken) {
    if (renewToken(req, res)) {
      next();
    }
  } else {
    jwt.verify(accesstoken, "jwt-access-token-secret-key", (error, decoded) => {
      if (error) {
        return res.json({ valid: false, message: "Invalid ACCESS Token" });
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
};

const renewToken = (req, res) => {
  const refreshtoken = req.cookies.refreshToken;
  let exist = false;

  if (!refreshtoken) {
    return res.json({ valid: false, message: "No Refresh Token" });
  } else {
    jwt.verify(
      refreshtoken,
      "jwt-refresh-token-secret-key",
      (error, decoded) => {
        if (error) {
          return res.json({ valid: false, message: "Invalid Refresh Token" });
        } else {
          const accessToken = jwt.sign(
            { email: decoded.email },
            "jwt-access-token-secret-key",
            { expiresIn: "1m" }
          );
          res.cookie("accessToken", accessToken, { maxAge: 60000 });
          exist = true;
        }
      }
    );
  }
  return exist;
};

app.get("/dashboard", verifyUser, (req, res) => {
  return res.json({ valid: true, message: "You are authorized" });
});

app.listen(3000, () => {
  console.log("Server is Running");
});
