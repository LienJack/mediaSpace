import { create } from 'zustand'
import ReactPlayer from 'react-player'

interface PlayerState {
  player: ReactPlayer | null
  setPlayer: (player: ReactPlayer | null) => void
  seekTo: (time: number) => void
  pause: () => void
  play: () => void
  removePlayer: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  player: null,
  setPlayer: (player: ReactPlayer | null) => set({ player }),
  seekTo: (time: number) => {
    set((state) => {
      const { player } = state
      if (player) {
        if(player.getInternalPlayer()){
          player.getInternalPlayer()?.pause()
          player.seekTo(time, 'seconds')
        }
      }
      return state
    })
  },
  pause: () => {
    set((state) => {
      const { player } = state
      if (player) {
        player.getInternalPlayer()?.pause()
      }
      return state
    })
  },
  play: () => {
    set((state) => {
      const { player } = state
      if (player) {
        player.getInternalPlayer()?.play()
      }
      return state
    })
  },
  removePlayer: () => set({ player: null }),
})) 