import { useReducer } from 'react'

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
    case 'OPEN_SETUP':
      return {
        ...state,
        view: 'setup',
        activeGame: action.payload.game,
        activeGameMode: 'resume',
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
    case 'CLOSE_ALL':
      return { ...state, view: 'home', activeGame: null, activeGameMode: 'resume', pendingDelete: null }
    default:
      return state
  }
}

const useModalState = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return {
    state,
    openCreate: () => dispatch({ type: 'OPEN_CREATE' }),
    openSession: (game, mode) => dispatch({ type: 'OPEN_SESSION', payload: { game, mode } }),
    openSetup: (game) => dispatch({ type: 'OPEN_SETUP', payload: { game } }),
    openPlay: (game) => dispatch({ type: 'OPEN_PLAY', payload: { game } }),
    openDelete: (game) => dispatch({ type: 'OPEN_DELETE', payload: game }),
    closeAll: () => dispatch({ type: 'CLOSE_ALL' }),
  }
}

export default useModalState
