import express, { Request, Response } from "express";
import { spawn } from "child_process";
import { readFile, unlink } from "fs/promises";
import cors from "cors";
import path from "path";

const app = express();
app.use(cors());

const logPath = path.join(path.resolve(), "test.log");

app.get("/auth/checkserverhealth", async (req: Request, res: Response) => {
  console.log("Request received, running server health test...");

  try {
    const testProcess = spawn("npm", [
      "test",
      "--",
      "--testNamePattern",
      "Checking server running health status",
    ]);

    testProcess.stdout.on("data", (data: Buffer) => {
      console.log(`Test Output: ${data}`);
    });

    testProcess.stderr.on("data", (data: Buffer) => {
      console.error(`Test Error: ${data}`);
    });

    testProcess.on("close", async (code: number) => {
      console.log(`Test process exited with code ${code}`);

      try {
        const rawData = await readFile(logPath, "utf-8");
        // await unlink(logPath);

        const data = rawData
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => {
            try {
              return JSON.parse(line);
            } catch (error) {
              console.error("Failed to parse log line:", line, error);
              return null;
            }
          })
          .filter((entry) => entry !== null);

        res.json(data);
      } catch (err) {
        console.error("Failed to read or delete log file", err);
        res.status(500).json({ error: "Failed to process log data" });
      }
    });

    testProcess.on("error", (err: any) => {
      console.error("Test process failed to start", err);
      res.status(500).json({ error: "Test process failed to start" });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Unexpected error occurred" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
