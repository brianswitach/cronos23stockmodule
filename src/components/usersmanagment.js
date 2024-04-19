import React, { useState, useEffect } from 'react';
import { Typography, Button, TextField, Grid, Box } from '@mui/material';
import db from '../firebaseConfig'; // Asegúrate que la ruta sea correcta
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

function UsersManagement() {
    const [showForm, setShowForm] = useState(false);
    const [clientData, setClientData] = useState({
        codigo: '',
        razonSocial: '',
        direccion: '',
        formaEntrega: '',
        detalleCliente: '',
        zona: '',
        cobranza: '',
        activo: ''
    });
    const [nextClientId, setNextClientId] = useState(1);

    useEffect(() => {
        const fetchNextClientId = async () => {
            const q = query(collection(db, "clientes"), orderBy("codigo", "desc"), limit(1));
            const querySnapshot = await getDocs(q);
            const lastClient = querySnapshot.docs.map(doc => doc.data())[0];
            if (lastClient) {
                setNextClientId(parseInt(lastClient.codigo) + 1);
            } else {
                setNextClientId(1); // Inicia desde 1 si no hay clientes
            }
        };
        fetchNextClientId();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setClientData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSaveClient = async () => {
        await addDoc(collection(db, "clientes"), {
            ...clientData,
            codigo: nextClientId // Utilizar el siguiente ID disponible
        });
        setShowForm(false);
        setClientData({ // Limpiar todos los campos después de guardar
            codigo: '',
            razonSocial: '',
            direccion: '',
            formaEntrega: '',
            detalleCliente: '',
            zona: '',
            cobranza: '',
            activo: ''
        });
        setNextClientId(nextClientId + 1); // Incrementar el ID para el próximo cliente
        alert("Información guardada con éxito"); // Mostrar alerta de éxito
    };

    const toggleForm = () => {
        setShowForm(!showForm);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h4">Gestión de Usuarios</Typography>
                <Button variant="outlined" color="secondary" onClick={toggleForm}>
                    {showForm ? 'Cancelar' : 'Agregar Cliente'}
                </Button>
                {showForm && (
                    <Box mt={2} width="100%">
                        <TextField name="codigo" value={clientData.codigo} onChange={handleInputChange} label="Código" variant="outlined" fullWidth margin="normal" />
                        <TextField name="razonSocial" value={clientData.razonSocial} onChange={handleInputChange} label="Razón Social" variant="outlined" fullWidth margin="normal" />
                        <TextField name="direccion" value={clientData.direccion} onChange={handleInputChange} label="Dirección" variant="outlined" fullWidth margin="normal" />
                        <TextField name="formaEntrega" value={clientData.formaEntrega} onChange={handleInputChange} label="Forma de Entrega" variant="outlined" fullWidth margin="normal" />
                        <TextField name="detalleCliente" value={clientData.detalleCliente} onChange={handleInputChange} label="Detalle del Cliente" variant="outlined" fullWidth margin="normal" />
                        <TextField name="zona" value={clientData.zona} onChange={handleInputChange} label="Zona" variant="outlined" fullWidth margin="normal" />
                        <TextField name="cobranza" value={clientData.cobranza} onChange={handleInputChange} label="Cobranza" variant="outlined" fullWidth margin="normal" />
                        <TextField name="activo" value={clientData.activo} onChange={handleInputChange} label="Activo" variant="outlined" fullWidth margin="normal" />
                        <Button variant="contained" color="primary" onClick={handleSaveClient} style={{ marginTop: 8 }}>Guardar Cliente</Button>
                    </Box>
                )}
            </Grid>
        </Grid>
    );
}

export default UsersManagement;
