import io from 'socket.io-client';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import forge from 'node-forge';
const socket = io('/');
var aesKey
function App() {
  const [message, setMessage] = useState(""); // Estado para almacenar el mensaje actual
  const [messages, setMessages] = useState([]); // Estado para almacenar los mensajes
  const username = sessionStorage.getItem('usuario'); // Nombre de usuario del emisor
  const private_key = forge.pki.privateKeyFromPem( sessionStorage.getItem('llaveP')); // Clave privada del emisor
  const public_Key = forge.pki.publicKeyFromPem(sessionStorage.getItem('publicKey')); // Clave pública del destinatario
  const userReciever = sessionStorage.getItem('destino'); // Nombre de usuario del destinatario
  const secret = sessionStorage.getItem('secreto'); // Contraseña secreta para derivar la clave AES
  const tipo = sessionStorage.getItem('tipo'); // Tipo de mensaje (enviarsecreto o enviarmsg)
  const salt = forge.random.getBytesSync(16); // Genera una sal aleatoria de 16 bytes
  const iterations = 10000; // Un número razonable de iteraciones para PBKDF2
  const keyLength = 16; // Longitud de clave deseada (32 bytes para AES-256)
  
  const navigate = useNavigate(); // Función de navegación de React Router
  // Verificar si el nombre de usuario y la clave privada están presentes
  if (!username || !private_key) {
    navigate('/'); // Redirigir al usuario a la pantalla de inicio de sesión si no lo están
  }
  if (secret === "") {
    // Escuchar el evento 'mesgkey' para recibir la clave AES cifrada
    useEffect(() => {
      // Manejar el evento 'mesgkey' para recibir la clave AES cifrada
      const handleMesgKey = (data) => {
        console.log('Clave AES cifrada:', data.encrypted);
        // Descifrar la clave AES cifrada con la clave privada
        try {
            // Descifrar la clave AES cifrada con la clave privada
            const aesKeyDescifrada = private_key.decrypt(data.encrypted, 'RSA-OAEP', {
                md: forge.md.sha512.create(),
                mgf1: {
                    md: forge.md.sha512.create(),
                },
            });
            // Codificar la clave AES descifrada y almacenarla en el estado
            console.log('Clave AES descifrada:', aesKeyDescifrada);
            // Almacenar la clave AES descifrada en la variable aesKey
            aesKey = aesKeyDescifrada;
            // Mostrar la clave AES descifrada en Base64
            console.log('Clave AES descifrada (Base64):', aesKey);
        } catch (error) {
            // Manejar cualquier error que ocurra al descifrar la clave AES
            console.error('Error descifrando la clave AES:', error);
        }
      };
      // Escuchar el evento 'mesgkey'
      socket.on('mesgkey', handleMesgKey);
        // Retornar una función de limpieza
        return () => {
            // Dejar de escuchar el evento 'mesgkey'
            socket.off('mesgkey', handleMesgKey);
        };
    }, []);
      
  }
  else {
    // Derivar la clave AES de la contraseña secreta
    useEffect(() => { 
        // Derivar la clave AES de la contraseña secreta
        aesKey = derivarClave(secret, salt, iterations, keyLength)
        // Mostrar la clave AES
        console.log('llave aes:', aesKey);
        // Cifrar la clave AES con la clave pública del destinatario
        const encrypted = public_Key.encrypt(aesKey, 'RSA-OAEP', {
            md: forge.md.sha512.create(),
            mgf1: {
                md: forge.md.sha512.create(),
            },
        })
        // Mostrar la clave cifrada
        console.log('llave cifrada:', encrypted);
        // Emitir la clave cifrada al servidor
        socket.emit('mesgkey', ({userReciever, encrypted , username}));
        return () => {
            // Dejar de escuchar el evento 'mesgkey'
            socket.off('mesgkey');
        }
    }, []);
  }
  // Manejar la desconexión del socket
  window.addEventListener('beforeunload', () => {
    if (socket) {
        socket.disconnect();
    }
  });
  // Manejar la salida del chat
  const handleExit = (e) => {
    e.preventDefault();
    // Limpiar el almacenamiento local y redirigir al usuario a la pantalla de seleccion de usuario
    aesKey = "";
    // Limpiar el almacenamiento local y redirigir al usuario a la pantalla de seleccion de usuario
    navigate('/users');
  };
  // Manejar el envío de un mensaje
  const handleSumit = (e) => {
    // Prevenir el envío del formulario y la recarga de la pagina 
    e.preventDefault();
    // Cifrar el mensaje con la clave AES y firmarlo con la clave privada
    console.log('Leyendo:', aesKey);
    // Cifrar el mensaje con la clave AES
    var encryptedmsg = cifrarMensaje(aesKey, message);
    // Firmar el mensaje con la clave privada
    var firma = firmarMensaje(forge.pki.privateKeyToPem(private_key), message);
    // Mostrar el mensaje cifrado en la consola
    console.log('Mensaje cifrado:', encryptedmsg);
    // Crear un nuevo mensaje con el mensaje cifrado y la firma para mostrarlo en la interfaz
    const newMessage = {
      body: encryptedmsg,
      from: 'Yo',
      firma: firma
    };
    // Agregar el nuevo mensaje al estado de mensajes
    setMessages(messages => [...messages, newMessage])
    // Emitir el mensaje cifrado al servidor
    socket.emit('message', {encryptedmsg, userReciever, firma});
  };
  useEffect(() => {
    // Manejar el evento 'message' para recibir mensajes del servidor
    socket.on('message', reciveMessage);
    return () => {
      // Dejar de escuchar el evento 'message' al desmontar el componente
      socket.off('message', reciveMessage);
    }
  }, []);
  // Función para recibir un mensaje y agregarlo al estado de mensajes
  const reciveMessage = message => 
    setMessages(state=>[...state, message]); // Agregar el mensaje al estado de mensajes
  // Función para derivar una clave de una contraseña y una sal
  function derivarClave(contrasena, salt, iterations, keySize) {
      // `salt` es un valor de entropía aleatorio, y `iterations` es el número de iteraciones de PBKDF2
      const derivedKey = forge.pkcs5.pbkdf2(contrasena, salt, iterations, keySize);
      return derivedKey;
  }
  
  // Función para cifrar un mensaje con AES utilizando una clave derivada
  function cifrarMensaje(clave, mensaje) {
      const iv = forge.random.getBytesSync(16); // Genera un vector de inicialización aleatorio
  
      // Crea un cifrador AES en modo CBC
      const cipher = forge.cipher.createCipher('AES-CBC', clave);
      cipher.start({ iv: iv });
      cipher.update(forge.util.createBuffer(mensaje));
      cipher.finish();
  
      // Devuelve el cifrado y el IV como un objeto
      const cifrado = {
          iv: iv,
          data: cipher.output.getBytes()
      };
  
      return cifrado;
  }
  // Función para firmar un mensaje con la clave privada utilizando SHA-512
  function firmarMensaje(privateKey, mensaje) {
    // Crea un objeto de hash SHA-512
    const md = forge.md.sha512.create();
    const private_Key = forge.pki.privateKeyFromPem(privateKey);
    md.update(mensaje, 'utf8'); // Actualiza el hash con el mensaje

    // Firma el hash con la clave privada
    const firma = private_Key.sign(md);
    return firma;
  }
  // Función para verificar la firma de un mensaje con la clave pública utilizando SHA-512
  function verificarFirma(publicKey, mensaje, firma) {
    // Crea un objeto de hash SHA-512
    const md = forge.md.sha512.create();
    const public_Key = forge.pki.publicKeyFromPem(publicKey);
    md.update(mensaje, 'utf8'); // Actualiza el hash con el mensaje
    // Verifica la firma utilizando la clave pública
    const esValido = public_Key.verify(md.digest().getBytes(), firma);
    return "firma: " + esValido ;
  }


  
  // Función para descifrar un mensaje con AES utilizando una clave derivada
  function descifrarMensaje(clave, cifrado) {
      // Crea un descifrador AES en modo CBC
      const decipher = forge.cipher.createDecipher('AES-CBC', clave);
      decipher.start({ iv: cifrado.iv });
      decipher.update(forge.util.createBuffer(cifrado.data));
      decipher.finish();
  
      // Devuelve el mensaje descifrado como una cadena
      const descifrado = decipher.output.toString();
      return descifrado;
  }

  return (
    <div className="nuevobody">
        <div className="contenedorR">
            <form onSubmit={handleExit} className="form1" >
              <button>Salir</button>
            </form>
            <p className="nombre">{userReciever}</p>
        </div>

        <div className="contenedor1">
          <ul id="messages">  
          {messages.map((message, index) => (
              <li key={index} className={
                `mensagefrom${message.from === 'Yo' ? 'Yo' : 'Otro'}` 
              }>
                <p className="msgtxt1">{
                message.from === 'Yo' ? username : userReciever 
                }</p>
                
                <p className="msgtxt2">{descifrarMensaje(aesKey,message.body)} {message.from === 'Yo' ? "": verificarFirma(forge.pki.publicKeyToPem(public_Key),descifrarMensaje(aesKey,message.body),message.firma)}</p></li>
          ))}
          </ul>
        </div>

        <div className="botonesfloat">
          <form onSubmit={handleSumit} className="botonesfloat">
            <input type="text" name="message" id="message" placeholder="mensaje" onChange={(e) => setMessage(e.target.value)}/>
            <button>Enviar</button>
          </form>
        </div>
    </div>
  );
}
export default App;