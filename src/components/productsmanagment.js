import React, { useState, useEffect } from 'react';
import { Typography, Grid, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import db from '../firebaseConfig';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

function ProductsManagement() {
    const [usuarios, setUsuarios] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Definir la función fetchUsuarios dentro del componente
    const fetchUsuarios = async () => {
        const querySnapshot = await getDocs(collection(db, "clientes"));
        const userList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setUsuarios(userList);
    };

    useEffect(() => {
        fetchUsuarios();  // Llamar a fetchUsuarios correctamente
    }, []);

    const handleEdit = (usuario) => {
        setOpen(true);
        setCurrentUser(usuario);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleUpdate = async () => {
        const userRef = doc(db, "clientes", currentUser.id);
        await updateDoc(userRef, { ...currentUser });
        fetchUsuarios();  // Llamar a fetchUsuarios correctamente
        handleClose();
    };

    const handleDelete = async (id) => {
        await deleteDoc(doc(db, "clientes", id));
        fetchUsuarios();  // Llamar a fetchUsuarios correctamente
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentUser({ ...currentUser, [name]: value });
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>Gestión de Usuarios</Typography>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Código</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Categoría</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usuarios.map((usuario) => (
                                <TableRow key={usuario.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">{usuario.codigo}</TableCell>
                                    <TableCell>{usuario.nombre}</TableCell>
                                    <TableCell>{usuario.categoria || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="primary" onClick={() => handleEdit(usuario)}>Editar</Button>
                                        <Button variant="contained" color="secondary" onClick={() => handleDelete(usuario.id)} sx={{ marginLeft: 2 }}>Eliminar</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            {open && (
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Código"
                            type="text"
                            fullWidth
                            name="codigo"
                            value={currentUser.codigo}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            label="Nombre"
                            type="text"
                            fullWidth
                            name="nombre"
                            value={currentUser.nombre}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            label="Categoría"
                            type="text"
                            fullWidth
                            name="categoria"
                            value={currentUser.categoria}
                            onChange={handleChange}
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

export default ProductsManagement;
