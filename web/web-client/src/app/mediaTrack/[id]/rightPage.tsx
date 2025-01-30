import { useParams } from 'next/navigation';
import { Box, Paper } from '@mui/material';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import CommentList from '@/components/CommentList';
import { usePlayerStore } from '@/store/playerStore'
import { mockComments } from '@/components/mock';


import { useState } from 'react';

export default function RightPage() {
  const [value, setValue] = useState(1);
  const { player, seekTo } = usePlayerStore()

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleTimeClick = (timestamp: number) => {
    seekTo(timestamp);
  };

  return (
    <Paper 
      sx={{ 
        width: '500px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
    <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="批注" value={1} />
            <Tab label="文件信息" value={2} />
          </TabList>
        </Box>
        <TabPanel value={1} className='overflow-y-auto'>
            <CommentList comments={mockComments} onTimeClick={handleTimeClick} />
        </TabPanel>
        <TabPanel value={2}>Item Two</TabPanel>
      </TabContext>
    </Paper>
  );
}