import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box
} from '@mui/material';
import db from '../firebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [editNombre, setEditNombre] = useState('');
  const [editId, setEditId] = useState(null);
  const [open, setOpen] = useState(false);

  const fetchCategorias = useCallback(async () => {
    const categoriasSnapshot = await getDocs(collection(db, 'categorias'));
    const categoriasData = categoriasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCategorias(categoriasData);
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const handleInputChange = (e) => {
    const { value } = e.target;
    setNombre(value);
  };

  const handleSaveCategoria = async () => {
    if (!nombre) {
      alert('Por favor, ingrese un nombre para la categoría.');
      return;
    }
    await addDoc(collection(db, 'categorias'), { nombre });
    setNombre('');
    fetchCategorias();
  };

  const handleEditCategoria = (categoria) => {
    setEditNombre(categoria.nombre);
    setEditId(categoria.id);
    setOpen(true);
  };

  const handleUpdateCategoria = async () => {
    if (!editNombre) {
      alert('Por favor, ingrese un nombre para la categoría.');
      return;
    }
    const categoriaRef = doc(db, 'categorias', editId);
    await updateDoc(categoriaRef, { nombre: editNombre });
    setOpen(false);
    setEditNombre('');
    setEditId(null);
    fetchCategorias();
  };

  const handleDeleteCategoria = async (id) => {
    await deleteDoc(doc(db, 'categorias', id));
    fetchCategorias();
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>Gestión de Categorías</Typography>
        <Box display="flex" alignItems="center">
          <TextField
            label="Nombre"
            value={nombre}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={handleSaveCategoria} style={{ marginLeft: 8, height: '100%' }}>
            Guardar
          </Button>
        </Box>
        <TableContainer component={Paper} style={{ marginTop: 16 }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell>{categoria.nombre}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => handleEditCategoria(categoria)}>Editar</Button>
                    <Button variant="contained" color="secondary" onClick={() => handleDeleteCategoria(categoria.id)} style={{ marginLeft: 8 }}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Editar Categoría</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            value={editNombre}
            onChange={(e) => setEditNombre(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleUpdateCategoria} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default Categorias;
