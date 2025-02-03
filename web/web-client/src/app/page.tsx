"use client";

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Grid2 as Grid,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import ProfileCard from "@/components/ProfileCard";


export default function Home() {
  const profiles = [
    { name: "en", avatar: "", subtitle: "en li" },
    { name: "gmail", avatar: "/panda.png", subtitle: "snow black" },
    { name: "snow", avatar: "", subtitle: "snow black" },
    { name: "用户1", avatar: "", subtitle: "" },
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom>
          请选择用户
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 6 }}>
          The Art Resource Management Library is a comprehensive platform
          designed to streamline the organization, storage, and retrieval of
          artistic resources. Whether you're an artist, educator, or curator,
          this library serves as an essential tool for managing a vast array of
          art materials, including images, videos, and documentation.
        </Typography>

        <Grid container justifyContent="center" spacing={2}>
          {profiles.map((profile, index) => (
            <Grid size={3} key={index}>
              <ProfileCard {...profile} />
            </Grid>
          ))}
          <Grid size={3}>
            <Card sx={{ maxWidth: 400, m: 1, height: "100%" }}>
              <CardContent
                sx={{
                  textAlign: "center",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    margin: "0 auto",
                    bgcolor: "grey.100",
                  }}
                >
                  <AddIcon sx={{ color: "grey.500" }} />
                </Avatar>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Add
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
