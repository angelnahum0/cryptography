import io from 'socket.io-client';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
const socket = io('/');

function App() {
  const username = sessionStorage.getItem('usuario'); // Obtiene el nombre de usuario
  const private_key = sessionStorage.getItem('llaveP'); // Obtiene la clave privada
  const [users, setUsers] = useState([]);// Lista de usuarios activos
  const [secreto, setSecret] = useState([]); // Mensaje secreto
  const [reciever, setReciver] = useState([]); // Destinatario
  const navigate = useNavigate(); // Función para cambiar de ruta
  let ii // Variable para recorrer la lista de usuarios
  // Verifica si el nombre de usuario y la clave privada existen 
  if (!username || !private_key) {
    // Si no existen, redirige a la página de inicio
    navigate('/');
  }
  // Emite el nombre de usuario al servidor para agregarlo a la lista de usuarios activos
  socket.emit('usuario', username);
  useEffect(() => {
    // Recibe la lista de usuarios activos
    socket.on('usuariosActivos', reciveUsers);
    return () => {
      // Elimina el evento 'usuariosActivos' cuando el componente se desmonta
      socket.off('usuariosActivos', reciveUsers);
    }
  }, []);
  // Función para recibir la lista de usuarios activos
  const reciveUsers = (user) => {
    // Recibe la lista de usuarios activos y la almacena en el estado quitando el usuario del mismo nombre
    for (ii = 0; ii < user.length; ii++) {
      if (user[ii].user === username) {
        user.splice(ii, 1);
        break;
      }
    }
    // Actualiza el estado con la lista de usuarios activos
    setUsers(user)
  };
  // Función para salir de la aplicación
  const handleExit = (e) => {
    // Evita que el formulario se envíe y recargue la página
    e.preventDefault();
    // Emite el evento 'salir' al servidor
    socket.emit('salir');
    socket.off('salir');
    // Elimina los datos de la sesión
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('llaveP');
    // Redirige a la página de inicio
    navigate('/');
  };
  // Función para enviar un mensaje secreto
  const handleSumit = (e) => {
    e.preventDefault();
    // Almacena el mensaje secreto, el destinatario y el tipo de mensaje en la sesión
    sessionStorage.setItem('secreto', secreto);
    sessionStorage.setItem('destino', reciever);
    sessionStorage.setItem('tipo', 'enviarsecreto');
    // Verifica si la clave pública del destinatario existe
    if (sessionStorage.getItem('publicKey') === "NOKEY") {
      // Si no existe, muestra un mensaje en la consola
      console.log('No se encontró la clave pública del destinatario');
      return;
    }
    else{
      // Si existe, redirige a la página de mensaje
      navigate('/mensaje');
    }
  };
  return (
    <div className="nuevobody">
        <div className="contenedorR">
              <button onClick={handleExit}>Salir</button>
            <p className="nombre"></p>
        </div>

        <div className="contenedor1">
        <form onSubmit={handleSumit} className="botonesfloat">
          {users.map((user, index) => (
             <div key={index} className="mensagefrom">
              <input type='radio' key={index}  value={user.user} onChange={
                (e)=> {
                  setReciver(e.target.value) // Almacena el destinatario en el estado
                  socket.emit('getPublicKey', e.target.value) // Emite el evento 'getPublicKey' al servidor
                  socket.on('getPublicKey', (pemPublicKey) => { // Recibe la clave pública del destinatario
                    sessionStorage.setItem('publicKey', pemPublicKey); // Almacena la clave pública en la sesión
                  });
                }
                 } />
              {
              user.user // Muestra el nombre de usuario
              } {
              user.from// Muestra  el ID del socket
              }<br />
              </div>
          ))}          
            <input type="text" name="message" id="message" placeholder="secreto" onChange={(e) => setSecret(e.target.value)}/>
            <button>Empieza a chatear</button>
          </form>
        </div>
    </div>
  );
}
export default App;