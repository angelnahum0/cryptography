import React from "react";
import io from 'socket.io-client';
import { useState, useEffect } from 'react';
import forge from "node-forge";
import {saveAs} from 'file-saver';
import { useNavigate, useLocation } from 'react-router-dom';
const socket = io('/');
var public_Key;

function App() {
    const [password, setPassword] = useState(''); // Contraseña para cifrar la clave privada
    const [username, setUsername] = useState(''); // Nombre de usuario
    const [errorPk, setErrorPk] = useState(''); // Mensaje de error
    const [privateKeyPem, setPrivateKeyPem] = useState(''); // Clave privada en formato PEM

    const navigate = useNavigate(); // Función para cambiar de ruta
    const readFile = (e) => { // Función para leer el archivo de la clave privada
      console.log(e); // Imprime el evento
      const file = e.target.files[0]; // Obtiene el archivo subido
      const fileReader = new FileReader(); // Crea un objeto FileReader
      if (!file) { // Verifica si el archivo existe
        return; // Si no existe, termina la función
      }
      // Lee el archivo como texto
      fileReader.readAsText(file, 'utf-8');
      // Cuando se complete la lectura del archivo
      fileReader.onload = () => {
        // Almacena el contenido del archivo en la variable privateKeyPem
        setPrivateKeyPem(fileReader.result);
      }
      fileReader.onerror = () => {
        // Si ocurre un error al leer el archivo, imprime un mensaje en la consola
        console.error('Error al leer el archivo');
      }
    }
    // Función para mostrar el panel de creación de llaves
    const qpanel = () => {
        const container = document.getElementById("container");
        container.classList.add("right-panel-active");
    };
    // Función para mostrar el panel de inicio de sesión
    const panel = () => {
        const container = document.getElementById("container");
        container.classList.remove("right-panel-active");
    };
    // Función para crear las llaves
    const createKeys = (e) => {
        e.preventDefault();
        // Genera un par de claves RSA de 2048 bits
        const keyPair = forge.pki.rsa.generateKeyPair({bits: 2048});
        // Obtiene la clave privada y pública
        const privateKey = keyPair.privateKey;
        const publicKey = keyPair.publicKey;
        // Convierte la clave pública a formato PEM
        const pemPublicKey = forge.pki.publicKeyToPem(publicKey);
        // Configuración para cifrar la clave privada
        const options = {
          algorithm: 'aes256', // Algoritmo de cifrado a usar
          count: 10000, // Número de iteraciones de PBKDF2
          saltSize: 128, // Tamaño de la sal en bits
        };
        // Cifra la clave privada usando la contraseña proporcionada
        const privateKeyPem = forge.pki.encryptRsaPrivateKey(privateKey, password, options);
        // Imprime la clave privada cifrada en la consola
        console.log(privateKeyPem);
        // Crea un objeto Blob con la clave privada cifrada
        const blob = new Blob([privateKeyPem], { type: 'text/plain;charset=utf-8' });
        // Descarga la clave privada cifrada como un archivo PEM
        saveAs(blob, 'clave-privada.pem');
        // Emite el evento 'createKeys' al servidor con el nombre de usuario y la clave pública para almacenarlos
        socket.emit('createKeys', {username, pemPublicKey});
    }
    // Función para iniciar sesión
    const signIn = (e) => {
      (e).preventDefault();
      try {
        // Intentar descifrar la clave privada usando la contraseña proporcionada
        const privateKey = forge.pki.decryptRsaPrivateKey(privateKeyPem, password);
        // Convierte la clave privada descifrada a formato PEM
        const pemPrivateKey = forge.pki.privateKeyToPem(privateKey);
        // Imprime la clave privada descifrada en la consola
        setErrorPk('Clave descifrada correctamente');
        // Emite el evento 'getPublicKey' al servidor para obtener la clave pública del usuario
        socket.emit('getPublicKey', username);
        // Recibe la clave pública del servidor
        socket.on('getPublicKey', (pemPublicKey) => {
          public_Key = pemPublicKey;
        });
        // Verifica si la clave pública existe
        if (public_Key === "NOKEY" || public_Key === null || public_Key === "") {
          // Si no existe, muestra un mensaje en la consola
          console.log(public_Key);
          // Muestra un mensaje de error en la interfaz
          setErrorPk('No se encontro la clave publica, genere sus llaves');
          // Retorna nulo
          return null;
        }else{
          // Si existe, almacena el nombre de usuario en sessionStorage
          sessionStorage.setItem('usuario', username);
          // Almacenar la clave privada en sessionStorage
          sessionStorage.setItem('llaveP', pemPrivateKey);
          // Redirige a la página de usuarios
          navigate('/users');
        }
      } catch (error) {
        // Captura la excepción si la contraseña es incorrecta
        setErrorPk('Error al descifrar la clave privada:' + error.message);
        // Retorna nulo
        return null;
      }
    }

  return (
    <div className="container" id="container" >
      <div className="form-container create-keys-container" >
        <form className="form2" onSubmit={createKeys}  >
          <h1>Creacion de llaves</h1>
          <span>Para generar tus llaves se requerirá una contraseña para el cifrado de la llave privada</span>
          <input type="text" name = "username" placeholder="Usuario" required onChange={
            (e) => setUsername(e.target.value) // Almacena el nombre de usuario en el estado
            }/>
          <input type="password" name = "password" placeholder="Contraseña" required onChange={
            (e) => setPassword(e.target.value)// Almacena la contraseña en el estado
            }/>
          <button>Generar</button>
        </form>
      </div>
      <div className="form-container secure-chat-container">
        <form onSubmit={signIn} encType="multipart/form-data">
          <h1>¿Ya tienes una cuenta?</h1>
          <p id="span">Inicia sesión</p>
          <input type="text" name = "username" placeholder="Usuario" required onChange={
            (e) => setUsername(e.target.value)// Almacena el nombre de usuario en el estado
            }/>
          <span>{errorPk}</span>
          <input type="password" name = "password" placeholder="Contraseña" required onChange={
            (e) => setPassword(e.target.value)// Almacena la contraseña en el estado
            }/>
          <h1>Sube tus llaves</h1>
          <label>Llave privada</label>
          <div>
            <label htmlFor="file" className="custom-file-upload">
            <span id="file-name">Seleccionar archivo</span>
            <input type="file" id="file" name="private_key" onChange={readFile} accept=".pem" required/>
            </label>
          </div>
          <div className="form-item">
              <input type="submit" value="Enviar datos"  className="custom-submit-button" />
          </div>
          <button>Empieza</button>
        </form>
      </div>
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>¿Enviar mensajes?</h1>
            <p>
                Envia y recibe mensajes de forma segura
            </p>
            <button className="ghost" id="Secure-Chat" onClick={panel}>Inicia sesión</button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Genera tus llaves</h1>
            <p>Genera tus llaves publica y privada</p>
            <button className="ghost" id="Create-Keys" onClick={qpanel}>Crear llaves</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;