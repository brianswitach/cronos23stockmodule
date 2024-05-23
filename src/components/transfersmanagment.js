import React, { useState, useEffect } from 'react';
import { Typography, Button, TextField, Grid, Divider, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import db from '../firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function TransfersManagement() {
    const [origen, setOrigen] = useState('');
    const [destino, setDestino] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [balances, setBalances] = useState({ deposito1: 0, deposito2: 0 });
    const [historialTransferencias, setHistorialTransferencias] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const querySnapshot = await getDocs(collection(db, "transferencias"));
            const data = querySnapshot.docs.map(doc => doc.data());
            if (data.length > 0) {
                const latest = data[data.length - 1];
                setBalances(latest.balances);
                setHistorialTransferencias(latest.historial);
            }
        };
        loadData();
    }, []);

    const handleOrigenChange = (event) => {
        setOrigen(event.target.value);
    };

    const handleDestinoChange = (event) => {
        setDestino(event.target.value);
    };

    const handleCantidadChange = (event) => {
        setCantidad(Number(event.target.value));
    };

    const realizarTransferencia = () => {
        if (origen && destino && cantidad && origen !== destino) {
            const newBalances = { ...balances };
            newBalances[origen] -= cantidad;
            newBalances[destino] += cantidad;
            const newHistorial = [
                ...historialTransferencias,
                `Depósito ${origen.slice(-1)} envió $${cantidad} a Depósito ${destino.slice(-1)}`
            ];

            // Actualizar Firestore
            const newEntry = {
                balances: newBalances,
                historial: newHistorial,
                timestamp: new Date()
            };
            addDoc(collection(db, "transferencias"), newEntry);

            // Actualizar estado local
            setBalances(newBalances);
            setHistorialTransferencias(newHistorial);
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h4">Transferencias entre Depósitos</Typography>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="origen-label">Depósito Origen</InputLabel>
                    <Select value={origen} onChange={handleOrigenChange} label="Depósito Origen">
                        <MenuItem value="deposito1">Depósito 1</MenuItem>
                        <MenuItem value="deposito2">Depósito 2</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="destino-label">Depósito Destino</InputLabel>
                    <Select value={destino} onChange={handleDestinoChange} label="Depósito Destino">
                        <MenuItem value="deposito1">Depósito 1</MenuItem>
                        <MenuItem value="deposito2">Depósito 2</MenuItem>
                    </Select>
                </FormControl>
                <TextField label="Cantidad" type="number" value={cantidad} onChange={handleCantidadChange} variant="outlined" fullWidth margin="normal" />
                <Button variant="contained" color="primary" onClick={realizarTransferencia}>Realizar Transferencia</Button>
                <Divider style={{ margin: '20px 0' }} />
                <Typography variant="h4">Balances:</Typography>
                <Typography variant="h6">Depósito 1: {balances.deposito1}</Typography>
                <Typography variant="h6">Depósito 2: {balances.deposito2}</Typography>
                <Divider style={{ margin: '20px 0' }} />
                <Typography variant="h4">Historial de Transferencias:</Typography>
                {historialTransferencias.map((transferencia, index) => (
                    <Typography key={index}>{transferencia}</Typography>
                ))}
            </Grid>
        </Grid>
    );
}

export default TransfersManagement;
