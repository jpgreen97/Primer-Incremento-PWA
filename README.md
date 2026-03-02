# Primer-Incremento-PWA
Ingenieria de Software Meta 1.4 Primer incremento
# Sistema de Revisión Académica PWA (MVP)

Este es un prototipo de aplicación web progresiva (PWA) que permite gestionar y revisar artículos académicos incluso sin conexión a internet.

> **Materia:** Ingeniería de Software
> **Meta:** 1.4 - Arquitectura de Software

##  Funcionalidades
* **Editor:** Registra artículos y asigna estados (usa LocalStorage).
* **Revisor (Offline):** Guarda evaluaciones sin internet (usa IndexedDB).
* **Autor:** Consulta el estado de su artículo.
* **PWA:** Instalable y funciona offline gracias al Service Worker.

##  Cómo ejecutarlo
No necesitas instalar nada. Solo necesitas un navegador y VS Code.

1.  Abre la carpeta del proyecto en **Visual Studio Code**.
2.  Abre el archivo `UI2.html`.
3.  Usa la extensión **"Live Server"** (Click derecho -> Open with Live Server).

##  Cómo probarlo
1.  **Editor:** Registra un artículo nuevo.
2.  **Revisor:** Desconecta tu internet, selecciona el artículo, llena la evaluación y guárdala. Verás que se guarda en el dispositivo.
3.  **Sincronización:** Vuelve a conectar internet y dale a "Enviar".
