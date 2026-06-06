import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ModalBackdrop from '../modals/ModalBackdrop'
import ResumeGameModal from '../modals/ResumeGameModal'
import DeleteGameModal from '../modals/DeleteGameModal'
import PlayerHistoryModal from '../modals/PlayerHistoryModal'
import ActionSelectionModal from '../modals/ActionSelectionModal'
import ModalManager from '../modals/ModalManager'
import { createGame } from '../../test/testUtils'

describe('Modal components', () => {
  it('ModalBackdrop triggers backdrop clicks', async () => {
    const user = userEvent.setup()
    const onBackdropClick = vi.fn()
    render(
      <ModalBackdrop onBackdropClick={onBackdropClick}>
        <div>Modal content</div>
      </ModalBackdrop>,
    )

    await user.click(screen.getByRole('dialog'))
    expect(onBackdropClick).toHaveBeenCalledTimes(1)
  })

  it('ResumeGameModal renders results mode', () => {
    const game = createGame({ id: 'game-2', name: 'Results Game' })
    render(
      <ResumeGameModal
        isOpen
        game={game}
        mode="results"
        onBackdropClick={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText('Game Results')).toBeInTheDocument()
    expect(screen.getByText('Results Game')).toBeInTheDocument()
  })

  it('DeleteGameModal renders when open', () => {
    const game = createGame({ name: 'Delete Me' })
    render(
      <DeleteGameModal
        isOpen
        game={game}
        onBackdropClick={vi.fn()}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )
    expect(screen.getByText('Delete Game')).toBeInTheDocument()
    expect(screen.getByText('Remove “Delete Me”?')).toBeInTheDocument()
  })

  it('PlayerHistoryModal renders scoped move history', () => {
    render(
      <PlayerHistoryModal
        isOpen
        playerName="Ari"
        entries={[
          {
            id: 'move-2',
            turnNumber: 2,
            actionLabel: 'Pass',
            createdAt: Date.UTC(2026, 3, 4, 12, 30),
          },
          {
            id: 'move-1',
            turnNumber: 1,
            actionLabel: 'Choose Action',
            createdAt: Date.UTC(2026, 3, 4, 11, 15),
          },
        ]}
        onBackdropClick={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText("Ari's Actions")).toBeInTheDocument()
    expect(screen.getByText('Pass')).toBeInTheDocument()
    expect(screen.getByText('Choose Action')).toBeInTheDocument()
    expect(screen.getByText('Turn 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('ActionSelectionModal renders actions and submits the selected action', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <ActionSelectionModal
        isOpen
        playerName="Ari"
        turnNumber={2}
        onBackdropClick={vi.fn()}
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    )

    expect(screen.getByText("Ari's Turn 2")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Study or School/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Career Switch/i })).toBeInTheDocument()
    const confirmButton = screen.getByRole('button', { name: 'Choose Action' })
    expect(confirmButton).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /Join Gym/i }))
    expect(confirmButton).toBeEnabled()

    await user.click(confirmButton)
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'join-gym',
        label: 'Join Gym',
      }),
    )
  })

  it('ActionSelectionModal supports canceling without selecting an action', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onConfirm = vi.fn()

    render(
      <ActionSelectionModal
        isOpen
        playerName="Ari"
        turnNumber={1}
        onBackdropClick={vi.fn()}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('ModalManager renders delete modal when pending delete exists', () => {
    const game = createGame({ name: 'Pending Delete' })
    render(
      <ModalManager
        view="home"
        activeGame={null}
        activeGameMode="resume"
        pendingDelete={game}
        historyPlayer={null}
        historyEntries={[]}
        onBackdropClick={vi.fn()}
        onCloseAll={vi.fn()}
        onHistoryClose={vi.fn()}
        onDeleteCancel={vi.fn()}
        onDeleteConfirm={vi.fn()}
        createGameProps={{
          onSubmit: vi.fn(),
          gameName: '',
          onGameNameChange: vi.fn(),
          onGameNameBlur: vi.fn(),
          gameNameTouched: false,
          isGameNameValid: false,
          isGameNameTooLong: false,
          maxGameNameLength: 60,
          players: [],
          minPlayers: 1,
          maxPlayerNameLength: 24,
          draftPlayer: { name: '', avatar: 'monkey-face' },
          draftTouched: { name: false },
          draftErrors: { name: '' },
          arePlayersValid: false,
          onAddPlayer: vi.fn(),
          onRemovePlayer: vi.fn(),
          onDraftNameChange: vi.fn(),
          onDraftBlur: vi.fn(),
          onDraftAvatarCycle: vi.fn(),
          createError: '',
          isCreating: false,
        }}
      />,
    )

    expect(screen.getByText('Remove “Pending Delete”?')).toBeInTheDocument()
  })

  it('ModalManager renders player history modal when history is open', () => {
    render(
      <ModalManager
        view="play"
        activeGame={createGame()}
        activeGameMode="resume"
        pendingDelete={null}
        historyPlayer={{ playerId: 'player-1', playerName: 'Ari' }}
        historyEntries={[
          {
            id: 'move-1',
            turnNumber: 1,
            actionLabel: 'Pass',
            createdAt: Date.UTC(2026, 3, 4, 10, 0),
          },
        ]}
        onBackdropClick={vi.fn()}
        onCloseAll={vi.fn()}
        onHistoryClose={vi.fn()}
        onDeleteCancel={vi.fn()}
        onDeleteConfirm={vi.fn()}
        createGameProps={{
          onSubmit: vi.fn(),
          submitError: '',
          isSubmitting: false,
          onStatusChange: vi.fn(),
        }}
      />,
    )

    expect(screen.getByText("Ari's Actions")).toBeInTheDocument()
    expect(screen.getByText('Pass')).toBeInTheDocument()
  })

  it('ModalManager renders action selection modal when action selection is open', () => {
    render(
      <ModalManager
        view="play"
        activeGame={createGame()}
        activeGameMode="resume"
        pendingDelete={null}
        actionSelection={{ playerName: 'Ari', turnNumber: 3 }}
        historyPlayer={null}
        historyEntries={[]}
        onBackdropClick={vi.fn()}
        onCloseAll={vi.fn()}
        onActionSelectionCancel={vi.fn()}
        onActionSelectionConfirm={vi.fn()}
        onHistoryClose={vi.fn()}
        onDeleteCancel={vi.fn()}
        onDeleteConfirm={vi.fn()}
        createGameProps={{
          onSubmit: vi.fn(),
          submitError: '',
          isSubmitting: false,
          onStatusChange: vi.fn(),
        }}
      />,
    )

    expect(screen.getByText("Ari's Turn 3")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Debt Paydown/i })).toBeInTheDocument()
  })
})
