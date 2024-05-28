import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Typography, Box, CssBaseline, Toolbar, AppBar } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import StoreIcon from '@mui/icons-material/Store';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ProductsManagement from './components/productsmanagment';
import CategoriesManagement from './components/categoriesmanagment';
import DepositsManagement from './components/depositsmanagment';
import TransfersManagement from './components/transfersmanagment';
import CrearMovimientos from './components/crearmovimientos';
import InventarioPorDeposito from './components/inventariopordeposito';
import ProductID from './components/ProductID';
import InventarioGeneral from './components/inventariogeneral';
import Categorias from './components/categorias'; // Importa el nuevo componente

const drawerWidth = 240;

function App() {
  return (
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
              <Typography variant="h6" sx={{ padding: 2 }}>Operaciones</Typography>
              <ListItem button component={Link} to="/transferencias-depositos">
                <ListItemIcon><TransferWithinAStationIcon /></ListItemIcon>
                <ListItemText primary="Transferencias entre Depósitos" />
              </ListItem>
            </List>
            <Divider />
            <List>
              <Typography variant="h6" sx={{ padding: 2 }}>Reportes</Typography>
              <ListItem button component={Link} to="/inventario-general">
                <ListItemIcon><AssignmentIcon /></ListItemIcon>
                <ListItemText primary="Inventario General" />
              </ListItem>
              <ListItem button component={Link} to="/inventario-por-deposito">
                <ListItemIcon><AssignmentIcon /></ListItemIcon>
                <ListItemText primary="Inventario por Depósito" />
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
            <Route path="/transferencias-depositos" element={<TransfersManagement />} />
            <Route path="/crear-movimientos" element={<CrearMovimientos />} />
            <Route path="/inventario-por-deposito" element={<InventarioPorDeposito />} />
            <Route path="/productid" element={<ProductID />} />
            <Route path="/inventario-general" element={<InventarioGeneral />} />
            <Route path="/categorias" element={<Categorias />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
