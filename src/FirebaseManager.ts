// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { Database, getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD4z3MmRdzWQEaDXWl2BxdogmtYgKZkYJg",
  authDomain: "aviso-eats.firebaseapp.com",
  databaseURL: "https://aviso-eats-default-rtdb.firebaseio.com",
  projectId: "aviso-eats",
  storageBucket: "aviso-eats.appspot.com",
  messagingSenderId: "733693296804",
  appId: "1:733693296804:web:aa331eb423ee74bb822631",
  measurementId: "G-VTB52TNMTC",
};

class FirebaseManagerService {
  private app: FirebaseApp;
  database: Database;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.database = getDatabase(this.app);
  }
}

const FirebaseManager = new FirebaseManagerService();

export default FirebaseManager;
