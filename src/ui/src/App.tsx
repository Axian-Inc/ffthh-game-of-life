import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Hub from './pages/Hub'
import GameDetail from './pages/GameDetail'
import { GamesProvider } from './state/games'

function App() {
  return (
    <GamesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Hub />} />
          <Route path="/game/:id" element={<GameDetail />} />
        </Routes>
      </BrowserRouter>
    </GamesProvider>
  )
}

export default App
