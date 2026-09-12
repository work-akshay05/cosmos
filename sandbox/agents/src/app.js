import express from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import cors from "cors";

const WORKING_DIR = "/workspace";

const app = express();
app.use(cors({ methods: ["GET", "POST", "PATCH", "DELETE"], origin: "*" }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "hello from sandbox agents",
    status: "success",
  });
});

/**
 *@route GET /list-files
 *@description List all files in the working directory and its subdirectores. Returns a JSON Object with the file path relative to the working directory. exclude directories like node_modules and .git ,dist etc.
 * -eg:{
 *  "files":[
  *   "file1.txt",
  *  "subdir/file2.txt",
  *  "subdir/subsubdir/file3.txt"
 *   ]
 * }
 */
app.get("/list-files", async (req, res) => {
  const listFiles = async (dir, relativePath = "") => {
    const files = await fs.promises.readdir(dir, {
      withFileTypes: true,
    });

    const fileList = [];

    for (const file of files) {
      const filePath = path.join(dir, file.name);
      const relativeFilePath = path.join(relativePath, file.name);

      if (file.isDirectory()) {
        if (!["node_modules", ".git", "dist"].includes(file.name)) {
          const subDirFiles = await listFiles(filePath, relativeFilePath);

          fileList.push(...subDirFiles);
        }
      } else {
        fileList.push(relativeFilePath);
      }
    }

    return fileList;
  };

  try {
    const files = await listFiles(WORKING_DIR);

    return res.status(200).json({
      files,
      status: "success",
    });
  } catch (err) {
    return res.status(500).json({
      message: "error listing files",
      error: err.message,
      status: "error",
    });
  }
});

/**
 * @routes GET/read-files
 * @description reads the content of all files requested in the query parameters files and return the content as a JSON object
 * 
 * eg  /read-files?files=file1.txt,/src/file2.txt
 */
app.get("/read-files", async (req, res) => {
  const files = req.query.files;
  if (!files) {
    return res.status(400).json({
      message: "no files specified in query paramets",
      status: "error",
    });
  }

  const fileList = files.split(",");
  const results = await Promise.all(
    fileList.map(async (file) => {
      const filePath = `${WORKING_DIR}/${file}`;
      try {
        const content = await fs.promises.readFile(filePath, "utf-8");
        return {
          [filePath]: content,
        };
      } catch (err) {
        return {
          [filePath]: `Error reading files: ${err.message}`,
        };
      }
    }),
  );

  return res.status(200).json({
    message: "files read successfully",
    results,
    status: "success",
  });
});

/**
 * @routes PATCH /update-files
 * @description updates the content of files specified in the request body. The request body should contain a property 'updates' with a JSON object, each object should have a 'file' property specifiying the file path (relative to the working directory) and a 'content property specifying the new content for the file.
 */

app.patch("/update-files", async (req, res) => {
  const updates = req.body.updates;

  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({
      message:
        'invalid request body. expected a json object with an "updates" property containing an array of file updates',
      status: "error",
    });
  }

  const results = await Promise.all(
    updates.map(async (update) => {
      const { file, content } = update;
      const filePath = path.join(WORKING_DIR, file);
      try {
        await fs.promises.writeFile(filePath, content, "utf-8");
        return {
          [filePath]: "file update successfully",
        };
      } catch (err) {
        return {
          [filePath]: `error updating file:${err.message}`,
        };
      }
    }),
  );

  return res.status(200).json({
    message: "files updated successfully",
    results,
    status: "success",
  });
});

/**
 * @routes POST /create-files
 * @description creates new files with the content specified in the request body. The request body should contain a property 'files' with a JSON object, each object should have a 'file' property specifiying the file path (relative to the working directory) and a 'content property specifying the content for the new file.
 */

app.post("/create-files", async (req, res) => {
  const files = req.body.files;

  if (!files || !Array.isArray(files)) {
    return res.status(400).json({
      message:
        'invalid request body. expected a json object with a "files" property containing an array of file paths',
      status: "error",
    });
  }

  const result = await Promise.all(
    files.map(async (fileObj) => {
      const { file, content } = fileObj;
      const filePath = path.join(WORKING_DIR, file);
      try {
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fs.promises.writeFile(filePath, content, "utf-8");
        return {
          [filePath]: "file created successfully",
        };
      } catch (err) {
        return {
          [filePath]: `error creating file:${err.message}`,
        };
      }
    }),
  );

  return res.status(200).json({
    message: "files created successfully",
    result: result,
    status: "success",
  });
});

export default app;
