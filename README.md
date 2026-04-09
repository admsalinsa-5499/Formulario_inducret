# 🏗️ INDUCRET – Alta de Empleados
### Formulario web para registro de nuevos empleados

---

## 📁 Estructura del proyecto

```
inducret/
├── index.html          ← Página principal (el formulario)
├── style.css           ← Todos los estilos visuales
├── script.js           ← Toda la lógica JavaScript
├── Logo_de_inducret.jpg            ← Logo (ícono)
├── MARCA_COLOR_POSITIVO_B_page-0001.JPG  ← Logo completo
└── README.md           ← Esta guía
```

---

## 🖥️ CÓMO ABRIR EL PROYECTO EN VISUAL STUDIO CODE

### Paso 1 — Instalar Visual Studio Code (si no lo tenés)
1. Ir a https://code.visualstudio.com
2. Descargar e instalar para tu sistema operativo

### Paso 2 — Abrir la carpeta del proyecto
1. Abrí VS Code
2. Click en **Archivo → Abrir Carpeta...**
3. Navegá hasta la carpeta `inducret` y hacé click en **Seleccionar carpeta**

### Paso 3 — Instalar la extensión "Live Server"
Esta extensión te permite ver la página en tiempo real mientras la editás.

1. En VS Code, hacé click en el ícono de **Extensiones** (Ctrl+Shift+X)
2. Buscá: `Live Server`
3. Instalá la extensión de **Ritwick Dey** (la que tiene más descargas)

### Paso 4 — Ejecutar el proyecto
1. En VS Code, click derecho sobre `index.html` en el explorador de archivos
2. Seleccioná **"Open with Live Server"**
3. Se abrirá tu navegador en `http://127.0.0.1:5500/index.html`

> ✅ Cada vez que guardes un cambio (Ctrl+S), la página se actualiza automáticamente.

---

## 🌐 CÓMO PUBLICAR EN GITHUB PAGES (paso a paso)

GitHub Pages te permite publicar páginas web **gratis** desde un repositorio de GitHub.
La URL final será: `https://tu-usuario.github.io/inducret-empleados/`

---

### PARTE A — Crear cuenta en GitHub

1. Ir a https://github.com
2. Click en **"Sign up"**
3. Completar: nombre de usuario, email y contraseña
4. Verificar el email que te mandan

---

### PARTE B — Instalar Git en tu computadora

Git es el programa que conecta tu carpeta local con GitHub.

**En Windows:**
1. Ir a https://git-scm.com/download/win
2. Descargar e instalar (dejar todas las opciones por defecto)
3. Verificar: abrí **Git Bash** y escribí `git --version`

**En Mac:**
- Abrí Terminal y escribí: `git --version`
- Si no está instalado, macOS te preguntará si querés instalarlo

---

### PARTE C — Configurar Git con tus datos

Abrí la terminal (Git Bash en Windows, Terminal en Mac/Linux) y escribí:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

> ⚠️ Reemplazá con TU nombre y email (los mismos de GitHub).

---

### PARTE D — Crear el repositorio en GitHub

1. Iniciá sesión en https://github.com
2. Click en el botón verde **"New"** (arriba a la izquierda)
3. Completá:
   - **Repository name:** `inducret-empleados`
   - **Descripción:** `Formulario de alta de empleados Inducret`
   - Seleccioná **Public** (es necesario para GitHub Pages gratis)
   - NO marques "Add a README file" (ya tenés uno)
4. Click en **"Create repository"**

---

### PARTE E — Subir el proyecto a GitHub

Abrí la terminal **dentro de la carpeta del proyecto** y ejecutá estos comandos uno por uno:

```bash
# 1. Inicializar Git en la carpeta
git init

# 2. Agregar todos los archivos al "stage" (preparados para subir)
git add .

# 3. Crear el primer "commit" (guardar el estado actual)
git commit -m "Primer commit: formulario de alta de empleados"

# 4. Renombrar la rama principal a "main"
git branch -M main

# 5. Conectar con tu repositorio de GitHub
#    (reemplazá TU-USUARIO con tu nombre de usuario real)
git remote add origin https://github.com/TU-USUARIO/inducret-empleados.git

# 6. Subir los archivos a GitHub
git push -u origin main
```

> 💡 Te va a pedir tu usuario y contraseña de GitHub (o un token de acceso).

---

### PARTE F — Activar GitHub Pages

1. Ir a tu repositorio en GitHub
2. Click en **"Settings"** (engranaje, arriba a la derecha del repo)
3. En el menú izquierdo, click en **"Pages"**
4. En **"Source"**, seleccioná:
   - Branch: **main**
   - Folder: **/ (root)**
5. Click en **"Save"**
6. Esperá 1-2 minutos
7. Aparecerá un mensaje verde con tu URL:
   ```
   ✅ Your site is published at https://TU-USUARIO.github.io/inducret-empleados/
   ```

---

### PARTE G — Crear y pegar el QR en administración

1. Abrí la URL de tu página en el navegador
2. Click en el botón **"QR"** (abajo a la derecha)
3. Se genera automáticamente el QR con la URL de tu página
4. Click en **"🖨 Imprimir QR"**
5. Imprimí y pegá en administración

> Cuando un empleado escanee el QR, se abrirá el formulario en su celular.

---

### PARTE H — Actualizar la página cuando hagás cambios

Cada vez que modifiques algo y quieras que se actualice en línea:

```bash
# 1. Agregar los cambios
git add .

# 2. Guardar con un mensaje descriptivo
git commit -m "Descripción del cambio"

# 3. Subir a GitHub (automáticamente se actualiza la página)
git push
```

---

## 📱 CÓMO FUNCIONA EL FLUJO COMPLETO

```
1. El empleado escanea el QR con su celular
         ↓
2. Se abre el formulario en el navegador
         ↓
3. Completa las 6 secciones (Identificación, Domicilio,
   Contacto, Datos Personales, Familiares, Documentos)
         ↓
4. En la sección Documentos, saca fotos con la cámara
   o adjunta archivos de DNI y Licencia
         ↓
5. Presiona "Enviar y Descargar Excel"
         ↓
6. Se descarga automáticamente:
   ✅ Un archivo Excel (.xlsx) con todos los datos
   ✅ Las fotos/PDFs de DNI (frente y dorso)
   ✅ Las fotos/PDFs de Licencia (frente y dorso)
         ↓
7. El empleado o el administrador sube los archivos
   a la carpeta compartida de Google Drive
```

---

## ⚠️ NOTA SOBRE LOS ARCHIVOS EN GOOGLE DRIVE

Los navegadores, por seguridad, **no pueden guardar archivos directamente en Google Drive**.
El proceso es:
1. El formulario descarga los archivos al dispositivo del empleado
2. El empleado (o admin) los sube manualmente a la carpeta de Drive

**Alternativa más avanzada:** Si en el futuro querés que se suba automáticamente a Drive,
se necesita integrar la API de Google Drive, lo cual requiere configuración adicional.
Preguntame cuando llegues a ese punto y lo hacemos juntos.

---

## 🔧 COMANDOS GIT MÁS USADOS

| Comando | Qué hace |
|---------|----------|
| `git status` | Ver qué archivos cambiaron |
| `git add .` | Preparar TODOS los cambios |
| `git add archivo.html` | Preparar UN archivo específico |
| `git commit -m "mensaje"` | Guardar los cambios con descripción |
| `git push` | Subir a GitHub |
| `git pull` | Bajar cambios de GitHub |
| `git log` | Ver historial de commits |

---

## ❓ PREGUNTAS FRECUENTES

**¿Por qué el QR dice "127.0.0.1" en vez de la URL real?**
Porque estás viendo el proyecto en modo local (Live Server).
El QR correcto se genera cuando la página está publicada en GitHub Pages.

**¿El formulario guarda datos en una base de datos?**
No, actualmente genera archivos que se descargan al dispositivo.
Para guardar en la nube se necesita un backend (servidor), lo cual es el siguiente nivel.

**¿Funciona sin internet?**
Una vez que el empleado abre la página, sí. Pero las librerías (SheetJS, QRCode)
se cargan desde internet, así que la primera vez necesita conexión.

**¿Cómo agrego más campos al Excel?**
En `script.js`, función `recolectarDatosEmpleado()`, agregá la propiedad.
En `index.html`, agregá el campo HTML correspondiente.

---

*Desarrollado para Inducret Hormigón Elaborado S.A.S.*
