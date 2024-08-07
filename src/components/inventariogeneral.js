import React, { useState, useEffect } from 'react';
import { Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';

const InventarioGeneral = () => {
  const [inventarioGeneral, setInventarioGeneral] = useState([]);

  useEffect(() => {
    const fetchInventarioGeneral = async () => {
      try {
        const response = await axios.get('http://localhost:3001/movimientos');
        const movimientos = response.data;
        const inventario = {};

        movimientos.forEach((data) => {
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

        setInventarioGeneral(inventarioArray);
      } catch (error) {
        console.error("Error al cargar el inventario general:", error);
      }
    };

    fetchInventarioGeneral();
  }, []);

  const handleEliminar = async (codigoPR, deposito) => {
    try {
      await axios.delete(`http://localhost:3001/movimientos`, { data: { codigoPR, deposito } });
      setInventarioGeneral(prev => prev.filter(item => !(item.codigoPR === codigoPR && item.deposito === deposito)));
    } catch (error) {
      console.error("Error al eliminar el movimiento:", error);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Inventario General
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Código PR</TableCell>
              <TableCell>Depósito</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventarioGeneral.map((row) => (
              <TableRow key={`${row.codigoPR}-${row.deposito}`}>
                <TableCell>{row.codigoPR}</TableCell>
                <TableCell>{row.deposito}</TableCell>
                <TableCell>{row.cantidad}</TableCell>
                <TableCell>
                  <Button variant="contained" color="secondary" onClick={() => handleEliminar(row.codigoPR, row.deposito)}>
                    ELIMINAR
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default InventarioGeneral;
