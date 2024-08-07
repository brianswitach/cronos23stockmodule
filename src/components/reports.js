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
  Divider
} from '@mui/material';
import axios from 'axios';

function Reports() {
  const [inventarioPorDeposito, setInventarioPorDeposito] = useState([]);
  const [cantidadIDsPorProducto, setCantidadIDsPorProducto] = useState([]);

  const fetchInventarioPorDeposito = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/reports/inventario');
      const inventario = response.data;

      const groupedData = inventario.reduce((acc, item) => {
        const key = `${item.codigoPR}-${item.deposito}`;
        if (!acc[key]) {
          acc[key] = { codigoPR: item.codigoPR, deposito: item.deposito, cantidad: 0 };
        }
        if (item.operacion === 'Alta') {
          acc[key].cantidad += item.cantidad;
        } else if (item.operacion === 'Baja') {
          acc[key].cantidad -= item.cantidad;
        }
        return acc;
      }, {});

      const formattedData = Object.values(groupedData).reduce((acc, item) => {
        if (!acc[item.deposito]) {
          acc[item.deposito] = [];
        }
        acc[item.deposito].push({ codigoPR: item.codigoPR, cantidad: item.cantidad });
        return acc;
      }, {});

      const finalData = Object.keys(formattedData).map(deposito => ({
        deposito,
        productos: formattedData[deposito]
      }));

      setInventarioPorDeposito(finalData);
    } catch (error) {
      console.error("Error al cargar el inventario general:", error);
    }
  }, []);

  const fetchCantidadIDsPorProducto = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/gestion_ids');
      const gestionIds = response.data;

      const groupedByName = gestionIds.reduce((acc, item) => {
        if (!acc[item.nombre]) {
          acc[item.nombre] = 0;
        }
        acc[item.nombre] += 1;
        return acc;
      }, {});

      const formattedData = Object.keys(groupedByName).map(nombre => ({
        nombre,
        cantidad: groupedByName[nombre]
      }));

      setCantidadIDsPorProducto(formattedData);
    } catch (error) {
      console.error("Error al cargar la cantidad de IDs por producto:", error);
    }
  }, []);

  useEffect(() => {
    fetchInventarioPorDeposito();
    fetchCantidadIDsPorProducto();
  }, [fetchInventarioPorDeposito, fetchCantidadIDsPorProducto]);

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

        <Divider sx={{ marginY: 4 }} />

        <Typography variant="h4" gutterBottom>Cantidad de IDs por Producto</Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Cantidad de IDs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cantidadIDsPorProducto.map(producto => (
                <TableRow key={producto.nombre}>
                  <TableCell>{producto.nombre}</TableCell>
                  <TableCell>{producto.cantidad}</TableCell>
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
