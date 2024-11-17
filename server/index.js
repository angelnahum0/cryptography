import express from 'express';
import http from 'http';
import {Server as SocketServer} from 'socket.io';
import fs from 'fs';
import path from 'path';


const app = express(); // Crea una instancia de Express
const server = http.createServer(app); // Crea un servidor HTTP con la instancia de Express
const io = new SocketServer(server); //| Crea un servidor de WebSockets con el servidor HTTP
let lastUpdateTime = Date.now(); // Almacena la última vez que se actualizó la lista de usuarios activos
const usuariosActivos = []; // Almacena la lista de usuarios activos
const interval = 1000; // Intervalo de tiempo para actualizar la lista de usuarios activos
function isUserAvailable(username, usuariosActivos) {
  // Itera sobre los valores del objeto `usuariosActivos`
  for (const i in usuariosActivos) {
      // Verifica si el nombre de usuario coincide con alguno en `usuariosActivos`
      if (usuariosActivos.hasOwnProperty(i) && usuariosActivos[i].user === username) {
          // El usuario ya existe
          return false;
      }
  }
  // Si el usuario no existe, retorna `true`
  return true;
}
// Manejar la conexión de un socket
io.on('connection', socket => {
  console.log('New connection', socket.id);
  // Manejar el evento 'message' para enviar mensajes a todos los clientes
  socket.on('message', ({encryptedmsg, userReciever, firma}) => {
    // Mostrar el mensaje cifrado en la consola
    console.log(encryptedmsg);
    // Enviar el mensaje cifrado a todos los clientes excepto al que lo envió
    socket.broadcast.emit('message', {
      body: encryptedmsg,
      from : socket.id.slice(6),
      firma: firma
    });
  });
  socket.on('usuario', (username) => {
    // Almacena el usuario activo
    if (isUserAvailable(username, usuariosActivos)) {
      const nuevoUsuario = {
        user: username, // Guarda el `username`
        from: socket.id// Guarda el `socket.id`
      };
    // Añade el objeto `nuevoUsuario` a la lista `usuariosActivos`
      usuariosActivos.push(nuevoUsuario);
    }
    else {
      for (const i in usuariosActivos) {
        // Verifica si el nombre de usuario coincide con alguno en `usuariosActivos`
        if (usuariosActivos.hasOwnProperty(i) && usuariosActivos[i].user === username) {
            // El usuario ya existe
            usuariosActivos[i].from = socket.id;
        }
      }
    }

    
    
    const currentTime = Date.now();
    // Solo actualiza a los clientes si ha pasado el intervalo de tiempo
    if (currentTime - lastUpdateTime >= interval) {
        // Emitir la lista de usuarios activos a todos los clientes
        
        io.emit('usuariosActivos', usuariosActivos);
        lastUpdateTime = currentTime;
      }
    }
  );

// Manejar la desconexión de un socket
socket.on('salir', () => {
    // Eliminar el usuario desconectado de la lista
    for (let i = 0; i < usuariosActivos.length; i++) {
        if (usuariosActivos[i].from === socket.id) {
            usuariosActivos.splice(i, 1);
            break;
        }
    }
    // Emitir la lista de usuarios activos a todos los clientes
    io.emit('usuariosActivos', usuariosActivos);
  });
  socket.on('createKeys', ({username, pemPublicKey}) => {
    console.log('Usuario:', username);
    console.log('Clave pública (PEM):', pemPublicKey);
    // Guardar la clave pública en un archivo
    const userDir = path.join(process.cwd(), 'users');
    // Verifica si el directorio de usuarios existe
    if (!fs.existsSync(userDir)) {
      // Si no existe, crea el directorio
      fs.mkdirSync(userDir);
    }
    // Verifica si el directorio del usuario existe
    const userDir1 = path.join(process.cwd(), 'users', username);
    // Si no existe, crea el directorio
    if (!fs.existsSync(userDir1)) {
      fs.mkdirSync(userDir1);
    }
    // Guardar la clave pública en un archivo
    const pemFilePath = path.join(userDir1, 'public.pem');
    // guarda la clave pública en un archivo en la ubicacion especificada
    fs.writeFile(pemFilePath, pemPublicKey, 'utf-8', (err) => {
      if (err) {
        // Manejar cualquier error que ocurra al guardar la clave pública
        console.error('Error al guardar la clave pública:', err);
        return;
      }
      // Mostrar la ubicación del archivo donde se guardó la clave pública
      console.log('Clave pública guardada en:', pemFilePath);
    })
  });
  // Manejar el evento 'mesgkey' para enviar la clave cifrada a todos los clientes
  socket.on('mesgkey', ({userReciever, encrypted, username}) => {
    // Enviar la clave cifrada a todos los clientes excepto al que lo envió
    socket.broadcast.emit('mesgkey', {userReciever, encrypted, username});
  });
  // Manejar el evento 'getPublicKey' para enviar la clave pública al cliente
  socket.on('getPublicKey', (username) => {
    console.log('Solicitando clave pública de:', username);
    // Guardar la ruta del directorio del usuario
    const userDir = path.join(process.cwd(), 'users', username);
    //guardar la ruta donde se encuentra la clave publica
    const pemFilePath = path.join(userDir, 'public.pem');
    // Leer la clave pública del archivo
    fs.readFile(pemFilePath, 'utf-8', (err, pemPublicKey) => {
      if (err) {
        // Manejar cualquier error que ocurra al leer la clave pública
        console.error('Error al leer la clave pública:', err);
        socket.emit('getPublicKey', "NOKEY");
      }
      // Mostrar la clave pública en la consola
      console.log('Clave pública leída de:', pemFilePath);
      // Enviar la clave pública al cliente
      socket.emit('getPublicKey', pemPublicKey);
    });
  });
  // Manejar la desconexión de un socket
  socket.on('disconnect', () => {
    // Mostrar el ID del socket desconectado en la consola
    console.log('Usuario desconectado:', socket.id);
  });
});
// Ruta para servir el archivo index.html
server.listen(4000);
// Inicia el servidor en el puerto 4000
console.log('Server on port', 4000);
