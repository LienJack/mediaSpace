'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid2 as Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FileListModel from '@/components/FileListModel';

interface Project {
  id: number;
  name: string;
  lastEdited: string;
}

export default function ProjectPage() {
  const [projects] = useState<Project[]>([
    { id: 1, name: 'Project 1', lastEdited: '2025-02-01' },
    { id: 2, name: 'Project 2', lastEdited: '2025-01-28' },
    { id: 3, name: 'Project 3', lastEdited: '2025-01-25' },
    { id: 4, name: 'Project 4', lastEdited: '2025-01-20' },
  ]);
  
  const [openFileListModel, setOpenFileListModel] = useState(false);

  const handleCreateProject = () => {
    setOpenFileListModel(true);
  };

  const handleCloseFileListModel = () => {
    setOpenFileListModel(false);
  };

  const handleOpenProject = (projectName: string) => {
    alert(`Opening ${projectName}...`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Typography
          component="h1"
          variant="h2"
          align="center"
          sx={{
            color: 'primary.main',
            mb: 4,
            fontWeight: 'bold'
          }}
        >
          Video Project Management
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            mb: 6
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateProject}
          >
            新建项目
          </Button>
        </Box>

        <FileListModel open={openFileListModel} onClose={handleCloseFileListModel} />

        <Typography variant="h4" sx={{ mb: 3 }}>
          最近项目
        </Typography>

        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid size={4} key={project.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    文件描述
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    最近修改 {project.lastEdited}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => handleOpenProject(project.name)}
                    sx={{ ml: 1, mb: 1 }}
                    variant="contained"
                  >
                    打开
                  </Button>
                  <Button
                    size="small"
                    disabled={true}
                    onClick={() => handleOpenProject(project.name)}
                    sx={{ ml: 1, mb: 1 }}
                    variant="contained"
                    color="warning"
                  >
                    删除
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}