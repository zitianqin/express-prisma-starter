import express from "express";
import itemRoutes from "./routes/itemRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import morgan from "morgan";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import fs from "fs";
import path from "path";

const app = express();

// Use middleware that allows us to access the JSON body of requests
app.use(express.json());

// Use middleware that allows for access from other domains
app.use(cors());

// For logging errors (print to terminal)
app.use(morgan("dev"));

// For producing the docs that define the API
const swaggerFile = fs.readFileSync(
  path.join(process.cwd(), "swagger.yaml"),
  "utf8"
);
app.get("/", (req, res) => res.redirect("/docs"));
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(YAML.parse(swaggerFile), {
    swaggerOptions: { docExpansion: "list" },
  })
);

// Routes
app.use("/api/items", itemRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  const error = `
    404 Not found - This could be because:
      1. The route ${req.method} ${req.path} is not implemented
      2. There is a typo in your request path
      3. You are missing a leading slash (/)
  `;
  res.status(404).json({ error });
});

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
