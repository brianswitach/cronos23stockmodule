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
  Button
} from '@mui/material';
import db from '../firebaseConfig';
import { collection, getDocs, doc, query, where, writeBatch } from 'firebase/firestore';

function InventarioPorDeposito() {
  const [inventarioPorDeposito, setInventarioPorDeposito] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const [movimientosSnapshot, clientesSnapshot] = await Promise.all([
        getDocs(collection(db, "movimientos")),
        getDocs(collection(db, "clientes")),
      ]);

      // Mapeo de clientes por su código
      const clientes = clientesSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        acc[data.codigo] = { nombre: data.nombre, categoria: data.categoria };
        return acc;
      }, {});

      // Estructura inicial para el inventario por depósito
      const inventario = {};

      // Llenar la estructura de inventario con los movimientos y datos de clientes
      movimientosSnapshot.docs.forEach((doc) => {
        const mov = doc.data();
        const { codigoPR, deposito, operacion, cantidad } = mov;
        if (!inventario[deposito]) {
          inventario[deposito] = {};
        }
        if (!inventario[deposito][codigoPR]) {
          inventario[deposito][codigoPR] = { ...clientes[codigoPR], cantidad: 0 };
        }
        inventario[deposito][codigoPR].cantidad += (operacion === 'Alta' ? 1 : -1) * Number(cantidad);
      });

      setInventarioPorDeposito(inventario);
    };

    fetchData();
  }, []);

  const handleDelete = async (deposito, codigoPR) => {
    try {
      // Realizar una consulta para filtrar los documentos a eliminar
      const movimientosQuery = query(
        collection(db, "movimientos"),
        where("deposito", "==", deposito),
        where("codigoPR", "==", codigoPR)
      );

      const movimientosSnapshot = await getDocs(movimientosQuery);

      const batch = writeBatch(db);
      movimientosSnapshot.docs.forEach((docSnapshot) => {
        batch.delete(doc(db, "movimientos", docSnapshot.id));
      });

      // Eliminar el documento de la colección "clientes"
      const clientesQuery = query(
        collection(db, "clientes"),
        where("codigo", "==", codigoPR)
      );
      const clientesSnapshot = await getDocs(clientesQuery);
      clientesSnapshot.docs.forEach((docSnapshot) => {
        batch.delete(doc(db, "clientes", docSnapshot.id));
      });

      await batch.commit();

      // Actualizar el estado local después de la eliminación
      setInventarioPorDeposito((prevInventario) => {
        const newInventario = { ...prevInventario };
        delete newInventario[deposito][codigoPR];
        if (Object.keys(newInventario[deposito]).length === 0) {
          delete newInventario[deposito];
        }
        return newInventario;
      });

      alert("Producto eliminado con éxito.");
    } catch (error) {
      console.error("Error eliminando el documento: ", error);
      alert("Error eliminando el producto.");
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>Inventario por Depósito</Typography>
        {Object.keys(inventarioPorDeposito).map((deposito) => (
          <React.Fragment key={deposito}>
            <Typography variant="h6" sx={{ mt: 2 }}>{deposito}</Typography>
            <TableContainer component={Paper} sx={{ mt: 1 }}>
              <Table sx={{ minWidth: 650 }} aria-label="inventario por deposito">
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
                  {Object.entries(inventarioPorDeposito[deposito]).map(([codigoPR, data]) => (
                    <TableRow key={codigoPR}>
                      <TableCell>{codigoPR}</TableCell>
                      <TableCell>{data.nombre || 'No disponible'}</TableCell>
                      <TableCell>{data.categoria || 'No disponible'}</TableCell>
                      <TableCell>{data.cantidad}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleDelete(deposito, codigoPR)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </React.Fragment>
        ))}
      </Grid>
    </Grid>
  );
}

export default InventarioPorDeposito;
