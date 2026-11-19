# Ejecutar, editar y comprobar
+
+## Usar la aplicación
+
+Abre `index.html` directamente en tu navegador. También puedes servir esta carpeta con un servidor estático local; por ejemplo, desde PowerShell con Python instalado:
+
+```powershell
+python -m http.server 8000 --bind 127.0.0.1
+```
+
+Abre <http://127.0.0.1:8000> y termina el servidor con Ctrl+C. No hace falta servidor para jugar. Los archivos pueden abrirse en VS Code, Antigravity o Sublime Text; no hay proyecto que compilar en Visual Studio o NetBeans.
+
+## Reglas y datos
+
+Se mantiene la regla original: dos bloques verdes al inicio, agregar verde, alternar verde/azul y eliminar ambos al formar dos azules. Eliminar por color elimina todos los de ese color. El máximo es 200 bloques; el historial conserva las últimas 100 acciones. Al deshacer y realizar otra acción se descarta la rama de rehacer. Un reinicio también puede deshacerse. Los identificadores son locales al tablero; un reinicio vuelve a comenzar en 1.
+
+No hay guardado, cookies, localStorage, cuentas ni backend. Recargar, cerrar o volver a abrir la página reinicia el tablero. No se sincroniza entre pestañas. El motor limita memoria y el DOM; no es una plataforma de juegos multijugador ni incluye instalaciones.
+
+## Pruebas opcionales para desarrollo
+
+Solo para pruebas: Node 22 o superior y npm. Validado con Node 24.22.3, Playwright 1.65.1 y Edge 157.0.4341.60. La página no requiere npm ni ninguna dependencia para ejecutarse.
+
+```powershell
+npm ci --ignore-scripts
+npm test
+$env:COLOR_BROWSER = 'msedge'
+npm run test:browser
+```
+
+`msedge` utiliza Edge instalado, con un perfil temporal independiente del personal. Si prefieres Chromium de Playwright:
+
+```powershell
+Remove-Item Env:COLOR_BROWSER -ErrorAction SilentlyContinue
+npx playwright install chromium
+npm run test:browser
+```
+
+El test de navegador inicia y cierra su propio servidor HTTP en localhost y un puerto libre; además verifica abrir index.html mediante file://. Para guardar capturas, crea una carpeta y configura `COLOR_SCREENSHOTS` con su ruta absoluta antes de ejecutar. Los resultados y perfiles no se suben al repositorio.
+
+`npm test`: seis casos del motor, con reglas, historial, independencia de copias, capacidad y 3000 acciones mixtas deterministas. `test:browser`: cinco casos con ratón, teclado/foco, vaciado/recuperación, contadores, historial, 200 bloques, vistas 320/390/768/1280, controles de 44 px y apertura directa. Se revisaron capturas móviles/escritorio. Las pruebas HTTP fallan ante excepciones JavaScript o peticiones a otros orígenes. No se realizaron llamadas a servicios externos de la aplicación.
+
+## Archivos y límites
+
+- `js/model.js`: reglas e historial, compartido por navegador y pruebas Node.
+- `js/index.js`: renderizado seguro con textContent, delegación de eventos y gestión de foco.
+- `css/style.css`: diseño adaptable y respeto de movimiento reducido.
+- `js/jquery-3.0.0.min.js`: copia histórica conservada, sin cargar en la aplicación. No se asegura la compatibilidad con navegadores antiguos que dependían de esta versión.
+- `tests/` y package-lock.json: pruebas reproducibles. No hay dependencias de producción. npm audit informó cero avisos en las dependencias npm instaladas; no es una auditoría de seguridad completa del repositorio histórico.
+
+Los colores tienen texto y los controles usan botones nativos. Se verificó teclado con Edge; falta evaluación dedicada con lectores de pantalla y otros motores de navegador. No se publicó un sitio ni se generó instalador.
+
+`.gitignore` conserva fuentes y lockfile, e ignora node_modules, capturas, cobertura, reportes, configuración privada y estado del editor.
+