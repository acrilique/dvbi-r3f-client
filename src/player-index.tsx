import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Player } from './player.js'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Player />
  </StrictMode>,
)