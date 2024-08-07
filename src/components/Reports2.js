import React, { useState, useEffect } from 'react';
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
  Button,
} from '@mui/material';
import axios from 'axios';

function Reports2() {
  const [inventarioPorDeposito, setInventarioPorDeposito] = useState([]);
  const [sortDirection, setSortDirection] = useState({});

  useEffect(() => {
    const storedData = localStorage.getItem('inventarioPorDeposito');
    if (storedData) {
      setInventarioPorDeposito(JSON.parse(storedData));
    } else {
      fetchInventarioPorDeposito();
    }
  }, []);

  const fetchInventarioPorDeposito = async () => {
    try {
      const response = await axios.get('http://localhost:3001/reports/inventario');
      const inventarioData = response.data;

      const groupedData = inventarioData.reduce((acc, item) => {
        if (!acc[item.deposito]) {
          acc[item.deposito] = [];
        }
        acc[item.deposito].push(item);
        return acc;
      }, {});

      const formattedData = Object.keys(groupedData).map(deposito => ({
        deposito,
        productos: groupedData[deposito],
      }));

      setInventarioPorDeposito(formattedData);
      localStorage.setItem('inventarioPorDeposito', JSON.stringify(formattedData));
    } catch (error) {
      console.error("Error al cargar el inventario por depósito:", error);
    }
  };

  const handleSort = (deposito) => {
    const currentDirection = sortDirection[deposito] || 'asc';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';

    const sortedData = inventarioPorDeposito.map(item => {
      if (item.deposito === deposito) {
        const sortedProductos = [...item.productos].sort((a, b) => {
          if (newDirection === 'asc') {
            return a.id_producto - b.id_producto;
          } else {
            return b.id_producto - a.id_producto;
          }
        });
        return { ...item, productos: sortedProductos };
      }
      return item;
    });

    setInventarioPorDeposito(sortedData);
    setSortDirection({ ...sortDirection, [deposito]: newDirection });
    localStorage.setItem('inventarioPorDeposito', JSON.stringify(sortedData));
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>Inventario por Depósitos</Typography>
        {inventarioPorDeposito.map(deposito => (
          <Box key={deposito.deposito} mb={4}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h6" gutterBottom sx={{ marginRight: 2 }}>
                {deposito.deposito}
              </Typography>
              <Button variant="contained" onClick={() => handleSort(deposito.deposito)}>
                Ordenar IDs
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Código PR</TableCell>
                    <TableCell>ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deposito.productos.map(producto => (
                    <TableRow key={producto.id_producto}>
                      <TableCell>{producto.codigoPR}</TableCell>
                      <TableCell>{producto.id_producto}</TableCell>
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

export default Reports2;
