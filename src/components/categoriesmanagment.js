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
  Box,
} from '@mui/material';
import axios from 'axios';

function CategoriesManagement() {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [editNombre, setEditNombre] = useState('');
  const [editId, setEditId] = useState(null);
  const [open, setOpen] = useState(false);

  const fetchCategorias = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/categorias');
      setCategorias(response.data);
      console.log("Categorías actualizadas:", response.data); // Depuración
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
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
    try {
      console.log("Enviando datos:", { nombre }); // Depuración
      await axios.post('http://localhost:3001/categorias', { nombre });
      setNombre('');
      await fetchCategorias(); // Actualizar la lista de categorías después de guardar
    } catch (error) {
      console.error("Error saving category:", error);
    }
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
    try {
      await axios.put(`http://localhost:3001/categorias/${editId}`, { nombre: editNombre });
      setOpen(false);
      setEditNombre('');
      setEditId(null);
      await fetchCategorias(); // Actualizar la lista de categorías después de actualizar
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategoria = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/categorias/${id}`);
      await fetchCategorias(); // Actualizar la lista de categorías después de eliminar
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Gestión de Categorías
        </Typography>
        <Box display="flex" alignItems="center">
          <TextField
            label="Nombre"
            value={nombre}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveCategoria}
            sx={{ marginLeft: 2, height: '100%' }}
          >
            Guardar
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categorias.length > 0 ? (
                categorias.map((categoria) => (
                  <TableRow key={categoria.id}>
                    <TableCell>{categoria.nombre}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleEditCategoria(categoria)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDeleteCategoria(categoria.id)}
                        sx={{ marginLeft: 2 }}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No hay categorías disponibles.
                  </TableCell>
                </TableRow>
              )}
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

export default CategoriesManagement;
