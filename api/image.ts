import express from "express";
import mysql from "mysql";
import { ImageRequest } from "../model/ImageRequest";

export const router = express.Router();
router.use(express.json());

export const cors = require("cors");
router.use(cors());

export const bcrypt = require("bcrypt");

export const conn = mysql.createPool({
  host: "202.28.34.197",
  user: "web65_64011212052",
  password: "64011212052@csmsu",
  database: "web65_64011212052",
});

//get top 10
router.get("/", (req, res) => {
  if (req.query.id) {
    res.send("Get in image.ts Query id : " + req.query.id);
  } else {
    conn.query("SELECT * FROM image ORDER BY img_score DESC LIMIT 10", (err, result, fields) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(200).json(result);
      }
    });
  }
});

router.get("/user/:id", (req, res) => {
  let id = +req.params.id;
  if (id) {
    conn.query("SELECT * FROM image WHERE user_id=?",  [id],(err, result, fields) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(200).json(result);
      }
    });
  }
});

//add image
router.post("/", (req, res) => {
  const image: ImageRequest = req.body;
  let sql =
    "INSERT INTO `image`(`user_id`,`img`,`img_name`, `img_score`, `created_at`) VALUES (?,?,?,?,?)";
  sql = mysql.format(sql, [
    image.user_id,
    image.img,
    image.img_name,
    0,
    new Date()
  ]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    sql = mysql.format("UPDATE `image` SET `img_id`=? WHERE `img_id`=?", [result.insertId,result.insertId,]);
    conn.query(sql);
    res.status(201).json({ affected_row: result.affectedRows, last_idx: result.insertId });
  });
});

//update image
router.put("/:id", (req, res) => {
  const image: ImageRequest = req.body;
  let sql =
    "update `image` set `img`=?, `img_name`=?, `img_score`=?, `created_at`=? where `img_id`=?";
  sql = mysql.format(sql, [
    image.img,
    image.img_name,
    image.img_score,
    image.created_at,
  ]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.status(200).json({ Message: "Success" });
  });
});

//delete image
router.delete("/:id", (req, res) => {
  let id = +req.params.id;
  conn.query("delete from image where img_id = ?", [id], (err, result) => {
    if (err) throw err;
    res.status(200).json({ affected_row: result.affectedRows });
  });
});

//get image rondom
router.get("/imagevote", (req, res) => {
  if (req.query.id) {
    res.send("Get in image.ts Query id : " + req.query.id);
  } else {
    conn.query("SELECT * FROM `image` ORDER BY RAND() LIMIT 1", (err, result, fields) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(200).json(result);
      }
    });
  }
});

//get image rondom ไม่ซ้ำ img_id
router.get("/imagevote/:id", (req, res) => {
  let id = +req.params.id;
  if (id) {
    conn.query("SELECT * FROM image WHERE img_id!=? ORDER BY RAND() LIMIT 1 ",  [id],(err, result, fields) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(200).json(result);
      }
    });
  }
});