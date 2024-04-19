import React from 'react';
import { Typography, Button, TextField, Grid } from '@mui/material';

function productsmanagment() {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h4">Gestión de Productos</Typography>
                <TextField label="Nombre del Producto" variant="outlined" fullWidth margin="normal" />
                <TextField label="Precio" variant="outlined" fullWidth margin="normal" />
                <Button variant="contained" color="primary">Agregar Producto</Button>
            </Grid>
        </Grid>
    );
}

export default productsmanagment;
