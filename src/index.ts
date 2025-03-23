import express from "express";
import { AppDataSource, initializeDatabase } from "./data-source";
import { User } from "./entities/User";

const app = express();
app.use(express.json());

// Initialize database
initializeDatabase();

// Get all users
app.get("/users", async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Create a user
app.post("/users", async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = userRepository.create({
      name: req.body.name,
      email: req.body.email,
    });
    await userRepository.save(user);
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to create user" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});