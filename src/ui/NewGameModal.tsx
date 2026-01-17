import { useEffect, useMemo, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import ShuffleIcon from "@mui/icons-material/Shuffle";

export interface NewPlayer {
  nickname: string;
  email: string;
  avatar: string;
}

export interface NewGamePayload {
  gameName: string;
  players: NewPlayer[];
}

interface NewGameModalProps {
  open: boolean;
  onClose: () => void;
  onStartGame: (payload: NewGamePayload) => void;
}

const avatarOptions = ["🦊", "🐯", "🧁", "🎧", "🌿", "🪐", "🐙", "🧩"];

const playerCountLabel = (count: number) =>
  count === 1 ? "1 Player" : `${count} Players`;

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export default function NewGameModal({
  open,
  onClose,
  onStartGame
}: NewGameModalProps) {
  const [gameName, setGameName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [players, setPlayers] = useState<NewPlayer[]>([]);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const gameNameRef = useRef<HTMLInputElement | null>(null);

  const currentAvatar = useMemo(
    () => avatarOptions[avatarIndex % avatarOptions.length],
    [avatarIndex]
  );

  useEffect(() => {
    if (open && gameNameRef.current) {
      gameNameRef.current.focus();
    }
  }, [open]);

  const resetErrors = () => {
    setNicknameError(null);
    setEmailError(null);
  };

  const handleShuffle = () => {
    setAvatarIndex((prev) => (prev + 1) % avatarOptions.length);
  };

  const handleAddPlayer = () => {
    const trimmedNickname = nickname.trim();
    const trimmedEmail = email.trim();

    resetErrors();

    if (!trimmedNickname) {
      setNicknameError("Nickname is required");
    }

    if (!trimmedEmail) {
      setEmailError("Email is required");
    } else if (!isValidEmail(trimmedEmail)) {
      setEmailError("Enter a valid email");
    }

    if (!trimmedNickname || !trimmedEmail || !isValidEmail(trimmedEmail)) {
      return;
    }

    setPlayers((prev) => [
      ...prev,
      { nickname: trimmedNickname, email: trimmedEmail, avatar: currentAvatar }
    ]);
    setNickname("");
    setEmail("");
    setAvatarIndex(0);
  };

  const handleStartGame = () => {
    if (players.length === 0) {
      return;
    }

    onStartGame({ gameName, players });
  };

  if (!open) {
    return null;
  }

  return (
    <div className="backdrop">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-game-title"
      >
        <div className="modal-header">
          <div className="modal-title-stack">
            <div className="modal-icon" aria-hidden="true">
              ✨
            </div>
            <div>
              <h2 className="modal-title" id="new-game-title">
                New Game
              </h2>
              <p className="modal-subtitle">Let's get the fun started!</p>
            </div>
          </div>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body stack">
          <div className="stack">
            <label className="field-label" htmlFor="game-name">
              Game Name
            </label>
            <input
              id="game-name"
              ref={gameNameRef}
              className="input"
              value={gameName}
              onChange={(event) => setGameName(event.target.value)}
              placeholder="Friday Family Frenzy"
            />
          </div>

          <div className="stack">
            <div className="players-header">
              <span className="section-title">Players ({players.length})</span>
              <span className="helper">Click to shuffle avatar</span>
            </div>

            <div className="panel-dashed stack">
              <button
                type="button"
                className="avatar-shuffle"
                data-testid="avatar-shuffle"
                onClick={handleShuffle}
              >
                <span className="avatar" aria-hidden="true">
                  {currentAvatar}
                </span>
                <ShuffleIcon fontSize="small" aria-hidden="true" />
                <span className="helper">Click to shuffle avatar</span>
              </button>

              <div className="field-row">
                <div className="field">
                  <input
                    className="input"
                    placeholder="Nickname"
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                  />
                  {nicknameError ? (
                    <span className="field-error">{nicknameError}</span>
                  ) : null}
                </div>
                <div className="field">
                  <input
                    className="input"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  {emailError ? (
                    <span className="field-error">{emailError}</span>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddPlayer}
              >
                Add Player
              </button>

              <div className="stack" data-testid="player-list">
                {players.map((player) => (
                  <span key={`${player.nickname}-${player.email}`}>
                    {player.nickname} · {player.email}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-primary btn-full"
            onClick={handleStartGame}
            disabled={players.length === 0}
          >
            Start Game with {playerCountLabel(players.length)}
          </button>
          {players.length === 0 ? (
            <div className="footer-help">Add at least one player to start</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
