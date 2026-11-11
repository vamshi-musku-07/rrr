const express = require("express");
const Game = require("../models/Game");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 }).limit(20);
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch games", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { board, winner, moves } = req.body;

    if (!Array.isArray(board) || board.length !== 9) {
      return res.status(400).json({ message: "Board must be an array of 9 cells" });
    }

    if (!["X", "O", "draw"].includes(winner)) {
      return res.status(400).json({ message: "Winner must be X, O, or draw" });
    }

    const game = await Game.create({ board, winner, moves });
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: "Failed to save game", error: error.message });
  }
});

router.delete("/", async (_req, res) => {
  try {
    await Game.deleteMany({});
    res.json({ message: "All games cleared" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear games", error: error.message });
  }
});

module.exports = router;
