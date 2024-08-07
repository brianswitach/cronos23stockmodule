const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'CAMBIAR PASSWORD',
  database: 'firebase_db'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// Obtener todas las categorías
app.get('/categorias', (req, res) => {
  db.query('SELECT * FROM categorias', (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
      return;
    }
    res.json(results);
  });
});

// Agregar una nueva categoría
app.post('/categorias', (req, res) => {
  const { nombre } = req.body;
  console.log("Datos recibidos:", nombre); // Depuración
  db.query('INSERT INTO categorias (nombre) VALUES (?)', [nombre], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
      return;
    }
    console.log("Resultado de la inserción:", result); // Depuración
    res.status(200).send('Category added successfully');
  });
});

// Eliminar una categoría
app.delete('/categorias/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Eliminando categoría con id: ${id}`); // Depuración
  db.query('DELETE FROM categorias WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).send('Error deleting data');
      return;
    }
    console.log("Resultado de la eliminación:", result); // Depuración
    res.status(200).send('Category deleted successfully');
  });
});

// Actualizar una categoría
app.put('/categorias/:id', (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  console.log(`Actualizando categoría con id: ${id}, nuevo nombre: ${nombre}`); // Depuración
  db.query('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre, id], (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
      return;
    }
    console.log("Resultado de la actualización:", result); // Depuración
    res.status(200).send('Category updated successfully');
  });
});

// Obtener todos los productos
app.get('/productos', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
      return;
    }
    res.json(results);
  });
});

// Agregar un nuevo producto
app.post('/productos', (req, res) => {
  const { nombre, categoria, codigo } = req.body;
  console.log("Datos recibidos:", { nombre, categoria, codigo }); // Depuración
  db.query('INSERT INTO productos (nombre, categoria, codigo) VALUES (?, ?, ?)', [nombre, categoria, codigo], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
      return;
    }
    console.log("Resultado de la inserción:", result); // Depuración
    res.status(200).send('Product added successfully');
  });
});

// Eliminar un producto
app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Eliminando producto con id: ${id}`); // Depuración
  db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).send('Error deleting data');
      return;
    }
    console.log("Resultado de la eliminación:", result); // Depuración
    res.status(200).send('Product deleted successfully');
  });
});

// Actualizar un producto
app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, codigo } = req.body;
  console.log(`Actualizando producto con id: ${id}, nuevo nombre: ${nombre}, nueva categoría: ${categoria}, nuevo código: ${codigo}`); // Depuración
  db.query('UPDATE productos SET nombre = ?, categoria = ?, codigo = ? WHERE id = ?', [nombre, categoria, codigo, id], (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
      return;
    }
    console.log("Resultado de la actualización:", result); // Depuración
    res.status(200).send('Product updated successfully');
  });
});

// Obtener todos los depósitos
app.get('/depositos', (req, res) => {
  db.query('SELECT * FROM depositos', (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
      return;
    }
    res.json(results);
  });
});

// Agregar un nuevo depósito
app.post('/depositos', (req, res) => {
  const { nombre } = req.body;
  db.query('SELECT IFNULL(MAX(id), 0) + 1 AS nextCodigoDP FROM depositos', (err, results) => {
    if (err) {
      console.error('Error fetching next codigoDP:', err);
      res.status(500).send('Error fetching next codigoDP');
      return;
    }
    const nextCodigoDP = results[0].nextCodigoDP.toString().padStart(5, '0');
    db.query('INSERT INTO depositos (nombre, codigoDP) VALUES (?, ?)', [nombre, nextCodigoDP], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Error inserting data');
        return;
      }
      res.status(200).send('Deposito added successfully');
    });
  });
});

// Eliminar un depósito
app.delete('/depositos/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Eliminando depósito con id: ${id}`); // Depuración
  db.query('DELETE FROM depositos WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).send('Error deleting data');
      return;
    }
    res.status(200).send('Deposito deleted successfully');
  });
});

// Actualizar un depósito
app.put('/depositos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, codigoDP } = req.body;
  db.query('UPDATE depositos SET nombre = ?, codigoDP = ? WHERE id = ?', [nombre, codigoDP, id], (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
      return;
    }
    res.status(200).send('Deposito updated successfully');
  });
});

// Obtener todos los movimientos
app.get('/movimientos', (req, res) => {
  db.query('SELECT * FROM movimientos', (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
      return;
    }
    res.json(results);
  });
});

// Agregar un nuevo movimiento
app.post('/movimientos', (req, res) => {
  const { codigoPR, deposito, operacion, cantidad, fechaHora } = req.body;
  const formattedDate = moment(fechaHora).format('YYYY-MM-DD HH:mm:ss');
  db.query('INSERT INTO movimientos (codigoPR, deposito, operacion, cantidad, fechaHora) VALUES (?, ?, ?, ?, ?)', [codigoPR, deposito, operacion, cantidad, formattedDate], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
      return;
    }
    res.status(200).send('Movimiento added successfully');
  });
});

// Eliminar un movimiento
app.delete('/movimientos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM movimientos WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).send('Error deleting data');
      return;
    }
    res.status(200).send('Movimiento deleted successfully');
  });
});

// Actualizar un movimiento
app.put('/movimientos/:id', (req, res) => {
  const { id } = req.params;
  const { codigoPR, deposito, operacion, cantidad, fechaHora } = req.body;
  const formattedDate = moment(fechaHora).format('YYYY-MM-DD HH:mm:ss');
  db.query('UPDATE movimientos SET codigoPR = ?, deposito = ?, operacion = ?, cantidad = ?, fechaHora = ? WHERE id = ?', [codigoPR, deposito, operacion, cantidad, formattedDate, id], (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
      return;
    }
    res.status(200).send('Movimiento updated successfully');
  });
});

// Obtener todos los IDs
app.get('/gestion_ids', (req, res) => {
    db.query('SELECT * FROM gestion_ids', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
        return;
      }
      res.json(results);
    });
  });
  

// Agregar un nuevo ID
app.post('/gestion_ids', (req, res) => {
  const { codigoPR, nombre, categoria, deposito, id_producto } = req.body;
  db.query('INSERT INTO gestion_ids (codigoPR, nombre, categoria, deposito, id_producto) VALUES (?, ?, ?, ?, ?)', [codigoPR, nombre, categoria, deposito, id_producto], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
      return;
    }
    res.status(200).send('ID added successfully');
  });
});

// Eliminar un ID
app.delete('/gestion_ids/:id_producto', (req, res) => {
  const { id_producto } = req.params;
  if (id_producto === undefined) {
    res.status(400).send('ID producto is undefined');
    return;
  }
  db.query('DELETE FROM gestion_ids WHERE id_producto = ?', [id_producto], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).send('Error deleting data');
      return;
    }
    res.status(200).send('ID deleted successfully');
  });
});

// Actualizar un ID
app.put('/gestion_ids/:id_producto', (req, res) => {
  const { id_producto } = req.params;
  const { deposito } = req.body;
  db.query('UPDATE gestion_ids SET deposito = ? WHERE id_producto = ?', [deposito, id_producto], (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
      return;
    }
    res.status(200).send('ID updated successfully');
  });
});

// Eliminar un movimiento específico basado en codigoPR y deposito
app.delete('/movimientos', (req, res) => {
  const { codigoPR, deposito } = req.body;
  if (!codigoPR || !deposito) {
    res.status(400).send('codigoPR or deposito is undefined');
    return;
  }
  db.query('DELETE FROM movimientos WHERE codigoPR = ? AND deposito = ?', [codigoPR, deposito], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).send('Error deleting data');
      return;
    }
    res.status(200).send('Movimiento deleted successfully');
  });
});

// Obtener el inventario general por depósitos
app.get('/reports/inventario', (req, res) => {
    db.query('SELECT codigoPR, deposito, operacion, cantidad FROM movimientos', (err, results) => {
      if (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
        return;
      }
      res.json(results);
    });
  });
  

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
