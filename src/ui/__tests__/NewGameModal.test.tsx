import { useState } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import NewGameModal, { NewGamePayload } from "../NewGameModal";

const renderModal = () => {
  const onClose = vi.fn();
  const onStartGame = vi.fn();

  render(<NewGameModal open onClose={onClose} onStartGame={onStartGame} />);

  return { onClose, onStartGame };
};

describe("NewGameModal", () => {
  it("opens the modal from the Game Hub", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /new game/i }));

    const dialog = screen.getByRole("dialog", { name: /new game/i });
    expect(dialog).toBeVisible();
    expect(
      within(dialog).getByText(/let's get the fun started!/i)
    ).toBeVisible();
  });

  it("closes the modal via the close button", async () => {
    const user = userEvent.setup();

    function Wrapper() {
      const [open, setOpen] = useState(true);
      return (
        <NewGameModal
          open={open}
          onClose={() => setOpen(false)}
          onStartGame={vi.fn()}
        />
      );
    }

    render(<Wrapper />);

    await user.click(screen.getByRole("button", { name: /close/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("has an accessible dialog name", () => {
    renderModal();

    expect(
      screen.getByRole("dialog", { name: /new game/i })
    ).toBeVisible();
  });

  it("moves focus to the game name input on open", () => {
    renderModal();

    const gameNameInput = screen.getByLabelText(/game name/i);
    expect(gameNameInput).toHaveFocus();
  });

  it("updates the game name input", async () => {
    const user = userEvent.setup();
    renderModal();

    const gameNameInput = screen.getByLabelText(/game name/i);
    await user.type(gameNameInput, "Weekend Quest");

    expect(gameNameInput).toHaveValue("Weekend Quest");
  });

  it("keeps the game name after adding a player", async () => {
    const user = userEvent.setup();
    renderModal();

    const gameNameInput = screen.getByLabelText(/game name/i);
    await user.type(gameNameInput, "Family Night");

    await user.type(screen.getByPlaceholderText(/nickname/i), "Maya");
    await user.type(screen.getByPlaceholderText(/email/i), "maya@example.com");
    await user.click(screen.getByRole("button", { name: /add player/i }));

    expect(gameNameInput).toHaveValue("Family Night");
  });

  it("shows the players count and updates when players are added", async () => {
    const user = userEvent.setup();
    renderModal();

    expect(screen.getByText(/players \(0\)/i)).toBeVisible();

    await user.type(screen.getByPlaceholderText(/nickname/i), "Sage");
    await user.type(screen.getByPlaceholderText(/email/i), "sage@example.com");
    await user.click(screen.getByRole("button", { name: /add player/i }));

    expect(screen.getByText(/players \(1\)/i)).toBeVisible();
  });

  it("shuffles the avatar without submitting", async () => {
    const user = userEvent.setup();
    const { onStartGame } = renderModal();

    const shuffleButton = screen.getByTestId("avatar-shuffle");
    const initialAvatar = shuffleButton.textContent;

    expect(screen.getAllByText(/click to shuffle avatar/i).length).toBeGreaterThan(0);

    await user.click(shuffleButton);

    expect(shuffleButton.textContent).not.toEqual(initialAvatar);
    expect(onStartGame).not.toHaveBeenCalled();
  });

  it("updates nickname and email inputs", async () => {
    const user = userEvent.setup();
    renderModal();

    const nicknameInput = screen.getByPlaceholderText(/nickname/i);
    const emailInput = screen.getByPlaceholderText(/email/i);

    await user.type(nicknameInput, "Ivy");
    await user.type(emailInput, "ivy@example.com");

    expect(nicknameInput).toHaveValue("Ivy");
    expect(emailInput).toHaveValue("ivy@example.com");
  });

  it("adds a player and clears inputs", async () => {
    const user = userEvent.setup();
    renderModal();

    const shuffleButton = screen.getByTestId("avatar-shuffle");
    await user.click(shuffleButton);

    await user.type(screen.getByPlaceholderText(/nickname/i), "Alex");
    await user.type(screen.getByPlaceholderText(/email/i), "alex@example.com");
    await user.click(screen.getByRole("button", { name: /add player/i }));

    const list = screen.getByTestId("player-list");
    expect(within(list).getByText(/alex · alex@example.com/i)).toBeVisible();

    expect(screen.getByPlaceholderText(/nickname/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/email/i)).toHaveValue("");
    expect(shuffleButton.textContent).toContain("🦊");
  });

  it("shows validation errors for missing nickname", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByPlaceholderText(/email/i), "test@example.com");
    await user.click(screen.getByRole("button", { name: /add player/i }));

    expect(screen.getByText(/nickname is required/i)).toBeVisible();
    const list = screen.getByTestId("player-list");
    expect(within(list).queryByText(/@/i)).toBeNull();
    expect(screen.getByText(/players \(0\)/i)).toBeVisible();
  });

  it("shows validation errors for missing email", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByPlaceholderText(/nickname/i), "Jess");
    await user.click(screen.getByRole("button", { name: /add player/i }));

    expect(screen.getByText(/email is required/i)).toBeVisible();
    const list = screen.getByTestId("player-list");
    expect(within(list).queryByText(/@/i)).toBeNull();
    expect(screen.getByText(/players \(0\)/i)).toBeVisible();
  });

  it("shows validation errors for invalid email", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByPlaceholderText(/nickname/i), "Jess");
    await user.type(screen.getByPlaceholderText(/email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /add player/i }));

    expect(screen.getByText(/enter a valid email/i)).toBeVisible();
    const list = screen.getByTestId("player-list");
    expect(within(list).queryByText(/@/i)).toBeNull();
    expect(screen.getByText(/players \(0\)/i)).toBeVisible();
  });

  it("disables start when no players are added", async () => {
    const { onStartGame } = renderModal();

    const startButton = screen.getByRole("button", {
      name: /start game with 0 players/i
    });

    expect(screen.getByText(/add at least one player to start/i)).toBeVisible();
    expect(startButton).toBeDisabled();

    fireEvent.click(startButton);
    expect(onStartGame).not.toHaveBeenCalled();
  });

  it("starts the game with players", async () => {
    const user = userEvent.setup();
    const { onStartGame } = renderModal();

    await user.type(screen.getByLabelText(/game name/i), "Sunday Showdown");
    await user.type(screen.getByPlaceholderText(/nickname/i), "Rae");
    await user.type(screen.getByPlaceholderText(/email/i), "rae@example.com");
    await user.click(screen.getByRole("button", { name: /add player/i }));

    const startButton = screen.getByRole("button", {
      name: /start game with 1 player/i
    });
    expect(startButton).toBeEnabled();

    await user.click(startButton);

    expect(onStartGame).toHaveBeenCalledTimes(1);
    expect(onStartGame).toHaveBeenCalledWith({
      gameName: "Sunday Showdown",
      players: [
        {
          nickname: "Rae",
          email: "rae@example.com",
          avatar: "🦊"
        }
      ]
    } as NewGamePayload);
  });
});
