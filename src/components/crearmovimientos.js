import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import db from '../firebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

function CrearMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [movimiento, setMovimiento] = useState({
    codigoPR: '',
    deposito: '',
    operacion: '',
    cantidad: ''
  });
  const [editMov, setEditMov] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    const [usuariosSnapshot, depositosSnapshot, movimientosSnapshot] = await Promise.all([
      getDocs(collection(db, "clientes")),
      getDocs(collection(db, "depositos")),
      getDocs(collection(db, "movimientos"))
    ]);

    const clientesData = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const depositosData = depositosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const movimientosData = movimientosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    setClientes(clientesData);
    setDepositos(depositosData);
    setMovimientos(movimientosData);
    calcularInventario(clientesData, movimientosData);
  };

  const calcularInventario = (clientesData, movimientosData) => {
    let inventarioTemp = clientesData.reduce((acc, cliente) => {
      acc[cliente.codigo] = {
        codigoPR: cliente.codigo,
        nombre: cliente.nombre,
        categoria: cliente.categoria,
        cantidad: 0
      };
      return acc;
    }, {});

    movimientosData.forEach((mov) => {
      if (inventarioTemp[mov.codigoPR]) {
        if (mov.operacion === 'Alta') {
          inventarioTemp[mov.codigoPR].cantidad += Number(mov.cantidad);
        } else if (mov.operacion === 'Baja') {
          inventarioTemp[mov.codigoPR].cantidad -= Number(mov.cantidad);
        }
      }
    });

    setInventario(Object.values(inventarioTemp));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMovimiento(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!movimiento.codigoPR || !movimiento.deposito || !movimiento.operacion || !movimiento.cantidad) {
      alert("Por favor, complete todos los campos del formulario.");
      return;
    }
    await addDoc(collection(db, "movimientos"), movimiento);
    alert("Movimiento creado con éxito.");
    setMovimiento({ codigoPR: '', deposito: '', operacion: '', cantidad: '' });
    fetchDatos();
  };

  const handleOpenEditDialog = (mov) => {
    setEditMov(mov);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditMov(null);
  };

  const handleEditMovimiento = async () => {
    await updateDoc(doc(db, "movimientos", editMov.id), editMov);
    fetchDatos();
    handleCloseEditDialog();
  };

  const handleDeleteMovimiento = async (id) => {
    await deleteDoc(doc(db, "movimientos", id));
    fetchDatos();
  };

  return (
    <Grid container spacing={2}>
      {/* Código para crear movimiento */}
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>Crear Movimiento</Typography>
        <FormControl fullWidth margin="normal">
          <InputLabel id="codigoPR-label">Código PR</InputLabel>
          <Select
            labelId="codigoPR-label"
            value={movimiento.codigoPR}
            label="Código PR"
            onChange={handleInputChange}
            name="codigoPR"
          >
            {clientes.map((cliente) => (
              <MenuItem key={cliente.id} value={cliente.codigo}>
                {cliente.codigo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="deposito-label">Depósito</InputLabel>
          <Select
            labelId="deposito-label"
            value={movimiento.deposito}
            label="Depósito"
            onChange={handleInputChange}
            name="deposito"
          >
            {depositos.map((deposito) => (
              <MenuItem key={deposito.id} value={deposito.nombre}>
                {deposito.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="operacion-label">Operación</InputLabel>
          <Select
            labelId="operacion-label"
            value={movimiento.operacion}
            label="Operación"
            onChange={handleInputChange}
            name="operacion"
          >
            <MenuItem value="Alta">Alta</MenuItem>
            <MenuItem value="Baja">Baja</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Cantidad"
          type="number"
          value={movimiento.cantidad}
          onChange={handleInputChange}
          name="cantidad"
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: 16 }}>
          Guardar
        </Button>
      </Grid>

      {/* Código para mostrar movimientos */}
      <Grid item xs={12}>
        <Divider style={{ margin: '20px 0' }} />
        <Typography variant="h4" gutterBottom>Movimientos:</Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Código PR</TableCell>
                <TableCell>Depósito</TableCell>
                <TableCell>Operación</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientos.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell>{mov.codigoPR}</TableCell>
                  <TableCell>{mov.deposito}</TableCell>
                  <TableCell>{mov.operacion}</TableCell>
                  <TableCell>{mov.cantidad}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => handleOpenEditDialog(mov)} sx={{ marginRight: '8px' }}>Editar</Button>
                    <Button variant="contained" color="secondary" onClick={() => handleDeleteMovimiento(mov.id)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {/* Código para mostrar inventario */}
      <Grid item xs={12}>
        <Divider style={{ margin: '20px 0' }} />
        <Typography variant="h4" gutterBottom>Inventario:</Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Código PR</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Cantidad</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventario.map((inv, index) => (
                <TableRow key={index}>
                  <TableCell>{inv.codigoPR}</TableCell>
                  <TableCell>{inv.nombre}</TableCell>
                  <TableCell>{inv.categoria}</TableCell>
                  <TableCell>{inv.cantidad}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}

export default CrearMovimientos;