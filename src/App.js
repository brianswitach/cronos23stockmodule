import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, Divider,
  Typography, Box, CssBaseline, Toolbar, AppBar, ThemeProvider, createTheme
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import StoreIcon from '@mui/icons-material/Store';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ProductsManagement from './components/productsmanagment';
import CategoriesManagement from './components/categoriesmanagment';
import DepositsManagement from './components/depositsmanagment';
import CrearMovimientos from './components/crearmovimientos';
import ProductID from './components/ProductID';
import InventarioGeneral from './components/inventariogeneral';
import Categorias from './components/categorias';
import Reports from './components/Reports';
import axios from 'axios';

const drawerWidth = 240;

// Crea un tema basado en Material 3
const theme = createTheme({
  palette: {
    primary: {
      main: '#6200ea',
    },
    secondary: {
      main: '#03dac6',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/data', { name, value });
      console.log('Data inserted:', response.data);
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" noWrap component="div">
                Crono23
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
          >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
              <List>
                <Typography variant="h6" sx={{ padding: 2 }}>Gestores</Typography>
                <ListItem button component={Link} to="/gestion-productos">
                  <ListItemIcon><InventoryIcon /></ListItemIcon>
                  <ListItemText primary="Gestión de Productos" />
                </ListItem>
                <ListItem button component={Link} to="/gestion-categorias">
                  <ListItemIcon><CategoryIcon /></ListItemIcon>
                  <ListItemText primary="Gestión de Categorías" />
                </ListItem>
                <ListItem button component={Link} to="/gestion-depositos">
                  <ListItemIcon><StoreIcon /></ListItemIcon>
                  <ListItemText primary="Gestión de Depósitos" />
                </ListItem>
                <ListItem button component={Link} to="/crear-movimientos">
                  <ListItemIcon><AssignmentIcon /></ListItemIcon>
                  <ListItemText primary="Gestión de Movimientos" />
                </ListItem>
                <ListItem button component={Link} to="/productid">
                  <ListItemIcon><AssignmentIcon /></ListItemIcon>
                  <ListItemText primary="Gestión de IDs" />
                </ListItem>
              </List>
              <Divider />
              <List>
                <Typography variant="h6" sx={{ padding: 2 }}>Reportes</Typography>
                <ListItem button component={Link} to="/inventario-general">
                  <ListItemIcon><AssignmentIcon /></ListItemIcon>
                  <ListItemText primary="Inventario General" />
                </ListItem>
                <ListItem button component={Link} to="/reportes">
                  <ListItemIcon><AssignmentIcon /></ListItemIcon>
                  <ListItemText primary="Reportes" />
                </ListItem>
              </List>
            </Box>
          </Drawer>
          <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
            <Toolbar />
            <Routes>
              <Route path="/gestion-productos" element={<ProductsManagement />} />
              <Route path="/gestion-categorias" element={<CategoriesManagement />} />
              <Route path="/gestion-depositos" element={<DepositsManagement />} />
              <Route path="/crear-movimientos" element={<CrearMovimientos />} />
              <Route path="/productid" element={<ProductID />} />
              <Route path="/inventario-general" element={<InventarioGeneral />} />
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/reportes" element={<Reports />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
 