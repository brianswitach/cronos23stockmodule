import React from 'react';
import { Typography, Card, Grid } from '@mui/material';

function Dashboard() {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Card>
                    <Typography variant="h5">Resumen del Inventario</Typography>
                    {/* Contenido del resumen del inventario */}
                </Card>
            </Grid>
        </Grid>
    );
}

export default Dashboard;
