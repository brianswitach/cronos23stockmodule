import React, { useState, useEffect } from 'react';
import { Typography, Button, TextField, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, Paper } from '@mui/material';
import db from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';

function DepositsManagement() {
    const [depositos, setDepositos] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentDeposito, setCurrentDeposito] = useState({ codigoDP: '', nombre: '' });

    useEffect(() => {
        fetchDepositos();
    }, []);

    const fetchDepositos = async () => {
        const querySnapshot = await getDocs(collection(db, "depositos"));
        const depositsList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setDepositos(depositsList);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentDeposito({ ...currentDeposito, [name]: value });
    };

    const handleAddDeposito = async () => {
        if (!currentDeposito.codigoDP || !currentDeposito.nombre) {
            alert("Por favor, complete todos los campos.");
            return;
        }
        await addDoc(collection(db, "depositos"), currentDeposito);
        fetchDepositos();
        setCurrentDeposito({ codigoDP: '', nombre: '' });  // Reset fields
    };

    const handleEdit = (deposito) => {
        setOpen(true);
        setCurrentDeposito(deposito);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentDeposito({ codigoDP: '', nombre: '' });
    };

    const handleUpdate = async () => {
        const depositoRef = doc(db, "depositos", currentDeposito.id);
        await updateDoc(depositoRef, currentDeposito);
        fetchDepositos();
        handleClose();
    };

    const handleDelete = async (id) => {
        await deleteDoc(doc(db, "depositos", id));
        fetchDepositos();
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h4">Gestión de Depósitos</Typography>
                <TextField
                    label="Código DP"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    name="codigoDP"
                    value={currentDeposito.codigoDP}
                    onChange={handleInputChange}
                />
                <TextField
                    label="Nombre"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    name="nombre"
                    value={currentDeposito.nombre}
                    onChange={handleInputChange}
                />
                <Button variant="contained" color="primary" onClick={handleAddDeposito}>Agregar Depósito</Button>
                <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Código DP</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {depositos.map((deposito) => (
                                <TableRow key={deposito.id}>
                                    <TableCell>{deposito.codigoDP}</TableCell>
                                    <TableCell>{deposito.nombre}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="primary" onClick={() => handleEdit(deposito)} sx={{ mr: 1 }}>Editar</Button>
                                        <Button variant="contained" color="secondary" onClick={() => handleDelete(deposito.id)}>Eliminar</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            {open && (
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Editar Depósito</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Código DP"
                            type="text"
                            fullWidth
                            name="codigoDP"
                            value={currentDeposito.codigoDP}
                            onChange={handleInputChange}
                        />
                        <TextField
                            margin="dense"
                            label="Nombre"
                            type="text"
                            fullWidth
                            name="nombre"
                            value={currentDeposito.nombre}
                            onChange={handleInputChange}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancelar</Button>
                        <Button onClick={handleUpdate}>Guardar</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Grid>
    );
}

export default DepositsManagement;
