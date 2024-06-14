import React, { useState, useEffect } from 'react';
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
  Box,
  Divider
} from '@mui/material';
import db from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

function Reports() {
  const [inventario, setInventario] = useState([]);
  const [inventarioPorDeposito, setInventarioPorDeposito] = useState([]);

  useEffect(() => {
    fetchInventario();
    fetchInventarioPorDeposito();
  }, []);

  const fetchInventario = async () => {
    const querySnapshot = await getDocs(collection(db, 'inventario'));
    const inventarioData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setInventario(inventarioData);
  };

  const fetchInventarioPorDeposito = async () => {
    const querySnapshot = await getDocs(collection(db, 'inventario'));
    const inventarioData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const groupedData = inventarioData.reduce((acc, item) => {
      if (!acc[item.deposito]) {
        acc[item.deposito] = 0;
      }
      acc[item.deposito] += item.cantidad;
      return acc;
    }, {});

    const formattedData = Object.keys(groupedData).map(deposito => ({
      deposito,
      cantidad: groupedData[deposito]
    }));

    setInventarioPorDeposito(formattedData);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>Inventario General</Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Código PR</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventario.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.codigoPR}</TableCell>
                  <TableCell>{item.nombre}</TableCell>
                  <TableCell>{item.categoria}</TableCell>
                  <TableCell>{item.cantidad}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="secondary">Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item xs={12}>
        <Divider sx={{ marginY: 2 }} />
        <Typography variant="h4" gutterBottom>Inventario por Depósitos</Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Depósito</TableCell>
                <TableCell>Cantidad de Items</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventarioPorDeposito.map(item => (
                <TableRow key={item.deposito}>
                  <TableCell>{item.deposito}</TableCell>
                  <TableCell>{item.cantidad}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}

export default Reports;
