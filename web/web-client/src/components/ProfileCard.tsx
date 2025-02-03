import React from 'react';
import { Card, CardContent, IconButton, Box, Avatar, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { User } from '@/types/user'

interface ProfileCardProps {
    user: User;
    onClick: (user: User) => void;
}
  
const ProfileCard: React.FC<ProfileCardProps> = ({ user, onClick }) => {
    return (
        <Card onClick={() => onClick(user)} sx={{ maxWidth: 400, m: 1, cursor: 'pointer' }}>
            <CardContent sx={{ textAlign: "center", position: "relative" }}>
                <IconButton sx={{ position: "absolute", right: 8, top: 8 }} size="small">
                    <MoreVertIcon />
                </IconButton>
                <Box sx={{ pt: 2, pb: 2 }}>
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