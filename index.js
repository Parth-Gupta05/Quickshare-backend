import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import { deleteFromCloudinary } from "./utils/cloudinary.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
const corsoptions = {
  origin: process.env.CLIENT_URI,
  credentials: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-type", "Authorization"],
};

import express from "express";
import { Server } from "socket.io";
import http from "http";

import { File } from "./models/files.model.js";
import { Room } from "./models/room.model.js";

// console.log(process.env.MONGODB_CONNECTION_STRING)
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors(corsoptions));
app.use(cookieParser());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_URI);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//MongoDB connection
import { databaseConnect } from "./mongoDB/database.js";

import router from "./routes/fileuploadroutes.js";
import roomrouter from "./routes/roomroutes.js";
import userrouter from "./routes/userroutes.js";
app.use("/file-upload", router);
app.use("/rooms", roomrouter);
app.use("/user", userrouter);

app.get("/auth/check", async (req, res) => {
  const token = req.cookies.token;
  //   console.log(token)

  if (!token) return res.json({ loggedin: false });
  try {
    const verified = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log(verified)
    return res.json({ loggedin: true, user: verified });
  } catch (error) {
    return res.json({ loggedin: false, error });
  }
});

app.get("/cleanup", async (req, res) => {
  try {
    const now = new Date();
    const THIRTY_MINUTES = 30 * 60 * 1000;
    const nowforrooms = Date.now();

    // 1) find expired rooms first so we can grab their file IDs
    const expiredRooms = await Room.find({ activetill: { $lte: nowforrooms } }).select("files");
    const fileIdsFromExpiredRooms = expiredRooms
      .flatMap(r => (Array.isArray(r.files) ? r.files : []))
      .map(id => id.toString());

    // 2) delete the expired rooms (we already captured their file ids)
    const roomsDeleteResult = await Room.deleteMany({ activetill: { $lte: nowforrooms } });
    const deletedRoomsCount = roomsDeleteResult.deletedCount ?? 0;

    // 3) find files older than 30 minutes (you used createdAt as string)
    const files = await File.find().select("_id createdAt url"); // small projection
    const expiredByAgeIds = files
      .filter((file) => {
        if (!file.createdAt) return false;
        const createdTime = new Date(file.createdAt);
        const age = now - createdTime;
        return age > THIRTY_MINUTES;
      })
      .map(f => f._id.toString());

    // 4) union file IDs: those from expired rooms + those expired by age
    const allExpiredFileIdsSet = new Set([...fileIdsFromExpiredRooms, ...expiredByAgeIds]);
    const allExpiredFileIds = Array.from(allExpiredFileIdsSet);

    // If nothing to delete, short-circuit
    if (allExpiredFileIds.length === 0) {
      return res.json({
        message: "Cleanup completed — nothing to delete",
        deletedFilesCount: 0,
        deletedRooms: deletedRoomsCount,
        cloudDeletesSucceeded: 0,
        cloudDeletesFailed: 0,
        cleanedReferencesInRooms: 0
      });
    }

    // 5) fetch docs for the expired files (so we have URLs)
    const expiredFilesDocs = await File.find({ _id: { $in: allExpiredFileIds } }).select("_id url public_id resource_type");

    // 6) create delete promises (map → array of promises)
    const cloudinaryPromises = expiredFilesDocs.map((f) => {
      // return the promise (don't await here)
      return deleteFromCloudinary(f.resource_type,f.public_id);
    });

    // 7) run them in parallel and inspect results
    const cloudResults = await Promise.allSettled(cloudinaryPromises);

    const cloudSuccessDocIds = [];
    const cloudFailedDocs = [];

    // cloudResults order corresponds to expiredFilesDocs order
    cloudResults.forEach((r, idx) => {
      const doc = expiredFilesDocs[idx];
      if (r.status === "fulfilled") {
        // consider fulfilled as success (you may check r.value if needed)
        cloudSuccessDocIds.push(doc._id.toString());
      } else {
        // keep failed docs for logging / retry
        cloudFailedDocs.push({
          _id: doc._id.toString(),
          url: doc.url,
          reason: r.reason
        });
      }
    });

    // 8) delete DB File docs only for those successfully deleted from Cloudinary
    let deletedFilesFromDbCount = 0;
    if (cloudSuccessDocIds.length > 0) {
      const delResult = await File.deleteMany({ _id: { $in: cloudSuccessDocIds } });
      deletedFilesFromDbCount = delResult.deletedCount ?? 0;
    }

    // 9) remove references to the successfully-deleted file IDs from any remaining rooms
    let cleanedReferencesCount = 0;
    if (cloudSuccessDocIds.length > 0) {
      const updateRes = await Room.updateMany(
        { files: { $in: cloudSuccessDocIds } },
        { $pull: { files: { $in: cloudSuccessDocIds } } }
      );
      cleanedReferencesCount = updateRes.modifiedCount ?? updateRes.nModified ?? 0;
    }

    // 10) return summary
    return res.json({
      message: "Cleanup completed",
      deletedRooms: deletedRoomsCount,
      cloudDeletesSucceeded: cloudSuccessDocIds.length,
      cloudDeletesFailed: cloudFailedDocs.length,
      deletedFilesFromDb: deletedFilesFromDbCount,
      cleanedReferencesInRooms: cleanedReferencesCount,
      failedCloudDeletes: cloudFailedDocs.slice(0, 20) // include sample of failures (capped)
    });
  } catch (error) {
    console.error("Cleanup failed:", error);
    res.status(500).json({ message: "Cleanup failed", error: error.message });
  }
});
server.listen(process.env.PORT,"0.0.0.0", () => console.log("server is listening on port 8000"));

databaseConnect();
import redis from "./utils/redisclient.js";

// console.log(await redis.keys("room:*"))
