import { create } from 'zustand'
import Player from 'xgplayer'

interface PlayerState {
  player: Player | null
  setPlayer: (player: Player | null) => void
  seekTo: (time: number) => void
  removePlayer: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  player: null,
  setPlayer: (player: Player | null) => set({ player }),
  seekTo: (time: number) => {
    set((state) => {
      const { player } = state
      if (player) {
        player.seek(time)
        setTimeout(()=>{
          player.pause()
        },10)
      }
      return state
    })
  },
  removePlayer: () => set({ player: null }),
})) 