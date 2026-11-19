# Bloques de colores
+
+Práctica interactiva recuperada del ejercicio original de jQuery. La aplicación actual usa HTML, CSS y JavaScript nativo, sin dependencias de ejecución ni servicios externos.
+
+Abre **index.html** en Edge, Chrome o Firefox para usarla. No necesitas instalar Node, Python ni un servidor. Puedes editarla en VS Code, Antigravity o Sublime Text.
+
+## Cómo se juega
+
+- Comienzas con dos bloques verdes; puedes agregar más.
+- Cada bloque cambia entre verde y azul con un clic, Enter o Espacio.
+- **Al aparecer el segundo azul se eliminan los dos**, como en la práctica original.
+- Los botones de eliminar quitan todos los bloques del color indicado.
+- Deshacer/rehacer incluye eliminaciones y reinicios. Una nueva acción descarta la rama de rehacer.
+
+## Mejoras del 18 de noviembre de 2026
+
+- Interfaz en español adaptable a móvil, contadores y explicación visible de las reglas.
+- Botones accesibles por teclado, estados de color escritos, mensajes de resultado y restauración del foco cuando un bloque desaparece.
+- Motor independiente del DOM, historial limitado a 100 acciones y máximo de 200 bloques para acotar memoria y tamaño de la página.
+- Sin CDN, red, cuentas ni almacenamiento persistente: al recargar vuelves al inicio.
+- README, guía y exclusiones actualizados. El archivo histórico jQuery 3.0.0 se conserva para referencia, pero la página ya no lo carga; el código anterior permanece en el historial Git.
+
+## Comprobaciones
+
+Seis pruebas del motor aprobadas, incluyendo 3000 acciones deterministas con comprobación de identidades, límites y estados. Cinco pruebas reales en Edge aprobadas: reglas, eliminación, historial, teclado/foco, límite de 200, apertura directa como archivo y tamaños 320/390/768/1280 sin desbordamiento horizontal. Sin excepciones JavaScript ni solicitudes externas en los recorridos HTTP.
+
+Consulta [RUNNING.md](RUNNING.md) para repetir las pruebas. Es una página estática: no tiene compilación, backend, instalador ni despliegue público. No se afirma certificación en todos los navegadores o con lectores de pantalla.
+