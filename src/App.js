import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button } from '@mui/material';
import UsersManagement from './components/usersmanagment';
import ProductsManagement from './components/productsmanagment';
import CategoriesManagement from './components/categoriesmanagment';
import DepositsManagement from './components/depositsmanagment';
import TransfersManagement from './components/transfersmanagment';
import CrearMovimientos from './components/crearmovimientos';
import InventarioPorDeposito from './components/inventariopordeposito';
import ProductID from './components/ProductID'; // Importa el nuevo componente

function App() {
    return (
        <Router>
            <div style={{ padding: 20 }}>
                {/* Botones de Navegación con márgenes */}
                <Button variant="contained" color="primary" component={Link} to="/gestion-usuarios" sx={{ margin: 1 }}>Gestión de Usuarios</Button>
                <Button variant="contained" color="primary" component={Link} to="/gestion-productos" sx={{ margin: 1 }}>Gestión de Productos</Button>
                <Button variant="contained" color="primary" component={Link} to="/gestion-categorias" sx={{ margin: 1 }}>Gestión de Categorías</Button>
                <Button variant="contained" color="primary" component={Link} to="/gestion-depositos" sx={{ margin: 1 }}>Maestro de Depósitos</Button>
                <Button variant="contained" color="primary" component={Link} to="/transferencias-depositos" sx={{ margin: 1 }}>Transferencias entre Depósitos</Button>
                <Button variant="contained" color="primary" component={Link} to="/crear-movimientos" sx={{ margin: 1 }}>Crear Movimientos</Button>
                <Button variant="contained" color="primary" component={Link} to="/inventario-por-deposito" sx={{ margin: 1 }}>Inventario por Depósito</Button>
                <Button variant="contained" color="primary" component={Link} to="/productid" sx={{ margin: 1 }}>Carga de IDs</Button> {/* Botón nuevo para navegar a ProductID */}

                {/* Rutas */}
                <Routes>
                    <Route path="/gestion-usuarios" element={<UsersManagement />} />
                    <Route path="/gestion-productos" element={<ProductsManagement />} />
                    <Route path="/gestion-categorias" element={<CategoriesManagement />} />
                    <Route path="/gestion-depositos" element={<DepositsManagement />} />
                    <Route path="/transferencias-depositos" element={<TransfersManagement />} />
                    <Route path="/crear-movimientos" element={<CrearMovimientos />} />
                    <Route path="/inventario-por-deposito" element={<InventarioPorDeposito />} />
                    <Route path="/productid" element={<ProductID />} /> {/* Ruta nueva para ProductID */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
