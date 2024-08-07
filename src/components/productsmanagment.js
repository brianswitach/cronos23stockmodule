import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';

function ProductsManagement() {
  const [showForm, setShowForm] = useState(false);
  const [clientData, setClientData] = useState({
    nombre: '',
    categoria: ''
  });
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/productos');
      setProductos(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await axios.get('http://localhost:3001/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const generateAutoIncrementedCode = () => {
    if (productos.length === 0) return '00001';
    const lastCode = parseInt(productos[productos.length - 1].codigo, 10);
    const newCode = (lastCode + 1).toString().padStart(5, '0');
    return newCode;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSaveProduct = async () => {
    if (!clientData.nombre || !clientData.categoria) {
      alert("Por favor, complete al menos el nombre y la categoría.");
      return;
    }
    const autoCode = generateAutoIncrementedCode();
    try {
      await axios.post('http://localhost:3001/productos', {
        nombre: clientData.nombre,
        categoria: clientData.categoria,
        codigo: autoCode
      });
      setShowForm(false);
      setClientData({ nombre: '', categoria: '' }); // Reset fields after saving
      fetchProductos(); // Refresh product list
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleEdit = (producto) => {
    setOpen(true);
    setCurrentUser(producto);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3001/productos/${currentUser.id}`, { ...currentUser });
      fetchProductos();
      handleClose();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/productos/${id}`);
      fetchProductos();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
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
            <TextField
              name="nombre"
              value={clientData.nombre}
              onChange={handleInputChange}
              label="Nombre"
              variant="outlined"
              fullWidth
              margin="normal"
            />
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveProduct}
              style={{ marginTop: 8 }}
            >
              Guardar Producto
            </Button>
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
              {productos.map((producto) => (
                <TableRow key={producto.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">{producto.codigo}</TableCell>
                  <TableCell>{producto.nombre}</TableCell>
                  <TableCell>{producto.categoria}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => handleEdit(producto)}>Editar</Button>
                    <Button variant="contained" color="secondary" onClick={() => handleDelete(producto.id)} sx={{ marginLeft: 2 }}>Eliminar</Button>
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
