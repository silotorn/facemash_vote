import express from "express";
import mysql from "mysql";
import { UserRequest } from "../model/UserRequest";
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

//get all
router.get("/", (req, res) => {
  if (req.query.id) {
    res.send("Get in image.ts Query id : " + req.query.id);
  } else {
    conn.query("SELECT * FROM User", (err, result, fields) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(200).json(result);
      }
    });
  }
});

//get by id
router.get('/:id', (req, res)=>{
  let id = +req.params.id;
  conn.query(
    "SELECT * FROM User WHERE user_id = ?",
    [id],
    (err, user) => {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      if (user.length === 0) {
        res.json({ status: "error", message: "User not found" });
        return;
      }
      res.json({ status: "ok", user: user[0] });
    }
  );
});


// router.post("/register", (req, res) => {
//   const user: UserRequest= req.body; // รับข้อมูลผู้ใช้ทั้งหมดจาก body
  
//     conn.query(
//       "INSERT INTO User (username,email,password,avatar) VALUES (?,?,?,?)",
//       [user.username, user.email, user.password, user.avatar], // เก็บรหัสผ่านที่ถูกแฮชแทนที่รหัสผ่านเดิม
//       (err, result) => {
//         if (err) {
//           console.error('Error inserting user:', err);
//           return res.status(500).json({ error: 'Error inserting user' });
//         }
//         res.status(200).json({ last_id: result.insertId });
//       }
//     );
//   });

//register
router.post("/register", (req, res) => {
  const user: UserRequest= req.body;
  
  bcrypt.hash(user.password, 10, (err:any, hash:any) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Error hashing password' });
    }
    conn.query(
      "INSERT INTO User (username,email,password,avatar) VALUES (?,?,?,?)",
      [user.username, user.email, hash, user.avatar],
      (err, result) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ error: 'Error inserting user' });
        }
        res.status(200).json({ last_id: result.insertId });
      }
    );
  });
});
  


// router.get("/login", (req, res) => {
//   // const email = req.body.email;
//   // const password = req.body.password;

//   conn.query(
//     "SELECT * FROM User WHERE email like ? AND password like ?",
//     [req.query.email, req.query.password],
//     (err, result, fields) => {
//       if (err) {
//         res.status(500).json({ error: "Internal Server Error" });
//         return;
//       }
//       if (result.length > 0) {
//         // console.log("Success");
//         res.status(200).json({ login: "true" });
//       } else {
//         res.status(200).json({ login: "false" });
//       }
//     }
//   );
// });

//Login
router.post("/login", async (req, res) => {
  conn.query(
    "SELECT * FROM User WHERE email=?",
    [req.body.email],
    (err, User,fields) => {
      if (err) {
       res.json({status: 'error',message: err})
       return
      }
      if(User.length == 0){
        res.json({status: 'error', message: 'no user found'})
        return
      }
      bcrypt.compare(req.body.password,User[0].password, function(err:any,isLogin:any){
        if(isLogin){
          var token = jwt.sign({ email: User[0].email,username: User[0].username,avatar: User[0].avatar }, secret);
          res.json({status: 'ok',message: 'Login success',user_id: User[0].user_id,username: User[0].username,avatar: User[0].avatar,token})
        }else{
          res.json({status: 'error',message: 'Login failed'})
        }
      });
    }
  );
});

//Authen
router.post('/authen', (req, res) => {
  try{
    const token = req.headers.authorization?.split(' ')[1]
    var decoded = jwt.verify(token, secret)
    res.json({status: 'ok',decoded})
  }catch(err){
    res.json({status: 'error',message: err})
  }
});

//update user
router.put("/:id", async (req, res) => {
  
  let id = +req.params.id;
  const Updateuser: UserRequest= req.body;
    let sql =
      "UPDATE `User` SET `username`= ?,`email`= ?,`avatar`= ? WHERE `user_id`= ?";
    sql = mysql.format(sql, [
      Updateuser.username,
      Updateuser.email,
      Updateuser.avatar,
      id,
    ]);
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res.status(201).json({ affected_row: result.affectedRows });
    });
});
