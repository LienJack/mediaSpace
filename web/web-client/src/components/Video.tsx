'use client'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Player from 'xgplayer'
import 'xgplayer/dist/index.min.css'

// 定义标记点的数据结构
interface ProgressDot {
  id: number
  time: number // 标记点出现的时间(秒)
  text: string // 提示文字
  duration?: number // 标记点持续时间(秒),可选
  color?: string // 标记点颜色,可选
}

interface VideoProps {
  url: string
  width?: string | number 
  height?: string | number
  poster?: string
  autoplay?: boolean
  progressDots?: ProgressDot[] // 新增标记点配置
  onDotClick?: (dot: ProgressDot) => void // 新增标记点点击回调
  // 新增: 获取播放器实例的回调
  onPlayerReady?: (player: Player) => void 
}

// 使用动态导入避免 SSR
const Video = ({ 
  url,
  width = '100%',
  height= '100%', 
  poster,
  autoplay = false,
  progressDots = [], // 默认空数组
  onDotClick,
  onPlayerReady // 新增
}: VideoProps) => {
  const playerRef = useRef<Player | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || !containerRef.current) return

    // 初始化播放器
    playerRef.current = new Player({
      el: containerRef.current,
      url: url,
      width: width,
      height: height,
      poster: poster,
      autoplay: autoplay,
      // 基础配置
      fluid: true, // 流式布局
      playsinline: true, // 行内播放
      volume: 0.6, // 默认音量
      // 交互配置
      closeVideoClick: false, // 允许点击视频区域进行播放/暂停
      closeVideoDblclick: false, // 允许双击视频区域进行全屏/退出全屏
      // 进度条标记点配置
      progressDot: progressDots.map(dot => ({
        ...dot,
        duration: dot.duration || 1, // 默认持续1秒
        color: dot.color || '#f85959', // 默认红色
        style: {       // 指定样式
            backgroundColor: 'pink'
        }
      })),
      plugins: [], 
    })

    // 新增: 播放器实例准备就绪时触发回调
    if (onPlayerReady && playerRef.current) {
      onPlayerReady(playerRef.current)
    }

    // 监听标记点点击事件
    if (onDotClick) {
      playerRef.current.on('dotclick', (e) => {
        const dot = progressDots.find(d => d.id === e.dotId)
        if (dot) {
          onDotClick(dot)
        }
      })
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [url, width, height, poster, autoplay, progressDots, onDotClick, onPlayerReady, isMounted])

  // 在客户端渲染之前返回一个占位符
  if (!isMounted) {
    return (
      <div className="video-container h-full">
        <div className='h-full' style={{height: height}}></div>
      </div>
    )
  }

  return (
    <div className="video-container h-full">
      <div className='h-full' ref={containerRef} style={{height: height}}></div>
    </div>
  )
}

// 使用 dynamic 导入组件，禁用 SSR
export default dynamic(() => Promise.resolve(Video), {
  ssr: false
})
