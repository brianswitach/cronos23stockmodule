import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  TextField,
  Grid,
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
  Paper
} from '@mui/material';
import axios from 'axios';

function DepositsManagement() {
  const [depositos, setDepositos] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentDeposito, setCurrentDeposito] = useState({ nombre: '', codigoDP: '' });

  useEffect(() => {
    fetchDepositos();
  }, []);

  const fetchDepositos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/depositos');
      setDepositos(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDeposito({ ...currentDeposito, [name]: value });
  };

  const handleAddDeposito = async () => {
    if (!currentDeposito.nombre) {
      alert('Por favor, complete el nombre.');
      return;
    }
    try {
      await axios.post('http://localhost:3001/depositos', { nombre: currentDeposito.nombre });
      fetchDepositos();
      setCurrentDeposito({ nombre: '', codigoDP: '' });
    } catch (error) {
      console.error('Error adding deposito:', error);
    }
  };

  const handleEdit = (deposito) => {
    setOpen(true);
    setCurrentDeposito(deposito);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentDeposito({ nombre: '', codigoDP: '' });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:3001/depositos/${currentDeposito.id}`, currentDeposito);
      fetchDepositos();
      handleClose();
    } catch (error) {
      console.error('Error updating deposito:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este depósito?')) {
      try {
        await axios.delete(`http://localhost:3001/depositos/${id}`);
        fetchDepositos();
      } catch (error) {
        console.error('Error deleting deposito:', error);
      }
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4">Gestión de Depósitos</Typography>
        <TextField
          label="Nombre"
          variant="outlined"
          fullWidth
          margin="normal"
          name="nombre"
          value={currentDeposito.nombre}
          onChange={handleInputChange}
        />
        <Button variant="contained" color="primary" onClick={handleAddDeposito}>
          Agregar Depósito
        </Button>
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
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEdit(deposito)}
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleDelete(deposito.id)}
                    >
                      Eliminar
                    </Button>
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
              disabled
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
