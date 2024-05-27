import React, { useState } from 'react';
import { Typography, Button, TextField, Grid, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import db from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

function UsersManagement() {
    const [showForm, setShowForm] = useState(false);
    const [clientData, setClientData] = useState({
        codigo: '',
        nombre: '',
        categoria: '',
        acciones: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setClientData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSaveClient = async () => {
        if (!clientData.codigo || !clientData.nombre) {
            alert("Por favor, complete al menos el código y el nombre.");
            return;
        }
        await addDoc(collection(db, "clientes"), {
            ...clientData
        });
        setShowForm(false);
        setClientData({ // Reset fields after saving
            codigo: '',
            nombre: '',
            categoria: '',
            acciones: ''
        });
        alert("Cliente guardado con éxito");
    };

    const toggleForm = () => {
        setShowForm(!showForm);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h4">Gestión de Productos</Typography>
                <Button variant="outlined" color="secondary" onClick={toggleForm}>
                    {showForm ? 'Cancelar' : 'Agregar Producto'}
                </Button>
                <Button variant="outlined" color="primary" component={Link} to="/gestion-productos" style={{ marginLeft: 8 }}>
                    Ver Productos
                </Button>
                {showForm && (
                    <Box mt={2} width="100%">
                        <TextField name="codigo" value={clientData.codigo} onChange={handleInputChange} label="Código" variant="outlined" fullWidth margin="normal" />
                        <TextField name="nombre" value={clientData.nombre} onChange={handleInputChange} label="Nombre" variant="outlined" fullWidth margin="normal" />
                        <TextField name="categoria" value={clientData.categoria} onChange={handleInputChange} label="Categoría" variant="outlined" fullWidth margin="normal" />
                        <Button variant="contained" color="primary" onClick={handleSaveClient} style={{ marginTop: 8 }}>Guardar Producto</Button>
                    </Box>
                )}
            </Grid>
        </Grid>
    );
}

export default UsersManagement;
