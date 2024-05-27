import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from '@mui/material';
import db from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

function InventarioGeneral() {
  const [inventario, setInventario] = useState([]);

  const fetchDatos = useCallback(async () => {
    const [usuariosSnapshot, movimientosSnapshot] = await Promise.all([
      getDocs(collection(db, "clientes")),
      getDocs(collection(db, "movimientos"))
    ]);

    const clientesData = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const movimientosData = movimientosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    calcularInventario(clientesData, movimientosData);
  }, []);

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

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

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>Inventario General</Typography>
        <Divider style={{ margin: '20px 0' }} />
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

export default InventarioGeneral;
