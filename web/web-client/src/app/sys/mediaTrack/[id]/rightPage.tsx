import { Box } from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import CommentList from "@/components/CommentList";
import { usePlayerStore } from "@/store/playerStore";
import { useState } from "react";
import { ListSkeleton } from "./ListItem";
import { motion, AnimatePresence } from "framer-motion";

interface RightPageProps {
  isLoading: boolean;
}

type TabValue = "1" | "2";

const tabPanelAnimation = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.3 }
};

export default function RightPage({ isLoading }: RightPageProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("1");
  const { seekTo } = usePlayerStore();

  const handleTabChange = (event: React.SyntheticEvent, newTab: TabValue) => {
    setActiveTab(newTab);
  };

  const handleTimestampClick = (timestamp: number) => {
    seekTo(timestamp);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        padding: 2,
        boxSizing: 'border-box',
      }}
    >
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleTabChange} aria-label="媒体详情选项卡">
            <Tab label="批注" value="1" />
            <Tab label="文件信息" value="2" />
          </TabList>
        </Box>

        <Box sx={{ position: 'relative', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              style={{ 
                position: 'absolute', 
                width: '100%',
                height: '100%'
              }}
              {...tabPanelAnimation}
            >
              {activeTab === "1" && (
                <TabPanel 
                  value="1" 
                  sx={{ 
                    height: '100%',
                    overflow: 'hidden',
                    p: 0
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      overflowY: 'auto',
                      pr: 1,
                    }}
                  >
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <ListSkeleton key={index} />
                      ))
                    ) : (
                      <CommentList onTimeClick={handleTimestampClick} />
                    )}
                  </Box>
                </TabPanel>
              )}

              {activeTab === "2" && (
                <TabPanel 
                  value="2"
                  sx={{ height: '100%' }}
                >
                  文件信息内容
                </TabPanel>
              )}
            </motion.div>
          </AnimatePresence>
        </Box>
      </TabContext>
    </Box>
  );
}
