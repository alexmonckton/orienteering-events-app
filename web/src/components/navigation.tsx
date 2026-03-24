import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";

const pages = [
  { label: "Home", path: "/" },
  { label: "Map", path: "/map" },
  { label: "Contact", path: "/contact" },
];

export default function Navigation({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = pages.findIndex((p) => location.pathname.startsWith(p.path));

  const pageIcons = [
    <i className='fa fa-home' />,
    <i className='fa fa-info' />,
    <i className='fa fa-envelope' />
  ];


  return (
    <>
      <AppBar position="static">
        <Toolbar>

          {/* Left side: App name */}
          <Typography variant="h6">
            O Events
          </Typography>
          <div style={{ flexGrow: 1 }} />
          {/* Desktop buttons */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
            {pages.map((page) => (
              <Button key={page.label} color="inherit" onClick={() => navigate(page.path)}>
                {page.label}
              </Button>
            ))}
          </Box>

        </Toolbar>
      </AppBar>
      <div>
        {children}
      </div>
      {/* Bottom Navigation for Mobile */}
      <Box sx={{
        display: { xs: "block", sm: "none" },
        position: "fixed",      // stick it
        bottom: 0,              // bottom of viewport
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar, // sit above other content
      }}>
        <BottomNavigation
          showLabels
          value={currentIndex === -1 ? 0 : currentIndex} // fallback to first page
          onChange={(event, newValue) => navigate(pages[newValue].path)}
        >
          {pages.map((page, index) => (
            <BottomNavigationAction
              key={page.label}
              label={page.label}
              icon={pageIcons[index]}
            />
          ))}
        </BottomNavigation>
      </Box>
    </>
  );
}