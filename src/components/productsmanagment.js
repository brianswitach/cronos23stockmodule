import React, { useState, useEffect } from 'react';
import { Typography, Button, TextField, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import db from '../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore';

function ProductsManagement() {
    const [showForm, setShowForm] = useState(false);
    const [clientData, setClientData] = useState({
        codigo: '',
        nombre: '',
        categoria: '',
        acciones: ''
    });
    const [usuarios, setUsuarios] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const fetchUsuarios = async () => {
        const querySnapshot = await getDocs(collection(db, "clientes"));
        const userList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setUsuarios(userList);
    };

    const fetchCategorias = async () => {
        const querySnapshot = await getDocs(collection(db, "categorias"));
        const categoriasList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setCategorias(categoriasList);
    };

    useEffect(() => {
        fetchUsuarios();
        fetchCategorias();
    }, []);

    const generateAutoIncrementedCode = async () => {
        const q = query(collection(db, "clientes"), orderBy("codigo", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        const lastDoc = querySnapshot.docs[0];
        const lastCode = lastDoc ? parseInt(lastDoc.data().codigo, 10) : 0;
        return (lastCode + 1).toString().padStart(5, '0'); // Rellena con ceros hasta tener 5 dígitos
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setClientData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSaveClient = async () => {
        if (!clientData.nombre || !clientData.categoria) {
            alert("Por favor, complete al menos el nombre y la categoría.");
            return;
        }
        const autoCode = await generateAutoIncrementedCode();
        await addDoc(collection(db, "clientes"), {
            ...clientData,
            codigo: autoCode
        });
        setShowForm(false);
        setClientData({ // Reset fields after saving
            codigo: '',
            nombre: '',
            categoria: '',
            acciones: ''
        });
        alert("Producto guardado con éxito");
        fetchUsuarios();
    };

    const toggleForm = () => {
        setShowForm(!showForm);
    };

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
        fetchUsuarios();
        handleClose();
    };

    const handleDelete = async (id) => {
        await deleteDoc(doc(db, "clientes", id));
        fetchUsuarios();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentUser({ ...currentUser, [name]: value });
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h4">Gestión de Productos</Typography>
                <Button variant="outlined" color="secondary" onClick={toggleForm}>
                    {showForm ? 'Cancelar' : 'Agregar Producto'}
                </Button>
                {showForm && (
                    <Box mt={2} width="100%">
                        <TextField name="nombre" value={clientData.nombre} onChange={handleInputChange} label="Nombre" variant="outlined" fullWidth margin="normal" />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="categoria-label">Categoría</InputLabel>
                            <Select
                                labelId="categoria-label"
                                name="categoria"
                                value={clientData.categoria}
                                onChange={handleInputChange}
                                label="Categoría"
                            >
                                {categorias.map((categoria) => (
                                    <MenuItem key={categoria.id} value={categoria.nombre}>
                                        {categoria.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button variant="contained" color="primary" onClick={handleSaveClient} style={{ marginTop: 8 }}>Guardar Producto</Button>
                    </Box>
                )}
            </Grid>
            <Grid item xs={12}>
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
                    <DialogTitle>Editar Producto</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Código"
                            type="text"
                            fullWidth
                            name="codigo"
                            value={currentUser.codigo}
                            onChange={handleChange}
                            disabled
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
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="categoria-label">Categoría</InputLabel>
                            <Select
                                labelId="categoria-label"
                                name="categoria"
                                value={currentUser.categoria}
                                onChange={handleChange}
                                label="Categoría"
                            >
                                {categorias.map((categoria) => (
                                    <MenuItem key={categoria.id} value={categoria.nombre}>
                                        {categoria.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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
