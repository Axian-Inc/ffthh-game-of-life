import { useCallback, useReducer } from 'react'

const initialState = {
  view: 'home',
  activeGame: null,
  activeGameMode: 'resume',
  pendingDelete: null,
  historyPlayer: null,
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'OPEN_CREATE':
      return { ...state, view: 'create', historyPlayer: null }
    case 'OPEN_SESSION':
      return {
        ...state,
        view: 'session',
        activeGame: action.payload.game,
        activeGameMode: action.payload.mode || 'resume',
        historyPlayer: null,
      }
    case 'OPEN_PLAY':
      return {
        ...state,
        view: 'play',
        activeGame: action.payload.game,
        activeGameMode: 'resume',
        historyPlayer: null,
      }
    case 'OPEN_DELETE':
      return { ...state, pendingDelete: action.payload, view: 'home', historyPlayer: null }
    case 'OPEN_HISTORY':
      return { ...state, historyPlayer: action.payload }
    case 'CLOSE_HISTORY':
      return { ...state, historyPlayer: null }
    case 'CLOSE_ALL':
      return {
        ...state,
        view: 'home',
        activeGame: null,
        activeGameMode: 'resume',
        pendingDelete: null,
        historyPlayer: null,
      }
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
  const openHistory = useCallback((player) => dispatch({ type: 'OPEN_HISTORY', payload: player }), [])
  const closeHistory = useCallback(() => dispatch({ type: 'CLOSE_HISTORY' }), [])
  const closeAll = useCallback(() => dispatch({ type: 'CLOSE_ALL' }), [])

  return {
    state,
    openCreate,
    openSession,
    openPlay,
    openDelete,
    openHistory,
    closeHistory,
    closeAll,
  }
}

export default useModalState
