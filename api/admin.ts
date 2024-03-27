import express from "express";
import mysql from "mysql";
import { UserRequest } from "../model/UserRequest";
import { AdminRequest } from "../model/AdminRequest";
export const router = express.Router();
router.use(express.json());
export const cors = require("cors");
router.use(cors());
const bcrypt = require("bcrypt");
const util = require('util');
var jwt = require('jsonwebtoken');
const secret = 'Login'

export const conn = mysql.createPool({
  host: "202.28.34.197",
  user: "web65_64011212052",
  password: "64011212052@csmsu",
  database: "web65_64011212052",
});

//login admin
router.post("/login", async (req, res) => {
    conn.query(
        "SELECT * FROM Admin WHERE email=?",
        [req.body.email],
        (err, Admin,fields) => {
          if (err) {
           res.json({status: 'error',message: err})
           return
          }
          if(Admin.length == 0){
            res.json({status: 'error', message: 'no user found'})
            return
          }
          bcrypt.compare(req.body.password,Admin[0].password, function(err:any,isAdmin:any){
            if(isAdmin){
                res.status(200).json({ login: "true" });
            }else{
                res.status(200).json({ login: "false" });
            }
          });
        }
      );
});

router.get("/", (req, res) => {
  if (req.query.id) {
    res.send("Get in image.ts Query id : " + req.query.id);
  } else {
    conn.query("SELECT * FROM Admin", (err, result, fields) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(200).json(result);
      }
    });
  }
});