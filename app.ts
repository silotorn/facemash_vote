import express from "express";
import { router as user } from "./api/user";
import { router as image } from "./api/image";
import { router as vote } from "./api/vote";
import { router as admin } from "./api/admin";
import bodyParser from "body-parser";

//web API
export const app = express();

app.use(bodyParser.text());
app.use(bodyParser.json());
app.use("/user", user);
app.use("/image", image);
app.use("/vote", vote);
app.use("/admin", admin);
