export const formatTime = (seconds: number | undefined): string => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 格式化时间为MySQL格式 (YYYY-MM-DD HH:mm:ss)
export const formatToMySQLDateTime = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

