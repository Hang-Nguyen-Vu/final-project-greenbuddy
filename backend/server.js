// Import necessary libraries and modules
import express from "express"; // Import the Express.js framework
import cors from "cors"; // Import the CORS middleware
import dotenv from "dotenv"; // Import dotenv for environment variables
dotenv.config(); // Load environment variables from the .env file
import userRoutes from "./routes/userRoutes"; // Import custom user routes
import adRoutes from "./routes/adRoutes"; // Import custom ad routes
import { connectDB } from "./config/db"; // Import database connection function (not used here)
import listEndpoints from 'express-list-endpoints';

// Defines the port the app will run on. Defaults to 8080, but can be overridden
const port = process.env.PORT; // Set the port number for the server
const app = express(); // Create an instance of the Express application

// Add middlewares to enable cors and json body parsing
app.use(cors()); // Enable CORS (Cross-Origin Resource Sharing)
app.use(express.json()); // Parse incoming JSON data
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded data

// Use the routes for handling API requests
// ROUTES - These routes USE controller functions ;)
app.use(userRoutes); // Use the user-controlled routes for user-related requests
app.use(adRoutes); // Use the ad-controlled routes for ad-related requests

app.get("/", (req, res) => {
  res.json(listEndpoints(app));
});

connectDB();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`); 
});
