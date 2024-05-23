import React, { useState } from 'react';
import { Typography, Button, TextField, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import db from '../firebaseConfig'; // Asegúrate de que la ruta sea correcta
import { collection, addDoc } from 'firebase/firestore';

function CategoriesManagement() {
    const [userData, setUserData] = useState({
        nombre: '',
        rol: ''
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUserData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSaveUser = async () => {
        if (!userData.nombre || !userData.rol) {
            alert('Por favor, complete todos los campos.');
            return;
        }
        await addDoc(collection(db, "usuarios"), userData);
        setUserData({ nombre: '', rol: '' });
        alert('Usuario creado con éxito');
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h4">Gestión de Usuarios</Typography>
                <TextField
                    label="Nombre del Usuario"
                    name="nombre"
                    value={userData.nombre}
                    onChange={handleInputChange}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="rol-label">Rol del Usuario</InputLabel>
                    <Select
                        labelId="rol-label"
                        name="rol"
                        value={userData.rol}
                        onChange={handleInputChange}
                        label="Rol del Usuario"
                    >
                        <MenuItem value="Comprador">Comprador</MenuItem>
                        <MenuItem value="Gestor de Depósito">Gestor de Depósito</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveUser}
                >
                    Crear Usuario
                </Button>
            </Grid>
        </Grid>
    );
}

export default CategoriesManagement;
