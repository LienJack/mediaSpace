import { Card, CardContent, IconButton, Box, Avatar, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface ProfileCardProps {
    name: string;
    avatar: string;
    subtitle: string;
  }
  
  const ProfileCard = ({ name, avatar, subtitle }: ProfileCardProps) => (
    <Card sx={{ maxWidth: 400, m: 1 }}>
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
            src={avatar}
          >
            {name.charAt(0).toUpperCase()}
          </Avatar>
        </Box>
        <Typography variant="subtitle1" component="div">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle || name}
        </Typography>
      </CardContent>
    </Card>
  );
  export default ProfileCard;