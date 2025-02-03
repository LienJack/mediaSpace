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
        },100)
        // 等待视频加载
        setTimeout(()=>{
          if(!player.paused){
            player.pause()
          }
        },500)
        setTimeout(()=>{
          if(!player.paused){
            player.pause()
          }
        },1000)
      }
      return state
    })
  },
  removePlayer: () => set({ player: null }),
})) 