import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ModalBackdrop from '../modals/ModalBackdrop'
import CreateGameModal from '../modals/CreateGameModal'
import ResumeGameModal from '../modals/ResumeGameModal'
import DeleteGameModal from '../modals/DeleteGameModal'
import ModalManager from '../modals/ModalManager'
import { createGame, createPlayer } from '../../test/testUtils'

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

  it('CreateGameModal returns null when closed', () => {
    const { container } = render(
      <CreateGameModal
        isOpen={false}
        onBackdropClick={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        gameName=""
        players={[]}
        createError=""
        isCreating={false}
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('CreateGameModal renders the six-step wizard entry screen', () => {
    render(
      <CreateGameModal
        isOpen
        onBackdropClick={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        gameName=""
        players={[createPlayer({ id: 'p1' })]}
        createError=""
        isCreating={false}
      />,
    )

    expect(screen.getByText('New Game Setup')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()
    expect(screen.getByLabelText('Game Name:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
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

  it('ModalManager renders delete modal when pending delete exists', () => {
    const game = createGame({ name: 'Pending Delete' })
    render(
      <ModalManager
        view="home"
        activeGame={null}
        activeGameMode="resume"
        pendingDelete={game}
        onBackdropClick={vi.fn()}
        onCloseAll={vi.fn()}
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
          draftPlayer: { name: '', avatar: 'rocket' },
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
})
