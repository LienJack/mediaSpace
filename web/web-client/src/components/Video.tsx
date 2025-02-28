'use client'
import { useEffect, useRef, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import ReactPlayer from 'react-player'
import { Skeleton, Tooltip, Avatar, Box, Typography } from '@mui/material'
import { usePlayerStore } from '@/store/playerStore'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useTheme } from '@mui/material/styles'

// 定义标记点的数据结构
export interface ProgressDot {
  id: string
  time: number // 标记点出现的时间(秒)
  text: string // 提示文字
  avatar?: string
  comment?: string
  images?: string[]
  createdAt: Date // 添加创建时间字段
}

export interface VideoProps {
  url: string
  width?: string | number 
  height?: string | number
  poster?: string
  autoplay?: boolean
  progressDots?: ProgressDot[] // 标记点配置
  minDotDistance?: number // 最小标记点间距（秒），默认为 5 秒
  onDotClick?: (timestamp: number) => void // 修改为返回分组后的标记点
  onPlayerReady?: (player: ReactPlayer) => void // 获取播放器实例的回调
}

const Video = ({ 
  url,
  width,
  height,
  poster,
  autoplay = false,
  progressDots = [], // 移除默认值，改为动态计算
  onDotClick,
  onPlayerReady
}: VideoProps) => {
  const theme = useTheme()
  const playerRef = useRef<ReactPlayer | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [played, setPlayed] = useState(0)
  const [seeking, setSeeking] = useState(false)
  const setPlayer = usePlayerStore((state) => state.setPlayer)
  const lastPlayedSeconds = useRef<number>(0)

  // 客户端挂载检查
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 播放器就绪回调
  const handleReady = () => {
    if (onPlayerReady && playerRef.current) {
      onPlayerReady(playerRef.current)
    }
    // 将播放器实例存储到全局状态
    setPlayer(playerRef.current)
  }

  // 组件卸载时移除播放器实例
  useEffect(() => {
    return () => {
      setPlayer(null)
    }
  }, [setPlayer])

  // 处理进度更新
  const handleProgress = (state: { playedSeconds: number, played: number }) => {
    if (!seeking) {
      setPlayed(state.playedSeconds)
      // 检查是否有标记点需要触发
      progressDots.forEach(dot => {
        if (
          Math.abs(state.playedSeconds - dot.time) < 0.1 && // 在标记点时间范围内
          onDotClick
        ) {
          onDotClick(state.playedSeconds)
        }
      })
    }
  }

  // 处理视频时长获取
  const handleDuration = (duration: number) => {
    setDuration(duration)
  }

  // 处理滑块改变
  const handleSliderChange = (value: number | number[]) => {
    if (typeof value === 'number') {
      setSeeking(true)
      setPlayed(value)
    }
  }

  // 处理滑块改变完成
  const handleSliderAfterChange = (value: number | number[]) => {
    if (typeof value === 'number' && playerRef.current) {
      setSeeking(false)
      playerRef.current.seekTo(value, 'seconds')
    }
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000)
    const hh = date.getUTCHours()
    const mm = date.getUTCMinutes()
    const ss = date.getUTCSeconds().toString().padStart(2, '0')
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`
    }
    return `${mm}:${ss}`
  }

  // 对标记点进行分组和密度控制
  const groupedDots = useMemo(() => {
    // 按时间排序
    const sortedDots = [...progressDots].sort((a, b) => a.time - b.time);
    const groups: { [key: number]: ProgressDot[] } = {};
    const TIME_THRESHOLD = 0.5; // 0.5秒阈值

    // 遍历并分组
    sortedDots.forEach(dot => {
      // 查找最近的组
      const nearestGroupTime = Object.keys(groups)
        .map(Number)
        .find(time => Math.abs(time - dot.time) <= TIME_THRESHOLD);

      if (nearestGroupTime !== undefined) {
        // 如果找到0.5秒内的组，添加到该组
        groups[nearestGroupTime].push(dot);
      } else {
        // 否则创建新组
        groups[dot.time] = [dot];
      }
    });

    return groups;
  }, [progressDots]);

  // 自定义标记点组件
  const CustomDot = ({ dots }: { dots: ProgressDot[] }) => (
    <Box 
      sx={{ 
        position: 'relative',
        width: 16,
        height: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <span 
        style={{ 
          width: 12,
          height: 12,
          backgroundColor: theme.palette.secondary.main,
          borderRadius: '50%',
          display: 'block',
        }}
      />
      {dots.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            top: -15,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: theme.palette.secondary.main,
            color: 'white',
            borderRadius: '10px',
            padding: '0 4px',
            fontSize: '10px',
            lineHeight: '14px',
            minWidth: '16px',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {dots.length}
        </Box>
      )}
    </Box>
  );

  // 在客户端渲染之前返回占位符
  if (!isMounted) {
    return (
      <div className="video-container h-full">
        <Skeleton variant="rectangular" width={width} height={height} />
      </div>
    )
  }

  // 自定义提示内容组件
  const CustomTooltip = ({ dots }: { dots: ProgressDot[] }) => {
    // 按创建时间排序
    const sortedDots = [...dots].sort(
      // (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      (a, b) => {
        if (a.time !== b.time) {
          return a.time - b.time;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    );

    return (
      <Box sx={{ p: 1, maxWidth: 'none' }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          overflowX: 'auto',
          pb: 1
        }}>
          {sortedDots.map((dot, index) => (
            <Box 
              key={dot.id}
              sx={{ 
                minWidth: 120,
                maxWidth: 200,
                borderRight: index < sortedDots.length - 1 ? 1 : 0,
                borderColor: 'divider',
                pr: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar src={dot.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
                <Typography variant="subtitle2">{dot.text}</Typography>
                <Typography 
                  variant="subtitle2" 
                  sx={{ ml: 2 }} 
                  color='primary' 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    playerRef.current?.seekTo(dot.time);
                    onDotClick?.(dot.time);
                  }}
                >
                  {formatTime(dot.time)}
                </Typography>
              </Box>
              {dot.comment && (
                <Typography variant="body2" sx={{ mb: 1 }}>{dot.comment}</Typography>
              )}
              {dot.images && dot.images.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {dot.images.map((img, index) => (
                    <img 
                      key={index} 
                      src={img} 
                      alt="" 
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} 
                    />
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <div className="video-container h-full">
      <Box sx={{ position: 'relative' }}>
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={autoplay}
          controls={true}
          light={poster}
          pip={true}
          stopOnUnmount={true}
          onReady={handleReady}
          onProgress={handleProgress}
          onDuration={handleDuration}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                disablePictureInPicture: false,
              },
            },
          }}
        />
      </Box>
      
      <Box 
        sx={{ 
          position: 'relative',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          px: 2,
          mt: 1,
        }}
      >
        <Slider
          min={0}
          max={duration}
          value={played}
          onChange={handleSliderChange}
          onChangeComplete={handleSliderAfterChange}
          step={0.1}
          styles={{
            rail: { 
              backgroundColor: theme.palette.grey[300],
              height: 4 
            },
            track: { 
              backgroundColor: theme.palette.primary.main,
              height: 4 
            },
            handle: {
              borderColor: theme.palette.primary.main,
              height: 14,
              width: 14,
              marginTop: -5,
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              display: 'none'
            }
          }}
          dotStyle={{
            borderColor: theme.palette.secondary.main,
            backgroundColor: theme.palette.secondary.main,
            width: 8,
            height: 8,
            bottom: -2,
            display: 'none',
          }}
          marks={Object.entries(groupedDots).reduce((acc, [time, dots]) => ({
            ...acc,
            [time]: {
              style: {
                position: 'absolute',
                transform: 'translate(-50%, -18px)',
                width: 8,
                height: 8,
              },
              label: (
                <Tooltip 
                  title={<CustomTooltip dots={dots} />}
                  placement="top"
                  arrow
                  enterDelay={0}
                  enterTouchDelay={0}
                  leaveTouchDelay={5000}
                  slotProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        '& .MuiTooltip-arrow': {
                          color: 'background.paper',
                        },
                        boxShadow: theme.shadows[3],
                        maxWidth: 'none !important'
                      }
                    },
                    popper: {
                      sx: {
                        '& .MuiTooltip-tooltip': {
                          minWidth: 220,
                        }
                      }
                    }
                  }}
                >
                  <div 
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      playerRef.current?.seekTo(dot.time);
                      onDotClick?.(dot.time);
                    }}
                  >
                    <CustomDot dots={dots} />
                  </div>
                </Tooltip>
              ),
            },
          }), {})}
        />
      </Box>
    </div>
  )
}

// 使用 dynamic 导入组件，禁用 SSR
export default dynamic(() => Promise.resolve(Video), {
  ssr: false
})
