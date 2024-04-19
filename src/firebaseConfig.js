// Importa las funciones que necesitas de los SDKs que necesitas
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de la aplicación web de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDpWSqPZJs6p3W-99-b_gXtBCVb6_fW7x0",
  authDomain: "crono23-stock-module.firebaseapp.com",
  projectId: "crono23-stock-module",
  storageBucket: "crono23-stock-module.appspot.com",
  messagingSenderId: "10321042767",
  appId: "1:10321042767:web:e66a4067bdd1a74e90793a"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Obtener la instancia de Firestore para usar en toda la aplicación
const db = getFirestore(app);

export default db;
