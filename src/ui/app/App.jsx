import { useState } from "react";
import {
  DeleteGameModal,
  GamesSection,
  HubHeader,
  NewGameModal
} from "./components/GameHub.jsx";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameName, setGameName] = useState("Family Game Night");
  const avatarOptions = ["🧑‍🚀", "🧙‍♀️", "🧑‍🎮", "🧑‍🌾", "🧑‍🎨", "🧑‍🔬"];
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([
    {
      id: 1,
      name: "Sunday Sandbox",
      players: 4,
      lastActive: "about 1 hour ago",
      status: "active",
      avatars: ["🧑‍🚀", "🧙‍♀️", "🧑‍🎨", "🧑‍🔬"]
    },
    {
      id: 2,
      name: "Pixel Garden",
      players: 3,
      lastActive: "yesterday",
      status: "paused",
      avatars: ["🧑‍🌾", "🧑‍🍳", "🧑‍🚒"]
    },
    {
      id: 3,
      name: "Family Freeplay",
      players: 5,
      lastActive: "2 days ago",
      status: "active",
      avatars: ["🧑‍🏫", "🧑‍✈️", "🧑‍🔧", "🧑‍🚀", "🧑‍🎮"]
    }
  ]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const handleResume = (game) => {
    console.info("Resume game:", game);
  };

  const isGameNameValid = gameName.trim().length > 0;
  const lastPlayer = players[players.length - 1];
  const canAddPlayer =
    !lastPlayer ||
    (lastPlayer.nickname.trim().length > 0 &&
      lastPlayer.email.trim().length > 0);
  const canStartGame = players.length > 0 && isGameNameValid;

  const shuffleAvatar = (playerId) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        if (player.id !== playerId) {
          return player;
        }
        const nextIndex = Math.floor(Math.random() * avatarOptions.length);
        return { ...player, avatar: avatarOptions[nextIndex] };
      })
    );
  };

  const updatePlayer = (playerId, field, value) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === playerId ? { ...player, [field]: value } : player
      )
    );
  };

  const addPlayer = () => {
    setPlayers((prevPlayers) => [
      ...prevPlayers,
      {
        id: prevPlayers.length
          ? Math.max(...prevPlayers.map((player) => player.id)) + 1
          : 1,
        avatar:
          avatarOptions[Math.floor(Math.random() * avatarOptions.length)],
        nickname: "",
        email: ""
      }
    ]);
  };

  const confirmDelete = () => {
    if (!pendingDelete) {
      return;
    }
    setGames((prevGames) =>
      prevGames.filter((game) => game.id !== pendingDelete.id)
    );
    setPendingDelete(null);
  };

  const handleStartGame = () => {
    if (!isGameNameValid || !canStartGame) {
      return;
    }
    const newGame = {
      id: Date.now(),
      name: gameName.trim(),
      players: players.length,
      lastActive: "just now",
      status: "active",
      avatars: players.map((player) => player.avatar)
    };
    setGames((prevGames) => [newGame, ...prevGames]);
    setIsModalOpen(false);
    setGameName("Family Game Night");
    setPlayers([]);
  };

  return (
    <main className="page">
      <HubHeader onNewGame={() => setIsModalOpen(true)} />
      <GamesSection
        games={games}
        onResume={handleResume}
        onDelete={setPendingDelete}
      />
      <NewGameModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStart={handleStartGame}
        gameName={gameName}
        onGameNameChange={(event) => setGameName(event.target.value)}
        players={players}
        onAddPlayer={addPlayer}
        canAddPlayer={canAddPlayer}
        canStartGame={canStartGame}
        onShuffleAvatar={shuffleAvatar}
        onUpdatePlayer={updatePlayer}
      />
      <DeleteGameModal
        game={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </main>
  );
}
