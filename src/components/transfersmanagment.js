import React from 'react';
import { Typography, Button, TextField, Grid, Select, MenuItem } from '@mui/material';

function transfersmanagment() {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h4">Transferencias entre Depósitos</Typography>
                <Select fullWidth label="Depósito Origen">
                    <MenuItem value="deposito1">Depósito 1</MenuItem>
                    <MenuItem value="deposito2">Depósito 2</MenuItem>
                </Select>
                <Select fullWidth label="Depósito Destino">
                    <MenuItem value="deposito1">Depósito 1</MenuItem>
                    <MenuItem value="deposito2">Depósito 2</MenuItem>
                </Select>
                <TextField label="Cantidad" variant="outlined" fullWidth margin="normal" />
                <Button variant="contained" color="primary">Realizar Transferencia</Button>
            </Grid>
        </Grid>
    );
}

export default transfersmanagment
