import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider
} from '@mui/material';
import { collection, getDocs, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import db from '../firebaseConfig';
import emailjs from 'emailjs-com'; // Importa EmailJS
import { doc } from 'firebase/firestore';


function CrearMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [inventarioGeneral, setInventarioGeneral] = useState([]);
  const [movimiento, setMovimiento] = useState({
    codigoPR: '',
    deposito: '',
    operacion: '',
    cantidad: ''
  });

  const fetchDatos = useCallback(async () => {
    const [usuariosSnapshot, depositosSnapshot, movimientosSnapshot] = await Promise.all([
      getDocs(collection(db, "clientes")),
      getDocs(collection(db, "depositos")),
      getDocs(collection(db, "movimientos"))
    ]);

    const clientesData = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const depositosData = depositosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const movimientosData = movimientosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    setClientes(clientesData);
    setDepositos(depositosData.filter(deposito => deposito.codigoDP)); // Filtrar solo los depósitos válidos
    setMovimientos(movimientosData);

    const inventario = movimientosData.reduce((acc, item) => {
      const key = `${item.codigoPR}-${item.deposito}`;
      if (!acc[key]) {
        acc[key] = 0;
      }
      if (item.operacion === "Alta") {
        acc[key] += item.cantidad;
      } else if (item.operacion === "Baja") {
        acc[key] -= item.cantidad;
      }
      return acc;
    }, {});

    const inventarioArray = Object.keys(inventario).map(key => {
      const [codigoPR, deposito] = key.split("-");
      return {
        codigoPR,
        deposito,
        cantidad: inventario[key]
      };
    });

    setInventarioGeneral(inventarioArray);
  }, []);

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMovimiento(prev => ({ ...prev, [name]: value }));
  };

  const sendEmail = (movimiento) => {
    const templateParams = {
      codigoPR: movimiento.codigoPR,
      deposito: movimiento.deposito,
      operacion: movimiento.operacion,
      cantidad: movimiento.cantidad,
      fechaHora: new Date().toLocaleString(),
      from_name: 'Brian'
    };

    emailjs.send('service_t2ejr4m', 'template_l9ld2pk', templateParams, 'LIKjfdvKCHMrIvJH9')
      .then((response) => {
        console.log('Correo enviado con éxito!', response.status, response.text);
      }, (error) => {
        console.log('Error al enviar el correo:', error);
      });
  };

  const handleSubmit = async () => {
    if (!movimiento.codigoPR || !movimiento.deposito || !movimiento.operacion || !movimiento.cantidad) {
      alert("Por favor, complete todos los campos del formulario.");
      return;
    }

    const inventarioProducto = inventarioGeneral.find(item => item.codigoPR === movimiento.codigoPR && item.deposito === movimiento.deposito);
    const cantidadDisponible = inventarioProducto ? inventarioProducto.cantidad : 0;

    if (movimiento.operacion === "Baja" && cantidadDisponible < parseInt(movimiento.cantidad, 10)) {
      alert("No puede dar de baja una cantidad de productos mayor a que hay en stock.");
      return;
    }

    const newMovimiento = {
      ...movimiento,
      cantidad: parseInt(movimiento.cantidad, 10),
      fechaHora: new Date().toISOString()
    };

    await addDoc(collection(db, "movimientos"), newMovimiento);
    alert("Movimiento creado con éxito.");
    sendEmail(newMovimiento); // Enviar el correo electrónico
    setMovimiento({ codigoPR: '', deposito: '', operacion: '', cantidad: '' });
    fetchDatos();
  };

  const handleDeleteMovimiento = async (id) => {
    await deleteDoc(doc(db, "movimientos", id));
    fetchDatos();
  };

  const sortMovimientos = (order) => {
    const sortedMovimientos = [...movimientos].sort((a, b) => {
      if (order === 'asc') {
        return new Date(a.fechaHora) - new Date(b.fechaHora);
      } else {
        return new Date(b.fechaHora) - new Date(a.fechaHora);
      }
    });
    setMovimientos(sortedMovimientos);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>Gestión de Movimientos</Typography>
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
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ marginTop: 2 }}>
          Guardar
        </Button>
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ marginY: 2 }} />
        <Typography variant="h4" gutterBottom>Movimientos:</Typography>
        <Button variant="contained" onClick={() => sortMovimientos('asc')}>Ordenar por Fecha Ascendente</Button>
        <Button variant="contained" onClick={() => sortMovimientos('desc')} sx={{ marginLeft: 2 }}>Ordenar por Fecha Descendente</Button>
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Código PR</TableCell>
                <TableCell>Depósito</TableCell>
                <TableCell>Operación</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Fecha y Hora</TableCell>
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
                  <TableCell>{new Date(mov.fechaHora).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="secondary" onClick={() => handleDeleteMovimiento(mov.id)}>Eliminar</Button>
                  </TableCell>
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
