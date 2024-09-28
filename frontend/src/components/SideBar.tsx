import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import Dashboard from './Dashboard';
import { useSidebarContext } from '../context/TabContext.tsx';

export default function StyledDrawer() {
  const [open, setOpen] = React.useState(true);
  const { selectedItem, updateSelectedItem } = useSidebarContext();
  
  const DrawerList = (
    <Box 
      sx={{ 
        width: 250, 
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(5px)',
        boxShadow: '0 0 10px 5px rgba(0, 237, 100, 0.3)',
        display: 'flex',
        flexDirection: 'column',
      }} 
      role="presentation"
    >
      <h2 style={{
        marginTop:"10%",
        color: 'white',
        textAlign: 'center',
        marginBottom: '20px',
        fontSize: "2.5rem",
        fontFamily: "Space Grotesk, sans-serif",
        fontWeight: "700",
      }}>
        <span style={{ color:"#00ED64" }}>Vid</span>Trust
      </h2>
      <List sx={{ flexGrow: 1 }}>
        {[
          { text: 'Upload Videos', icon: <DriveFolderUploadIcon /> },
          { text: 'Existing Videos', icon: <VideoLibraryIcon /> }
        ].map((item, index) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => updateSelectedItem(index)}
              sx={{
                backgroundColor: selectedItem === index ? 'rgba(0, 237, 100, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(0, 237, 100, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#00ED64' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    color: 'white',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 500,
                    fontSize: '1.1rem',
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <Dashboard />
      </Box>
    </Box>
  );

  return (
    <div>
      <Drawer 
        open={open}
        variant="persistent"
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }
        }}
      >
        {DrawerList}
      </Drawer>
    </div>
  );
} 