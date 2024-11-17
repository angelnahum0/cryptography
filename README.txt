Manual de usuario
Vamos a explicar el paso a paso de cómo ejecutar el código por primera vez, te llevaremos de la mano para que no te pierdas 😊
1.	Primero, necesitamos tener instalado Node.js (una biblioteca de JavaScript que se puede descargar desde la siguiente liga: https://nodejs.org/en).
2.	Una vez instalada esa biblioteca, el código se puede ejecutar desde la terminal, o también se puede abrir el folder en Visual Studio y utilizar la terminal de VS para ejecutar el código.
3.	Una vez en la terminal de nuestra elección, nos vamos a ubicar en la ruta de la carpeta “NH” y vamos a ejecutar el siguiente comando:
npm run dev
4.	En una nueva terminal hacemos lo mismo pero esta vez nos ubicamos en la carpeta “cripto” dentro de "NH" y ejecutamos el mismo comando.
5.	Una vez hecho esto, se nos desplegará un link como el siguiente: http://localhost:5173/. Abrir ese link en el navegador de nuestra preferencia. *NOTA: Poner el navegador en modo claro para que no haya problemas al mostrar los textos.
6.	Una vez dentro del link, nos debe aparecer lo siguiente:
Como es nuestra primera vez dentro, vamos a dar click al botón “CREAR LLAVES”, del lado derecho.
7.	Eso nos llevará a la siguiente ventana:
 
En esta ventana vamos a crear nuestro usuario con el nombre que queramos y la contraseña que queramos. Al dar click en “GENERAR” se crearán nuestras llaves asimétricas. La llave privada se descargará en nuestro equipo así como se ve en la imagen. Después, damos click en “INICIA SESION”.
8.	Volveremos a la ventana del punto 6: Ahora vamos del lado izquierdo, iniciamos sesión con el nombre de usuario y contraseña que pusimos hace rato. También subimos nuestra llave privada (ubicada en la carpeta de Descargas). Damos click en “EMPEZAR”.

9.	En esta ventana nos aparecen los usuarios conectados al servidor, si queremos hablar con alguno de ellos lo seleccionamos, introducimos el secreto que se usará para crear la llave simétrica. Al ser el primer usuario en línea, debemos dejar el campo de secreto en blanco y darle a “EMPEZAR A CHATEAR”. Esto se realiza con la intención de tener al menos 1 usuario en línea, esperando a que llegue otro usuario a chatear con él.
	En otro navegador o en otra ventana abrimos la página y nos posicionamos hasta este punto, obviamente con las credenciales de un usuario diferente al que creamos por primera vez. Nos aparecerá el primer usuario (el que se conectó sin secreto): Vamos a chatear con él, entonces ahora sí metemos un secreto y la damos a “EMPIEZA A CHATEAR”.
 
10.	Una vez que ya seleccionamos algún usuario en línea y entramos al chat con un secreto, nos aparece el chat en sí. Al lado de los mensajes recibidos aparece la leyenda “firma: true”, esto confirma la firma electrónica, con lo que se verifica la autenticidad e integridad de los mensajes.
11.	Para salir del chat debemos darle a “SALIR”, regresaremos a la selección de usuarios para chatear, le volvemos a dar a “SALIR” y llegaremos a la ventana inicial donde iniciamos sesión, hasta ese punto podemos cerrar la ventana del navegador, vamos a las 2 terminales que activamos (la de la carpeta “NH” y la de la carpeta “cripto”) y damos “Ctrl+C” para terminar de ejecutar el programa.
