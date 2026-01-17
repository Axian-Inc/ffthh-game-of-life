import { useState } from "react";
import HomeScreen, { GameSummary } from "./HomeScreen";
import NewGameModal, { NewGamePayload } from "./NewGameModal";

const demoGames: GameSummary[] = [
  {
    id: "game-1",
    name: "Friday Family Frenzy",
    playerCount: 4,
    lastActiveLabel: "about 1 hour ago",
    status: "active",
    avatars: ["🧩", "🎯", "🦊", "🌟"]
  },
  {
    id: "game-2",
    name: "Sunday Story Quest",
    playerCount: 2,
    lastActiveLabel: "yesterday",
    status: "paused",
    avatars: ["📚", "🧁"]
  },
  {
    id: "game-3",
    name: "Weeknight Speed Run",
    playerCount: 3,
    lastActiveLabel: "2 days ago",
    status: "archived",
    avatars: ["⚡", "🎲", "🎧"]
  }
];

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartGame = (payload: NewGamePayload) => {
    console.info("Start game", payload);
    setIsModalOpen(false);
  };

  return (
    <>
      <HomeScreen
        games={demoGames}
        onNewGame={() => setIsModalOpen(true)}
        onResume={() => {}}
        onDelete={() => {}}
      />
      <NewGameModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartGame={handleStartGame}
      />
    </>
  );
}
