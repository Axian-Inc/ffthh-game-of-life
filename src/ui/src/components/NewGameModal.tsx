import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'

import type { Game, Player } from '../types'

const avatarPool = ['😀', '🦊', '🐸', '👑', '🤖', '🐱', '🐶', '🐵', '🦁']

type NewGameModalProps = {
  isOpen: boolean
  onClose: () => void
  onCreate: (game: Game) => void
}

const getId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `game-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const NewGameModal = ({ isOpen, onClose, onCreate }: NewGameModalProps) => {
  const [name, setName] = useState('')
  const [playersInput, setPlayersInput] = useState('')
  const [error, setError] = useState('')

  const parsedPlayers = useMemo(() => {
    return playersInput
      .split(',')
      .map((player) => player.trim())
      .filter(Boolean)
  }, [playersInput])

  if (!isOpen) {
    return null
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter a game name.')
      return
    }

    if (parsedPlayers.length === 0) {
      setError('Add at least one player.')
      return
    }

    const players: Player[] = parsedPlayers.map((playerName, index) => ({
      id: `${getId()}-${index}`,
      name: playerName,
      avatar: avatarPool[index % avatarPool.length],
    }))

    onCreate({
      id: getId(),
      name: name.trim(),
      status: 'active',
      players,
      updatedAt: Date.now(),
    })

    setName('')
    setPlayersInput('')
    setError('')
    onClose()
  }

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__content">
        <header className="modal__header">
          <h3>New Game</h3>
          <button className="btn btn-icon-only" type="button" onClick={onClose}>
            ✕
          </button>
        </header>
        <form className="modal__form" onSubmit={handleSubmit}>
          <label>
            Game name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Friday Frenzy"
              required
            />
          </label>
          <label>
            Players (comma-separated)
            <input
              type="text"
              value={playersInput}
              onChange={(event) => setPlayersInput(event.target.value)}
              placeholder="Avery, Kai, Jordan"
            />
          </label>
          {error ? <p className="modal__error">{error}</p> : null}
          <div className="modal__actions">
            <button className="btn btn-primary" type="submit">
              Create
            </button>
            <button className="btn btn-ghost" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewGameModal
