import React from "react";
import {
  Card,
  CardContent,
  IconButton,
  Box,
  Avatar,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { User } from "@/types/user";

interface ProfileCardProps {
  user: User;
  onClick: (user: User) => void;
  onEdit: (user: User) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onClick, onEdit }) => {
  const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onEdit(user);
  };

  return (
    <Card sx={{ maxWidth: 400, m: 1, cursor: "pointer" }}>
      <CardContent sx={{ textAlign: "center", position: "relative" }}>
        {user.account !== "admin" && (
          <IconButton
            sx={{ position: "absolute", right: 8, top: 8 }}
            size="small"
            onClick={handleEditClick}
          >
            <MoreVertIcon />
          </IconButton>
        )}
        <Box sx={{ pt: 2, pb: 2 }} onClick={() => onClick(user)}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              margin: "0 auto",
              fontSize: "2rem",
            }}
            src={user.avatarUrl}
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
        </Box>
        <Typography variant="subtitle1" component="div">
          {user.name}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
