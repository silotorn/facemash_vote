import express from "express";
import mysql from "mysql";
import { VoteRequest } from "../model/VoteRequest";
import { json } from "body-parser";
import { Vote } from "../model/Vote";

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

// router.get("/", (req, res) => {
//   if (req.query.id) {
//     res.send("Get in vote.ts Query id : " + req.query.id);
//   } else {
//     conn.query("SELECT * FROM vote", (err, result, fields) => {
//       if (err) {
//         res.status(400).json(err);
//       } else {
//         res.status(200).json(result);
//       }
//     });
//   }
// });

//add vote
// router.post("/", (req, res) => {
//   const vote: VoteRequest = req.body;
//   let sql =
//     "INSERT INTO `vote`(`img_id`,`user_id`,`point`,`vote_score`,`created_at`) VALUES (?,?,?,?,?)";
//   sql = mysql.format(sql, [
//     vote.img_id,
//     vote.user_id,
//     vote.point,
//     vote.vote_score,
//     new Date(),
//   ]);
//   conn.query(sql, (err, result) => {
//     if (err) throw err;
//     res.status(200).json({ Message: "Success" });
//   });
// });

//del all img_id
// router.delete("/:id", (req, res) => {
//   let id = +req.params.id;
//   conn.query("delete from `vote` where img_id = ?", [id], (err, result) => {
//     if (err) throw err;
//     res.status(200).json({ affected_row: result.affectedRows });
//   });
// });

// point เพิ่มลดในแต่ละวัน
// router.get("/:id", (req, res) => {
//   let id = +req.params.id;
//   conn.query(
//     "SELECT `img_id`,`created_at`,SUM(CASE WHEN `vote` = 1 THEN `point` ELSE 0 END) AS point, SUM(CASE WHEN `vote` = 0 THEN `point` ELSE 0 END) AS Dpoint FROM `vote` WHERE `img_id` = ? GROUP BY `created_at`;",
//     [id],
//     (err, result) => {
//       if (err) throw err;
//       res.json(result);
//     }
//   );
// });

// Javascript program for Elo Rating

// Function to calculate the Probability
function Probability(rating1: number, rating2: number) {
  return (
    (1.0 * 1.0) / (1 + 1.0 * Math.pow(10, (1.0 * (rating1 - rating2)) / 400))
  );
}

// Function to calculate Elo rating
// K is a constant.
// d determines whether Player A wins
// or Player B.
function EloRating(Ra: number, Rb: number, K: number, d: boolean) {
  // To calculate the Winning
  // Probability of Player B
  let Pb = Probability(Ra, Rb);

  // To calculate the Winning
  // Probability of Player A
  let Pa = Probability(Rb, Ra);

  // Case 1 When Player A wins
  // Updating the Elo Ratings
  if (d === true) {
    Ra = Ra + K * (1 - Pa);
    Rb = Rb + K * (0 - Pb);
  }

  // Case 2 When Player B wins
  // Updating the Elo Ratings
  else {
    Ra = Ra + K * (0 - Pa);
    Rb = Rb + K * (1 - Pb);
  }

  console.log("Updated Ratings: ");
  console.log(
    "Ra = " +
      Math.round(Ra * 1000000.0) / 1000000.0 +
      " Rb = " +
      Math.round(Rb * 1000000.0) / 1000000.0
  );
  return {
    'raNew': Math.round(Ra * 1000000.0) / 1000000.0,
    'rbNew': Math.round(Rb * 1000000.0) / 1000000.0,
  };
}

// Ra and Rb are current ELO ratings
// const Ra = 1200;
// const Rb = 1000;

// const K = 30;
// const d = true;

// EloRating(Ra, Rb, K, d);

// This code is contributed by Vishal Vilas Shinde.

//add vote
router.post("/add", (req, res) => {
  const vote: Vote = req.body;
  console.log(vote);
  const Ra = vote.point1;
  const Rb = vote.point2;

  const K = 30;
  const d = vote.Awin;

  const Elo = EloRating(Ra, Rb, K, d);
  console.log(Elo);
  const RaNew = Elo.raNew;
  const RbNew = Elo.rbNew;

  const RaChange = RaNew - Ra;
  const RbChange = RbNew - Rb;
  console.log('RaChange',RaChange);
  console.log('RbChange',RbChange);

  let sql =
    "INSERT INTO `Vote` (`vote_id`, `user_id`, `img_id`, `point`, `vote_score`, `created_at`) VALUES (NULL, ?, ?, ?, ?,CURRENT_DATE()), (NULL, ?, ?, ?, ?,CURRENT_DATE())";
  sql = mysql.format(sql, [
    vote.user_id,
    vote.img_id1,
    RaChange,
    RaNew,
    vote.user_id,
    vote.img_id2,
    RbChange,
    RbNew,
  ]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    // res.status(200).json({ Message: "Vote Success" });
  });
  let sql1 = "update `image` set `img_score`=? where `img_id`=?";
  sql1 = mysql.format(sql1, [
    RaNew,
    vote.img_id1,
  ]);
  conn.query(sql1, (err, result) => {
    if (err) throw err;
    console.log("Update1 Success");
    
    // res.status(200).json({ Message: "Success" });
  });
  let sql2 = "update `image` set `img_score`=? where `img_id`=?";
  sql2 = mysql.format(sql2, [
    RbNew,
    vote.img_id2,
  ]);
  conn.query(sql2, (err, result) => {
    if (err) throw err;
    console.log("Update2 Success");
    
    // res.status(200).json({ Message: "Success" });
  });
  res.status(200).json({ Message: "Success" ,Elo,RaChange,RbChange});
  console.log(Elo);
});

//สถิติ 7 วัน
router.get("/daily/:id", (req, res) => {
  let id = +req.params.id;
  conn.query(
    "SELECT vote_score, img_id, DATE_FORMAT(DATE(created_at), '%Y-%m-%d') AS created_at FROM Vote WHERE (img_id, vote_id) IN (SELECT img_id, MAX(vote_id) AS max_vid FROM Vote WHERE img_id = ? AND DATE(created_at) BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE() GROUP BY DATE(created_at)) ORDER BY created_at DESC",
    [id],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});