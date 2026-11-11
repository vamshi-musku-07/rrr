const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    board: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => v.length === 9,
        message: "Board must have exactly 9 cells",
      },
    },
    winner: {
      type: String,
      enum: ["X", "O", "draw"],
      required: true,
    },
    moves: {
      type: Number,
      required: true,
      min: 5,
      max: 9,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", gameSchema);
