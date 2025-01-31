import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
} from "@mui/material";

export const ListSkeleton = () => (
  <ListItem
    alignItems="flex-start"
    component="div"
    sx={{
      px: 2,
      py: 1.5,
      bgcolor: "background.paper",
      borderRadius: 1,
      "&:hover": {
        bgcolor: "action.hover",
      },
    }}
  >
    <ListItemAvatar>
      <Skeleton
        variant="circular"
        width={40}
        height={40}
        sx={{ marginRight: "16px" }}
      />
    </ListItemAvatar>
    <ListItemText
      primary={
        <Skeleton
          variant="text"
          width="100%"
          height={40}
        />
      }
      secondary={
        <Skeleton
          variant="text"
          width="100%"
          height={200}
        />
      }
      slots={{ secondary: "div", primary: "div" }}
    />
  </ListItem>
);
