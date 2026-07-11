<div align="center">

# 🌸 Agenda Venezuela 🌸

```
        ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀
       ╔════════════════════════════════╗
       ║       AGENDA  VENEZUELA         ║
       ╚═══════════════╤════════════════╝
                       │
          /\___/\      │
     ❀   ( o   o )     │       ✿
     ✿   (  =^=  )     │
          )       (────╯
    🌷   (         )
          )  |   |  (          ❀
     ✿   (___|___|___)      ❀   ✿
       ~ ✿ ~ ❀ ~ ✿ ~ ❀ ~ ✿ ~ ❀ ~ ✿ ~
```

**Los eventos que están pasando en Venezuela, en un solo lugar.**
Guárdalos, compártelos y no te pierdas ni uno. 🎉

</div>

---

## 🐱 ¿Qué es esto? (explicado como si tuvieras 5 años)

Imagínate una **cartelera** en tu teléfono. Cada evento (un concierto,
un taller, una feria) es una **tarjeta** con una foto bonita, la fecha, el nombre
y dónde es. Si algo te gusta, le das a la **estrellita** ⭐ ("Me interesa") y se
guarda para ti. Y si quieres avisarle a un pana, le das a **compartir** 📤 y le
mandas el link. ¡Así de fácil!

---

## ✨ ¿Qué puede hacer? (la funcionalidad)

- 🏠 **Inicio**: una lista de tarjetas de eventos, una debajo de la otra.
- 🖼️ **Tarjetas**: cada una tiene imagen (tamaño ideal para redes), fecha, nombre y dirección.
- ⭐ **Me interesa**: guarda tus eventos favoritos **en tu propio teléfono** (nadie más los ve).
- 📤 **Compartir**: manda el evento por WhatsApp, Instagram, donde quieras.
- ➕ **Enviar evento**: botón arriba a la derecha para que la gente proponga sus eventos.
- 📱 **Responsive**: se ve genial en el teléfono; en computadora las tarjetas no pasan de 500px de ancho.
- 🎨 **Design system** (`/#/design-system`): una página secreta solo para ti donde puedes
  cambiar colores, tipografía y estilos en vivo, sin tocar código.

---

## 🧩 ¿Con qué está hecho? (la tecnología, sin complicaciones)

Piensa en la app como una **casa de LEGO**. Cada pieza tiene su función:

| Pieza | Qué es (nombre técnico + ejemplo) | Para qué sirve (en criollo) |
|-------|-----------------------------------|------------------------------|
| ⚛️ **React** | Librería de interfaz — como una caja de LEGO | Arma la pantalla con piezas reutilizables (las tarjetas, los botones). |
| 🔤 **TypeScript** | Lenguaje de programación con tipos — como un corrector ortográfico | Avisa los errores **antes** de que rompan algo. |
| ⚡ **Vite** | Herramienta de build y servidor de desarrollo — como el motor | Hace que todo cargue rapidísimo mientras se construye. |
| 🧭 **React Router** | Enrutador de páginas — como el mapa | Lleva del Inicio a la página del Design System. |
| 📄 **events.json** | Archivo de datos — como un cuaderno | Ahí se escriben los eventos. Sin base de datos, sin complicaciones. |
| 💾 **localStorage** | Almacenamiento del navegador — como la memoria del teléfono | Recuerda qué eventos marcaste con la estrellita. |
| 🚀 **GitHub Pages** | Hosting estático gratuito — como la casa donde vive | Publica la app gratis en internet para compartir el link. |

> **Sin servidores, sin backend, sin costos.** Todo es un sitio estático: archivos que
> el navegador abre directo. Por eso es fácil de publicar y de mantener.

---

## 🛠️ Para desarrollar

```bash
npm install      # instala las piezas
npm run dev      # abre la app en modo local
npm run build    # arma la versión final (carpeta dist/)
npm run preview  # revisa la versión final
```

---

## 📝 Agregar o editar eventos

Edita `src/data/events.json`. Cada evento se ve así:

```json
{
  "id": "identificador-unico",
  "image": "events/mi-imagen.svg",
  "startDate": "2026-01-26T14:00:00",
  "endDate": "2026-01-27T17:00:00",
  "name": "Nombre del evento",
  "venue": "Lugar",
  "city": "Caracas",
  "url": "https://enlace-opcional.com"
}
```

- 🖼️ `image`: pon el archivo en `public/events/` (ideal 1200×630, relación 1.91:1).
- `endDate` y `url` son opcionales.
- Para cambiar a dónde lleva el botón **"Enviar evento"** (por ejemplo, un Google Form),
  edita `SUBMIT_EVENT_URL` en `src/config.ts`.

---

## 🎨 Design system (tu página privada)

Entra a `/#/design-system` (enlace discreto en el pie de página). Ahí ajustas los
**tokens** (colores, tipografía, formas, espaciado) y ves los cambios al instante.
Se guardan en tu dispositivo; para hacerlos permanentes usa **"Exportar CSS"** y
pega el resultado en el bloque `:root` de `src/index.css`.

Estilo inicial: **botones negros sólidos + Helvetica** (fácil de cambiar luego).

---

## 🚀 Publicar en GitHub Pages

Cada vez que se hace push a `main`, el workflow `.github/workflows/deploy.yml`
compila y publica la app automáticamente.

Configuración única (ya hecha): **Settings → Pages → Source: GitHub Actions**.

🌍 URL pública: **https://macakuaya.github.io/AgendaVenezuela/**

> El `base` en `vite.config.ts` está en `'./'` (rutas relativas), así que la app
> funciona bajo cualquier nombre de repositorio sin tener que tocar la configuración.

---

<div align="center">

Hecho con 🐈 y 🌷 para los venezolanos.

</div>
