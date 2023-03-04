const express = require("express");
const colors = require("colors");
const cors = require("cors");
require("dotenv").config();
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema/schema.js");
const connectDB = require("./config/db");
const Project = require("./models/Project");
//additions
const path = require("path");
const { readFileSync } = require("fs");
const fetch = require("node-fetch");

const port = 5001;

const app = express();

// Connect to database
connectDB();

app.use(cors());

app.get("/errormock", (req, res) => {
  return res.status(404).json({ error: "error404" });
});

app.get("/", (req, res) => {
  Project.findById("63ed859916c7e5a6d36266b8", (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Result : ", docs);
    }
  });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === "development",
    extensions: ({ document, variables, operationName, result }) => {
      console.log("result data: ", result);
      fetch("http://localhost:3000/queryRespReceiver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({queryResp: result }),
      })
        .then((data) => {
          return data.json();
        })
        .then((resp) => {
          console.log("resp: ", resp);
        });
    },
    customFormatErrorFn: (error) => {
      console.error("error by J: ", error);
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  })
);

app.use((err, req, res, next) => {
  console.error(err);
  next();
});

app.listen(port, console.log(`Server running on port ${port}`));
