import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button } from '@mui/material';
import Dashboard from './dashboard';
import UsersManagement from './components/usersmanagment';
import ProductsManagement from './components/productsmanagment';
import CategoriesManagement from './components/categoriesmanagment';
import DepositsManagement from './components/depositsmanagment';
import TransfersManagement from './components/transfersmanagment';

function App() {
    return (
        <Router>
            <div style={{ padding: 20 }}> {/* Puedes ajustar el padding general del contenedor aquí */}
                {/* Botones de Navegación con márgenes */}
                <Button variant="contained" color="primary" component={Link} to="/" sx={{ margin: 1 }}>Dashboard</Button>
                <Button variant="contained" color="primary" component={Link} to="/gestion-usuarios" sx={{ margin: 1 }}>Gestión de Usuarios</Button>
                <Button variant="contained" color="primary" component={Link} to="/gestion-productos" sx={{ margin: 1 }}>Gestión de Productos</Button>
                <Button variant="contained" color="primary" component={Link} to="/gestion-categorias" sx={{ margin: 1 }}>Gestión de Categorías</Button>
                <Button variant="contained" color="primary" component={Link} to="/gestion-depositos" sx={{ margin: 1 }}>Gestión de Depósitos</Button>
                <Button variant="contained" color="primary" component={Link} to="/transferencias-depositos" sx={{ margin: 1 }}>Transferencias entre Depósitos</Button>

                {/* Rutas */}
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/gestion-usuarios" element={<UsersManagement />} />
                    <Route path="/gestion-productos" element={<ProductsManagement />} />
                    <Route path="/gestion-categorias" element={<CategoriesManagement />} />
                    <Route path="/gestion-depositos" element={<DepositsManagement />} />
                    <Route path="/transferencias-depositos" element={<TransfersManagement />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

