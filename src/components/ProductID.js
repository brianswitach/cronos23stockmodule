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
import { collection, getDocs, addDoc, query, where, updateDoc, doc, getDoc, writeBatch } from 'firebase/firestore';
import db from '../firebaseConfig';

function ProductID() {
  const [productos, setProductos] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState('');
  const [numeroInicial, setNumeroInicial] = useState('');
  const [cantidadNumerar, setCantidadNumerar] = useState('');
  const [inventarioIDs, setInventarioIDs] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [selectedDeposito, setSelectedDeposito] = useState('');
  const [editMode, setEditMode] = useState({}); // Estado para controlar el modo de edición

  useEffect(() => {
    const fetchInventoryIDs = async () => {
      const inventoryData = localStorage.getItem('inventarioIDs');
      if (inventoryData) {
        setInventarioIDs(JSON.parse(inventoryData));
      }
    };

    const fetchDepositos = async () => {
      try {
        const depositosQuerySnapshot = await getDocs(collection(db, "depositos"));
        const depositosData = depositosQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDepositos(depositosData);
      } catch (error) {
        console.error("Error al cargar los depósitos:", error);
      }
    };

    fetchInventoryIDs();
    fetchDepositos();
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
  
    fetchProductos();
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
    const nuevosInventarioIDs = inventarioIDs.filter((item, idx) => idx !== index);
    setInventarioIDs(nuevosInventarioIDs);
    localStorage.setItem('inventarioIDs', JSON.stringify(nuevosInventarioIDs));
    await updateDepositosextra(nuevosInventarioIDs);
  };

  const updateDepositosextra = async (nuevosInventarioIDs) => {
    try {
      const depositosExtraCollection = collection(db, "depositosextra");
      const depositosExtraSnapshot = await getDocs(depositosExtraCollection);
      const batch = writeBatch(db);
      depositosExtraSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      for (const id of nuevosInventarioIDs) {
        await addDoc(depositosExtraCollection, id);
      }
    } catch (error) {
      console.error("Error al actualizar depositosextra:", error);
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
    const docRef = doc(db, "depositosextra", item.id.toString());

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          deposito: item.deposito
        });
        alert("Movimiento realizado con éxito.");
      } else {
        // Si el documento no existe, crearlo
        await addDoc(collection(db, "depositosextra"), {
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
    await updateDepositosextra(inventarioIDs);
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
              <MenuItem value="Depósito Central por ID's">Depósito Central por ID's</MenuItem>
              <MenuItem value="Depósito Interno por ID's">Depósito Interno por ID's</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" onClick={handleProcesar} sx={{ margin: 1 }}>
            Procesar
          </Button>
          <Button variant="contained" color="secondary" sx={{ margin: 1 }}>
            Cancelar
          </Button>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Depósito Central por ID's:</Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="deposito-central-table">
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
                {inventarioIDs.map((item, index) => (
                  item.deposito === "Depósito Central por ID's" &&
                  <TableRow key={index}>
                    <TableCell>{item.codigoPR}</TableCell>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell>{item.categoria}</TableCell>
                    <TableCell>{item.deposito}</TableCell>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <Button variant="outlined" color="secondary" onClick={() => eliminarFila(index)}>
                        Eliminar
                      </Button>
                      {!editMode[index] && (
                        <Button variant="outlined" color="primary" onClick={() => toggleEditMode(index)}>
                          Mover
                        </Button>
                      )}
                      {editMode[index] && (
                        <FormControl fullWidth margin="normal">
                          <Select
                            value={item.deposito}
                            onChange={e => handleDepositoChange(index, e.target.value)}
                          >
                            <MenuItem value="Depósito Central por ID's">Depósito Central por ID's</MenuItem>
                            <MenuItem value="Depósito Interno por ID's">Depósito Interno por ID's</MenuItem>
                          </Select>
                          <Button variant="contained" color="primary" onClick={() => handleSave(index)}>
                            Guardar
                          </Button>
                        </FormControl>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Depósito Interno por ID's:</Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="deposito-interno-table">
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
                {inventarioIDs.map((item, index) => (
                  item.deposito === "Depósito Interno por ID's" &&
                  <TableRow key={index}>
                    <TableCell>{item.codigoPR}</TableCell>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell>{item.categoria}</TableCell>
                    <TableCell>{item.deposito}</TableCell>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <Button variant="outlined" color="secondary" onClick={() => eliminarFila(index)}>
                        Eliminar
                      </Button>
                      {!editMode[index] && (
                        <Button variant="outlined" color="primary" onClick={() => toggleEditMode(index)}>
                          Mover
                        </Button>
                      )}
                      {editMode[index] && (
                        <FormControl fullWidth margin="normal">
                          <Select
                            value={item.deposito}
                            onChange={e => handleDepositoChange(index, e.target.value)}
                          >
                            <MenuItem value="Depósito Central por ID's">Depósito Central por ID's</MenuItem>
                            <MenuItem value="Depósito Interno por ID's">Depósito Interno por ID's</MenuItem>
                          </Select>
                          <Button variant="contained" color="primary" onClick={() => handleSave(index)}>
                            Guardar
                          </Button>
                        </FormControl>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Inventario por IDs:</Typography>
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
                {inventarioIDs.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.codigoPR}</TableCell>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell>{item.categoria}</TableCell>
                    <TableCell>
                      {editMode[index] ? (
                        <Select
                          value={item.deposito}
                          onChange={e => handleDepositoChange(index, e.target.value)}
                        >
                          <MenuItem value="Depósito Central por ID's">Depósito Central por ID's</MenuItem>
                          <MenuItem value="Depósito Interno por ID's">Depósito Interno por ID's</MenuItem>
                        </Select>
                      ) : (
                        item.deposito
                      )}
                    </TableCell>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <Button variant="outlined" color="secondary" onClick={() => eliminarFila(index)}>
                        Eliminar
                      </Button>
                      {!editMode[index] && (
                        <Button variant="outlined" color="primary" onClick={() => toggleEditMode(index)}>
                          Mover
                        </Button>
                      )}
                      {editMode[index] && (
                        <Button variant="contained" color="primary" onClick={() => handleSave(index)}>
                          Guardar
                        </Button>
                      )}
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
