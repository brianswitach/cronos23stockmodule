import React from 'react';
import { Typography, Button, TextField, Grid } from '@mui/material';

function categoriesmanagment() {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h4">Gestión de Categorías</Typography>
                <TextField label="Nombre de Categoría" variant="outlined" fullWidth margin="normal" />
                <Button variant="contained" color="primary">Agregar Categoría</Button>
            </Grid>
        </Grid>
    );
}

export default categoriesmanagment;
