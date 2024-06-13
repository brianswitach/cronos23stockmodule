import React, { useState, useEffect } from 'react';
import { Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import db from '../firebaseConfig';

const InventarioGeneral = () => {
  const [inventarioGeneral, setInventarioGeneral] = useState([]);

  useEffect(() => {
    const fetchInventarioGeneral = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "movimientos"));
        const inventario = {};

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (inventario[data.codigoPR]) {
            inventario[data.codigoPR] = parseInt(inventario[data.codigoPR], 10) + parseInt(data.cantidad, 10);
          } else {
            inventario[data.codigoPR] = parseInt(data.cantidad, 10);
          }
        });

        const inventarioArray = Object.keys(inventario).map(codigoPR => ({
          codigoPR,
          cantidad: inventario[codigoPR],
        }));

        setInventarioGeneral(inventarioArray);
      } catch (error) {
        console.error("Error al cargar el inventario general:", error);
      }
    };

    fetchInventarioGeneral();
  }, []);

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
              <TableCell>Cantidad</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventarioGeneral.map((row) => (
              <TableRow key={row.codigoPR}>
                <TableCell>{row.codigoPR}</TableCell>
                <TableCell>{row.cantidad}</TableCell>
                <TableCell>
                  <Button variant="contained" color="secondary">
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
