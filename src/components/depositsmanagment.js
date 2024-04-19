import React from 'react';
import { Typography, Button, TextField, Grid } from '@mui/material';

function depositsmanagment() {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h4">Gestión de Depósitos</Typography>
                <TextField label="Nombre del Depósito" variant="outlined" fullWidth margin="normal" />
                <Button variant="contained" color="primary">Agregar Depósito</Button>
            </Grid>
        </Grid>
    );
}

export default depositsmanagment;
