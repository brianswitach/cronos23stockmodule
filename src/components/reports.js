import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from '@mui/material';
import db from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

function Reports() {
  const [inventarioPorDeposito, setInventarioPorDeposito] = useState([]);

  const formatInventarioPorDeposito = (inventarioData) => {
    const groupedData = inventarioData.reduce((acc, item) => {
      if (!acc[item.deposito]) {
        acc[item.deposito] = {};
      }
      if (!acc[item.deposito][item.codigoPR]) {
        acc[item.deposito][item.codigoPR] = 0;
      }
      acc[item.deposito][item.codigoPR] += item.cantidad;
      return acc;
    }, {});

    const formattedData = Object.keys(groupedData).map(deposito => ({
      deposito,
      productos: Object.keys(groupedData[deposito]).map(codigoPR => ({
        codigoPR,
        cantidad: groupedData[deposito][codigoPR]
      }))
    }));

    setInventarioPorDeposito(formattedData);
  };

  const fetchInventarioGeneral = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "movimientos"));
      const inventario = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const cantidad = parseInt(data.cantidad, 10);
        const key = `${data.codigoPR}-${data.deposito}`;

        if (data.operacion === "Alta") {
          if (inventario[key]) {
            inventario[key].cantidad += cantidad;
          } else {
            inventario[key] = { codigoPR: data.codigoPR, deposito: data.deposito, cantidad };
          }
        } else if (data.operacion === "Baja") {
          if (inventario[key]) {
            inventario[key].cantidad -= cantidad;
          } else {
            inventario[key] = { codigoPR: data.codigoPR, deposito: data.deposito, cantidad: -cantidad };
          }
        }
      });

      const inventarioArray = Object.values(inventario);
      formatInventarioPorDeposito(inventarioArray);
    } catch (error) {
      console.error("Error al cargar el inventario general:", error);
    }
  }, []);

  useEffect(() => {
    fetchInventarioGeneral();
  }, [fetchInventarioGeneral]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>Inventario por Depósitos</Typography>
        {inventarioPorDeposito.map(deposito => (
          <Box key={deposito.deposito} mb={4}>
            <Typography variant="h6" gutterBottom>{deposito.deposito}</Typography>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Código PR</TableCell>
                    <TableCell>Cantidad</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deposito.productos.map(producto => (
                    <TableRow key={producto.codigoPR}>
                      <TableCell>{producto.codigoPR}</TableCell>
                      <TableCell>{producto.cantidad}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </Grid>
    </Grid>
  );
}

export default Reports;
