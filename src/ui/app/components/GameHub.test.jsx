import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DeleteGameModal,
  GamesSection,
  HubHeader,
  NewGameModal
} from "./GameHub.jsx";

describe("HubHeader", () => {
  it("calls the new game handler", async () => {
    const user = userEvent.setup();
    const onNewGame = vi.fn();

    render(<HubHeader onNewGame={onNewGame} />);

    await user.click(screen.getByRole("button", { name: /new game/i }));

    expect(onNewGame).toHaveBeenCalledTimes(1);
  });
});

describe("GamesSection", () => {
  it("renders cards and triggers resume/delete", async () => {
    const user = userEvent.setup();
    const onResume = vi.fn();
    const onDelete = vi.fn();
    const games = [
      {
        id: 1,
        name: "Test Arena",
        players: 2,
        lastActive: "just now",
        status: "active",
        avatars: ["🧑‍🚀"]
      }
    ];

    render(
      <GamesSection games={games} onResume={onResume} onDelete={onDelete} />
    );

    expect(screen.getByText("Your Games")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /resume/i }));
    await user.click(screen.getByRole("button", { name: /delete test arena/i }));

    expect(onResume).toHaveBeenCalledWith(games[0]);
    expect(onDelete).toHaveBeenCalledWith(games[0]);
  });
});

describe("NewGameModal", () => {
  it("is hidden when closed", () => {
    render(
      <NewGameModal
        open={false}
        onClose={() => {}}
        onStart={() => {}}
        gameName="Family Game Night"
        onGameNameChange={() => {}}
        players={[]}
        onAddPlayer={() => {}}
        canAddPlayer={false}
        canStartGame={false}
        onShuffleAvatar={() => {}}
        onUpdatePlayer={() => {}}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls start and shows helper text", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();

    render(
      <NewGameModal
        open
        onClose={() => {}}
        onStart={onStart}
        gameName="Family Game Night"
        onGameNameChange={() => {}}
        players={[]}
        onAddPlayer={() => {}}
        canAddPlayer={false}
        canStartGame={false}
        onShuffleAvatar={() => {}}
        onUpdatePlayer={() => {}}
      />
    );

    expect(
      screen.getByText(/add at least one player to start/i)
    ).toBeInTheDocument();

    const startButton = screen.getByRole("button", {
      name: /start game with 0 players/i
    });
    expect(startButton).toBeDisabled();

    await user.click(startButton);

    expect(onStart).not.toHaveBeenCalled();
  });
});

describe("DeleteGameModal", () => {
  it("confirms delete", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <DeleteGameModal
        game={{ id: 3, name: "Sunset Run" }}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
