import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "./api";

type Player = "X" | "O";
type Cell = Player | null;
type Winner = Player | "draw" | null;

type GameRecord = {
  _id: string;
  winner: Player | "draw";
  moves: number;
  createdAt: string;
};

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

function getWinner(board: Cell[]): Winner {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(Boolean)) return "draw";
  return null;
}

function statusText(winner: Winner, turn: Player) {
  if (winner === "draw") return "It's a draw";
  if (winner) return `${winner} wins`;
  return `${turn}'s turn`;
}

export default function App() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>("X");
  const [winner, setWinner] = useState<Winner>(null);
  const [history, setHistory] = useState<GameRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/games"));
      if (!res.ok) throw new Error("Could not load history");
      const data = (await res.json()) as GameRecord[];
      setHistory(data);
      setError(null);
    } catch {
      setError("Backend offline — games won't be saved until MongoDB/API is up.");
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const saveGame = async (finalBoard: Cell[], result: Player | "draw") => {
    setSaving(true);
    try {
      const moves = finalBoard.filter(Boolean).length;
      const res = await fetch(apiUrl("/api/games"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          board: finalBoard.map((c) => c ?? ""),
          winner: result,
          moves,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      await loadHistory();
      setError(null);
    } catch {
      setError("Could not save game to the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const next = [...board];
    next[index] = turn;
    const result = getWinner(next);
    setBoard(next);

    if (result) {
      setWinner(result);
      void saveGame(next, result);
      return;
    }

    setTurn(turn === "X" ? "O" : "X");
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setWinner(null);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-10 sm:px-8 lg:flex-row lg:items-start lg:justify-center lg:gap-16 lg:py-16">
      <main className="flex w-full max-w-md flex-col items-center gap-6">
        <header className="w-full text-center">
          <p className="font-display text-sm tracking-[0.2em] text-accent uppercase">
            Local multiplayer
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Tic Tac Toe
          </h1>
          <p className="mt-3 text-muted">Take turns as X and O on one device.</p>
        </header>

        <div
          className={`font-display text-xl font-semibold transition-colors ${
            winner === "X"
              ? "text-x"
              : winner === "O"
                ? "text-o"
                : winner === "draw"
                  ? "text-muted"
                  : "text-white"
          }`}
        >
          {statusText(winner, turn)}
          {saving ? <span className="ml-2 text-sm text-muted">Saving…</span> : null}
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-board/80 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
          {board.map((cell, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              disabled={Boolean(cell) || Boolean(winner)}
              className={`font-display flex h-24 w-24 items-center justify-center rounded-xl text-4xl font-bold transition enabled:hover:bg-white/10 enabled:active:scale-95 disabled:cursor-default sm:h-28 sm:w-28 sm:text-5xl ${
                cell === "X" ? "text-x" : cell === "O" ? "text-o" : "text-white/20"
              } bg-ink/40`}
              aria-label={`Cell ${index + 1}${cell ? `, ${cell}` : ""}`}
            >
              {cell ?? ""}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={reset}
          className="font-display rounded-xl bg-accent px-8 py-3 text-base font-bold text-ink transition hover:brightness-110 active:scale-[0.98]"
        >
          New game
        </button>

        {error ? (
          <p className="max-w-sm text-center text-sm text-amber-300/90">{error}</p>
        ) : null}
      </main>

      <aside className="w-full max-w-md rounded-2xl bg-panel/70 p-5 ring-1 ring-white/10 backdrop-blur-sm lg:mt-16">
        <h2 className="font-display text-lg font-semibold">Recent games</h2>
        <p className="mt-1 text-sm text-muted">Saved to MongoDB via the Express API.</p>

        {history.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No games yet — finish a round to see it here.</p>
        ) : (
          <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
            {history.map((game) => (
              <li
                key={game._id}
                className="flex items-center justify-between rounded-lg bg-ink/40 px-3 py-2.5 text-sm"
              >
                <span
                  className={
                    game.winner === "X"
                      ? "text-x font-semibold"
                      : game.winner === "O"
                        ? "text-o font-semibold"
                        : "text-muted font-semibold"
                  }
                >
                  {game.winner === "draw" ? "Draw" : `${game.winner} won`}
                </span>
                <span className="text-muted">
                  {game.moves} moves ·{" "}
                  {new Date(game.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
