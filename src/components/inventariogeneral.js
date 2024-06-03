import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Button } from '@mui/material';
import db from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';

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

  const eliminarProducto = async (codigoPR) => {
    try {
      const productoQuery = query(collection(db, "clientes"), where("codigo", "==", codigoPR));
      const productoSnapshot = await getDocs(productoQuery);

      if (!productoSnapshot.empty) {
        const batch = writeBatch(db);

        productoSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        const movimientosQuery = query(collection(db, "movimientos"), where("codigoPR", "==", codigoPR));
        const movimientosSnapshot = await getDocs(movimientosQuery);

        movimientosSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();

        fetchDatos();
        alert("Producto y sus movimientos eliminados con éxito");
      } else {
        alert("Producto no encontrado.");
      }
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      alert("Error al eliminar el producto.");
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>Inventario General</Typography>
        <Divider sx={{ my: 2 }} />
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
              {inventario.map((inv, index) => (
                <TableRow key={index}>
                  <TableCell>{inv.codigoPR}</TableCell>
                  <TableCell>{inv.nombre}</TableCell>
                  <TableCell>{inv.categoria}</TableCell>
                  <TableCell>{inv.cantidad}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => eliminarProducto(inv.codigoPR)}
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
    </Grid>
  );
}

export default InventarioGeneral;
