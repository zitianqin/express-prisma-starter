import app from "./app";
import config from "./config/config";

// Start the server
const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

// Handle SIGINT (Ctrl+C) for graceful shutdown
process.on("SIGINT", () => {
  server.close(() => console.log("Shutting down server gracefully."));
});
