import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false };
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting;
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

interface Paste {
  author: string;
  title: string;
  paste: string;
}

interface Comment {
  comment: string;
}

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()); //add CORS support to each following route handler

const client = new Client(dbConfig);
client.connect();

app.get("/pastes", async (req, res) => {
  try {
    const dbres = await client.query(
      "select * from pastes order by time_stamp desc limit 10"
    );
    res.json(dbres.rows);
  } catch (err) {
    console.error(err);
  }
});

app.post<{}, {}, Paste>("/pastes", async (req, res) => {
  try {
    const { author, title, paste } = req.body;
    const newPaste = await client.query(
      "INSERT INTO pastes (author, title, paste) VALUES ($1, $2, $3) RETURNING *",
      [author, title, paste]
    );
    res.json(newPaste.rows[0]);
  } catch (err) {
    console.error(err);
  }
});

// GET pastes/:pasteId/comments
app.get<{ paste_id: number }>(
  "/pastes/:paste_id/comments",
  async (req, res) => {
    try {
      const { paste_id } = req.params;
      const comments = await client.query(
        "SELECT * FROM comments WHERE paste_id = $1",
        [paste_id]
      );
      res.json(comments.rows);
    } catch (err) {
      console.error(err);
    }
  }
);


// DELETE pastes/:paste_id
app.delete<{ paste_id: number }>(
  "/pastes/:paste_id",
  async (req, res) => {
    try {
      const { paste_id } = req.params;
      await client.query(
        "DELETE FROM comments WHERE paste_id = $1",
        [paste_id]
      );
      const deletedItem = await client.query(
        "DELETE FROM pastes WHERE paste_id = $1 RETURNING *",
        [paste_id]
      );
      res.json(deletedItem.rows[0]);
    } catch (err) {
      console.error(err);
    }
  }
);


// DELETE pastes/:paste_id/comments/:comment_id
app.delete<{ paste_id: number, comment_id: number }>(
  "/pastes/:paste_id/comments/:comment_id",
  async (req, res) => {
    try {
      const { paste_id, comment_id } = req.params;
      const deletedComment = await client.query(
        "DELETE FROM comments WHERE comment_id = $1 RETURNING *",
        [comment_id]
      );
      res.json(deletedComment.rows[0]);
    } catch (err) {
      console.error(err);
    }
  }
);


// POST 'pastes/:pasteId/comments'
app.post<{ paste_id: number }, {}, Comment>(
  "/pastes/:paste_id/comments",
  async (req, res) => {
    try {
      const { paste_id } = req.params;
      const { comment } = req.body;
      const newComment = await client.query(
        "INSERT INTO comments (paste_id, comment) VALUES ($1, $2) RETURNING *",
        [paste_id, comment]
      );
      res.json(newComment.rows[0]);
    } catch (err) {
      console.error(err);
    }
  }
);

//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw "Missing PORT environment variable.  Set it in .env file.";
}

app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
