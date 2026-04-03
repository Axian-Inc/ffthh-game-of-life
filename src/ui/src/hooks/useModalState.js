import { useCallback, useReducer } from 'react'

const initialState = {
  view: 'home',
  activeGame: null,
  activeGameMode: 'resume',
  pendingDelete: null,
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'OPEN_CREATE':
      return { ...state, view: 'create' }
    case 'OPEN_SESSION':
      return {
        ...state,
        view: 'session',
        activeGame: action.payload.game,
        activeGameMode: action.payload.mode || 'resume',
      }
    case 'OPEN_PLAY':
      return {
        ...state,
        view: 'play',
        activeGame: action.payload.game,
        activeGameMode: 'resume',
      }
    case 'OPEN_DELETE':
      return { ...state, pendingDelete: action.payload, view: 'home' }
    case 'UPDATE_ACTIVE_GAME':
      return { ...state, activeGame: action.payload }
    case 'CLOSE_ALL':
      return { ...state, view: 'home', activeGame: null, activeGameMode: 'resume', pendingDelete: null }
    default:
      return state
  }
}

const useModalState = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const openCreate = useCallback(() => dispatch({ type: 'OPEN_CREATE' }), [])
  const openSession = useCallback((game, mode) => dispatch({ type: 'OPEN_SESSION', payload: { game, mode } }), [])
  const openPlay = useCallback((game) => dispatch({ type: 'OPEN_PLAY', payload: { game } }), [])
  const openDelete = useCallback((game) => dispatch({ type: 'OPEN_DELETE', payload: game }), [])
  const updateActiveGame = useCallback((game) => dispatch({ type: 'UPDATE_ACTIVE_GAME', payload: game }), [])
  const closeAll = useCallback(() => dispatch({ type: 'CLOSE_ALL' }), [])

  return {
    state,
    openCreate,
    openSession,
    openPlay,
    openDelete,
    updateActiveGame,
    closeAll,
  }
}

export default useModalState
