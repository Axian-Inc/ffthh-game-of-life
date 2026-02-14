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
    case 'OPEN_DELETE':
      return { ...state, pendingDelete: action.payload, view: 'home' }
    case 'OPEN_START':
      return { ...state, view: 'start', activeGame: action.payload, activeGameMode: 'resume' }
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
    openDelete: (game) => dispatch({ type: 'OPEN_DELETE', payload: game }),
    openStart: (game) => dispatch({ type: 'OPEN_START', payload: game }),
    closeAll: () => dispatch({ type: 'CLOSE_ALL' }),
  }
}

export default useModalState
