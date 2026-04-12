import { create } from 'zustand'

export type GameState = 'INTRO' | 'KEYPAD' | 'UNLOCKING' | 'OPENED'

interface GameStore {
  gameState: GameState
  codeInput: string
  isError: boolean
  isLoaded: boolean

  setGameState: (state: GameState) => void
  setCodeInput: (code: string) => void
  setError: (error: boolean) => void
  setLoaded: () => void
  openKeypad: () => void
  closeKeypad: () => void
  unlock: () => void
  finishUnlocking: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'INTRO',
  codeInput: '',
  isError: false,
  isLoaded: false,

  setGameState: (state) => set({ gameState: state }),
  setCodeInput: (code) => set({ codeInput: code }),
  setError: (error) => set({ isError: error }),
  setLoaded: () => set({ isLoaded: true }),
  openKeypad: () => set({ gameState: 'KEYPAD', codeInput: '', isError: false }),
  closeKeypad: () => set({ gameState: 'INTRO', codeInput: '', isError: false }),
  unlock: () => set({ gameState: 'UNLOCKING', isError: false }),
  finishUnlocking: () => set({ gameState: 'OPENED' }),
}))
