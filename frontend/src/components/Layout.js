import React, { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Computer as ComputerIcon,
  History as HistoryIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import logo from '../logo.jpg'

const drawerWidth = 240;

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));

const DrawerStyled = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
}));

export default function Layout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, handleLogout } = useContext(AuthContext);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBarStyled position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Учет компьютеров ТНИМЦ
          </Typography>
          <Box
            component="img"
            src={logo}
            alt="Логотип"
            sx={{
              height: 70,
              marginLeft: 'auto',
              padding: 1, 
              borderRadius: 4.8,
            }}
          />
        </Toolbar>
      </AppBarStyled>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <DrawerStyled
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          <DrawerContent handleNavigation={handleNavigation} isAuthenticated={isAuthenticated} handleLogout={handleLogoutClick} />
        </DrawerStyled>
        <DrawerStyled
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          <DrawerContent handleNavigation={handleNavigation} isAuthenticated={isAuthenticated} handleLogout={handleLogoutClick} />
        </DrawerStyled>
      </Box>
      <Main>
        <Toolbar /> {/* Это добавляет отступ под AppBar */}
        <Outlet />
      </Main>
    </Box>
  );
}

function DrawerContent({ handleNavigation, isAuthenticated, handleLogout }) {
  const { profile, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <CircularProgress />;
  }

  const isAuditor = profile?.role === 'auditor';
  
  return (
    <>
      <Toolbar />
      <Divider />
      <List>
        {!isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/login')}>
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary="Войти" />
              </ListItemButton>
            </ListItem>
            {/* <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/register')}>
                <ListItemIcon>
                  <RegisterIcon />
                </ListItemIcon>
                <ListItemText primary="Зарегистрироваться" />
              </ListItemButton>
            </ListItem> */}
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/computers')}>
                <ListItemIcon>
                  <ComputerIcon />
                </ListItemIcon>
                <ListItemText primary="Компьютеры" />
              </ListItemButton>
            </ListItem>
            {!isAuditor && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigation('/changes')}>
                  <ListItemIcon><HistoryIcon /></ListItemIcon>
                  <ListItemText primary="История изменений" />
                </ListItemButton>
              </ListItem>
            )}
          </>
        )}
      </List>
      <Divider />
      {isAuthenticated && (
        <List>
          {/* <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/settings')}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Настройки" />
            </ListItemButton>
          </ListItem> */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Выход" />
            </ListItemButton>
          </ListItem>
        </List>
      )}
    </>
  );
}