import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomeScreen, { GameSummary } from "../HomeScreen";

const sampleGames: GameSummary[] = [
  {
    id: "game-1",
    name: "Kitchen Clash",
    playerCount: 3,
    lastActiveLabel: "about 1 hour ago",
    status: "active",
    avatars: ["🥕", "🍓", "🥐"]
  },
  {
    id: "game-2",
    name: "Puzzle Parade",
    playerCount: 1,
    lastActiveLabel: "yesterday",
    status: "paused",
    avatars: ["🧩"]
  }
];

const renderHome = (games = sampleGames) => {
  const onNewGame = vi.fn();
  const onResume = vi.fn();
  const onDelete = vi.fn();

  render(
    <HomeScreen
      games={games}
      onNewGame={onNewGame}
      onResume={onResume}
      onDelete={onDelete}
    />
  );

  return { onNewGame, onResume, onDelete };
};

describe("HomeScreen", () => {
  it("renders the Game Hub heading and supporting text", () => {
    renderHome();

    expect(
      screen.getByRole("heading", { name: /game hub/i })
    ).toBeVisible();
    expect(
      screen.getByText(/family fun starts here/i)
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /new game/i })
    ).toBeVisible();
    expect(screen.getByText(/your games/i)).toBeVisible();
  });

  it("fires navigation when New Game is clicked", async () => {
    const user = userEvent.setup();
    const { onNewGame } = renderHome();

    const newGameButton = screen.getByRole("button", { name: /new game/i });
    expect(newGameButton).toBeEnabled();
    await user.click(newGameButton);

    expect(onNewGame).toHaveBeenCalledTimes(1);
  });

  it("shows the games count badge", () => {
    renderHome();

    expect(screen.getByText("2")).toBeVisible();
  });

  it("shows zero for empty games", () => {
    renderHome([]);

    expect(screen.getByText("0")).toBeVisible();
  });

  it("renders one card per game", () => {
    renderHome();

    const cards = screen.getAllByTestId("game-card");
    expect(cards).toHaveLength(sampleGames.length);
    expect(screen.getByText("Kitchen Clash")).toBeVisible();
  });

  it("shows player count with singular and plural labels", () => {
    renderHome();

    expect(screen.getByText(/3 players/i)).toBeVisible();
    expect(screen.getByText(/1 player/i)).toBeVisible();
  });

  it("shows last active labels with time icons", () => {
    renderHome();

    expect(screen.getByText(/about 1 hour ago/i)).toBeVisible();
    expect(screen.getByText(/yesterday/i)).toBeVisible();
    expect(screen.getAllByTestId("last-active-icon")).toHaveLength(
      sampleGames.length
    );
  });

  it("shows active status only for active games", () => {
    renderHome();

    const [firstCard, secondCard] = screen.getAllByTestId("game-card");
    expect(within(firstCard).getByText(/active/i)).toBeVisible();
    expect(within(secondCard).queryByText(/active/i)).toBeNull();
  });

  it("renders avatars for each game", () => {
    renderHome();

    const cards = screen.getAllByTestId("game-card");
    expect(within(cards[0]).getAllByTestId("player-avatar")).toHaveLength(3);
    expect(within(cards[1]).getAllByTestId("player-avatar")).toHaveLength(1);
  });

  it("resumes a game from the card", async () => {
    const user = userEvent.setup();
    const { onResume } = renderHome();

    const resumeButton = screen.getAllByRole("button", { name: /resume/i })[0];
    await user.click(resumeButton);

    expect(onResume).toHaveBeenCalledTimes(1);
    expect(onResume).toHaveBeenCalledWith("game-1");
  });

  it("deletes a game from the card", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderHome();

    const deleteButton = screen.getAllByRole("button", { name: /delete/i })[0];
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("game-1");
  });

  it("does not trigger resume when clicking the card container", async () => {
    const user = userEvent.setup();
    const { onResume } = renderHome();

    const card = screen.getAllByTestId("game-card")[0];
    await user.click(card);

    expect(onResume).not.toHaveBeenCalled();
  });

  it("shows no cards when games list is empty", () => {
    renderHome([]);

    expect(screen.queryAllByTestId("game-card")).toHaveLength(0);
    expect(
      screen.getByRole("button", { name: /new game/i })
    ).toBeEnabled();
  });
});
