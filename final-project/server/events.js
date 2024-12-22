import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import db from "./db.js";
import multer from "multer";
import path from "path";

const router = express.Router();
router.use(bodyParser.json());

// const getLoggedInUser = async (req) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     return res.status(401).send("Unauthorized: No token provided");
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.userId;

//     const user = await db.User.findById(userId);
//     return user;
//   } catch (error) {
//     console.error("Error verifying token:", error);
//     return res.status(401).send("Unauthorized: Invalid token");
//   }
// };
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/posters");
  },
  filename: (req, file, cb) => {
    cb(null, `Poster_${Date.now()}${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.post("/create-event", upload.single("Poster"), async (req, res) => {
  const {
    EventName,
    Genre,
    Description,
    Latitude,
    Longitude,
    DateTime,
    TicketPrice,
    MaxAttendees,
  } = req.body;
  const posterPath = req.file;

  // Form Validation
  if (
    !EventName ||
    !Genre ||
    !Latitude ||
    !Longitude ||
    !DateTime ||
    !TicketPrice ||
    !MaxAttendees
  ) {
    return res.status(400).send("Missing required fields");
  }

  try {
    // Retrieve the currently logged-in user
    // const loggedInUser = await getLoggedInUser(req);
    // if (!loggedInUser) {
    //   return res.status(401).send("Unauthorized");
    // }

    // Create a new event

    const newEvent = new db.Event({
      EventId: new mongoose.Types.ObjectId(),
      MusicianId: "loggedInUser._id", // Associate the event with the logged-in musician
      EventName,
      Genre,
      Description,
      Latitude,
      Longitude,
      DateTime,
      TicketPrice,
      MaxAttendees,
      Poster: posterPath ? `/uploads/posters${posterPath.filename}` : null,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).send("Duplicate Event Id");
    } else {
      res.status(500).send("Error creating event");
    }
  }
});

export default router;