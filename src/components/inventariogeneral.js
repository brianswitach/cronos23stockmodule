import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Button } from '@mui/material';
import db from '../firebaseConfig';
import { collection, getDocs, query, where, writeBatch } from 'firebase/firestore';

function InventarioGeneral() {
  const [inventario, setInventario] = useState([]);

  const fetchDatos = useCallback(async () => {
    const [clientesSnapshot, idsSnapshot] = await Promise.all([
      getDocs(collection(db, "clientes")),
      getDocs(collection(db, "ids"))
    ]);

    const clientesData = clientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const idsData = idsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    calcularInventario(clientesData, idsData);
  }, []);

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  const calcularInventario = (clientesData, idsData) => {
    let inventarioTemp = clientesData.reduce((acc, cliente) => {
      acc[cliente.codigo] = {
        codigoPR: cliente.codigo,
        nombre: cliente.nombre,
        categoria: cliente.categoria,
        cantidad: 0
      };
      return acc;
    }, {});

    idsData.forEach((idItem) => {
      if (inventarioTemp[idItem.codigoPR]) {
        inventarioTemp[idItem.codigoPR].cantidad += 1;
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

        const idsQuery = query(collection(db, "ids"), where("codigoPR", "==", codigoPR));
        const idsSnapshot = await getDocs(idsQuery);

        idsSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();

        fetchDatos();
        alert("Producto y sus IDs eliminados con éxito");
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
