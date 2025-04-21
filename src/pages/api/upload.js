import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../../utils/db"; // Adjust the path as needed

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = new IncomingForm(); // Use IncomingForm directly if using v2.x or v3.x
  form.uploadDir = path.join(process.cwd(), "data", "uploads");
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form data:", err);
      return res.status(500).json({ error: "Error parsing form data" });
    }

    console.log("Fields:", fields);
    console.log("Files:", files);

    const file = files.video ? files.video[0] : null;
    if (!file) {
      return res
        .status(400)
        .json({ error: "No video file uploaded or incorrect field name" });
    }

    const videoId = uuidv4().replace(/-/g, "");
    const videoPath = path.join(form.uploadDir, videoId, "video.mp4");

    fs.mkdirSync(path.dirname(videoPath), { recursive: true });

    try {
      fs.renameSync(file.filepath, videoPath);
    } catch (fsError) {
      console.error("Error moving file:", fsError);
      return res.status(500).json({ error: "Error moving file" });
    }

    try {
      await insertVideoInfo(videoId, videoPath);
      res.status(200).json({ videoId, videoPath });
    } catch (dbError) {
      console.error("Error processing video:", dbError);
      res.status(500).json({ error: "Error processing video" });
    }
  });
}

async function insertVideoInfo(videoId, videoPath) {
  const collectionId = 1;
  const title = "Sample Video Title";
  const description = "Sample Description";
  const playlistUrl = `/data/uploads/${videoId}/video.mp4`;

  const queryText = `
    INSERT INTO videos (collection_id, title, description, video_id, playlist_url, status)
    VALUES (?, ?, ?, ?, ?, 'uploaded')
  `;

  await db(queryText, [collectionId, title, description, videoId, playlistUrl]);

  const processedQuery = `
    INSERT INTO processed_videos (video_id, resolution, processed_video_path)
    VALUES (?, '720p', ?)
  `;

  await db(processedQuery, [videoId, videoPath]);
}
