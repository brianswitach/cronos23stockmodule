import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider
} from '@mui/material';
import { collection, getDocs, addDoc, query, where, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import db from '../firebaseConfig';

function ProductID() {
  const [productos, setProductos] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState('');
  const [numeroInicial, setNumeroInicial] = useState('');
  const [cantidadNumerar, setCantidadNumerar] = useState('');
  const [inventarioIDs, setInventarioIDs] = useState([]);
  const [selectedDeposito, setSelectedDeposito] = useState('');
  const [editMode, setEditMode] = useState({});
  const [depositos, setDepositos] = useState([]);

  useEffect(() => {
    const fetchInventoryIDs = async () => {
      const inventoryData = localStorage.getItem('inventarioIDs');
      if (inventoryData) {
        setInventarioIDs(JSON.parse(inventoryData));
      }
    };

    fetchInventoryIDs();
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const q = query(collection(db, "clientes"));
        const querySnapshot = await getDocs(q);
        const loadedProductos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProductos(loadedProductos);
      } catch (error) {
        console.error("Error al cargar los productos:", error);
      }
    };

    const fetchDepositos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "depositos"));
        const loadedDepositos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(deposito => deposito.codigoDP !== undefined); // Filtrando solo los depósitos válidos
        setDepositos(loadedDepositos);
      } catch (error) {
        console.error("Error al cargar los depósitos:", error);
      }
    };

    fetchProductos();
    fetchDepositos();
  }, []);

  const handleProcesar = async () => {
    if (!selectedProducto || !numeroInicial || !cantidadNumerar || !selectedDeposito) {
      alert("Por favor, complete todos los campos antes de procesar.");
      return;
    }

    const idData = {
      producto: selectedProducto,
      numeroInicial: Number(numeroInicial),
      cantidadNumerar: Number(cantidadNumerar),
      deposito: selectedDeposito,
      fecha: new Date()
    };

    try {
      await addDoc(collection(db, "ids"), idData);
      alert("ID guardado con éxito.");
      await updateInventarioIDs(selectedProducto, Number(numeroInicial), Number(cantidadNumerar), selectedDeposito);
    } catch (error) {
      console.error("Error al guardar el ID:", error);
      alert("Error al guardar el ID.");
    }
  };

  const updateInventarioIDs = async (productoNombre, numeroInicial, cantidadNumerar, selectedDeposito) => {
    const productoQuery = query(collection(db, "clientes"), where("nombre", "==", productoNombre));
    const productoSnapshot = await getDocs(productoQuery);
    if (!productoSnapshot.empty) {
      const productoData = productoSnapshot.docs[0].data();
      const nuevosIDs = Array.from({ length: cantidadNumerar }, (_, index) => ({
        codigoPR: productoData.codigo,
        nombre: productoData.nombre,
        categoria: productoData.categoria,
        deposito: selectedDeposito,
        id: numeroInicial + index
      }));

      setInventarioIDs(prevInventarioIDs => [...prevInventarioIDs, ...nuevosIDs]);
      localStorage.setItem('inventarioIDs', JSON.stringify([...inventarioIDs, ...nuevosIDs]));
      await saveToDepositosextra(nuevosIDs);
    }
  };

  const saveToDepositosextra = async (nuevosIDs) => {
    try {
      const depositosExtraCollection = collection(db, "depositosextra");
      for (const id of nuevosIDs) {
        await addDoc(depositosExtraCollection, id);
      }
    } catch (error) {
      console.error("Error al guardar en depositosextra:", error);
    }
  };

  const handleSelectDeposito = (event) => {
    setSelectedDeposito(event.target.value);
  };

  const eliminarFila = async (index) => {
    const fila = inventarioIDs[index];
    const nuevosInventarioIDs = inventarioIDs.filter((_, idx) => idx !== index);
    setInventarioIDs(nuevosInventarioIDs);
    localStorage.setItem('inventarioIDs', JSON.stringify(nuevosInventarioIDs));

    try {
      const q = query(collection(db, "depositosextra"), where("codigoPR", "==", fila.codigoPR), where("id", "==", fila.id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(doc(db, "depositosextra", docSnapshot.id));
      });
    } catch (error) {
      console.error("Error al eliminar la fila de depositosextra:", error);
    }
  };

  const toggleEditMode = (index) => {
    setEditMode(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleDepositoChange = (index, newDeposito) => {
    const updatedInventarioIDs = [...inventarioIDs];
    updatedInventarioIDs[index].deposito = newDeposito;
    setInventarioIDs(updatedInventarioIDs);
  };

  const handleSave = async (index) => {
    const item = inventarioIDs[index];
    const docRef = doc(db, "depositos", item.id.toString());

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          deposito: item.deposito
        });
        alert("Movimiento realizado con éxito.");
      } else {
        await addDoc(collection(db, "depositos"), {
          ...item,
          deposito: item.deposito
        });
        alert("Movimiento realizado con éxito.");
      }
    } catch (error) {
      console.error("Error al actualizar el depósito:", error);
      alert("Error al actualizar el depósito.");
    }

    toggleEditMode(index);
    localStorage.setItem('inventarioIDs', JSON.stringify(inventarioIDs));
  };

  return (
    <Box sx={{ flexGrow: 1, maxWidth: 752 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>Gestión de IDs</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="producto-label">Seleccionar Producto</InputLabel>
            <Select
              labelId="producto-label"
              value={selectedProducto}
              label="Seleccionar Producto"
              onChange={e => setSelectedProducto(e.target.value)}
            >
              {productos.map((producto) => (
                <MenuItem key={producto.id} value={producto.nombre}>
                  {producto.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Nro Inicial"
            type="number"
            value={numeroInicial}
            onChange={e => setNumeroInicial(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Cantidad a numerar"
            type="number"
            value={cantidadNumerar}
            onChange={e => setCantidadNumerar(e.target.value)}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="deposito-label">Depósito</InputLabel>
            <Select
              labelId="deposito-label"
              value={selectedDeposito}
              label="Depósito"
              onChange={handleSelectDeposito}
            >
              {depositos.map((deposito) => (
                <MenuItem key={deposito.id} value={deposito.nombre}>
                  {deposito.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleProcesar} sx={{ marginTop: 2 }}>
            Procesar
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ marginY: 2 }} />
          <Typography variant="h4" gutterBottom>Inventario por IDs:</Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Código PR</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Depósito</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventarioIDs.map((inv, index) => (
                  <TableRow key={index}>
                    <TableCell>{inv.codigoPR}</TableCell>
                    <TableCell>{inv.nombre}</TableCell>
                    <TableCell>{inv.categoria}</TableCell>
                    <TableCell>
                      {editMode[index] ? (
                        <TextField
                          value={inv.deposito}
                          onChange={e => handleDepositoChange(index, e.target.value)}
                          fullWidth
                        />
                      ) : (
                        inv.deposito
                      )}
                    </TableCell>
                    <TableCell>{inv.id}</TableCell>
                    <TableCell>
                      {editMode[index] ? (
                        <Button onClick={() => handleSave(index)} variant="contained" color="primary" sx={{ mr: 1 }}>
                          Guardar
                        </Button>
                      ) : (
                        <Button onClick={() => toggleEditMode(index)} variant="contained" color="primary" sx={{ mr: 1 }}>
                          Mover
                        </Button>
                      )}
                      <Button onClick={() => eliminarFila(index)} variant="contained" color="secondary">
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
    </Box>
  );
}

export default ProductID;
