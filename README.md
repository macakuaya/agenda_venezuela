<div align="center">

# 🌸 Agenda Venezuela 🌸

**Las iniciativas solidarias por Venezuela, en un solo lugar.**
Guárdalos, compártelos y no te pierdas ni uno. 🎉

</div>



        ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀ ✿ ❀
       ╔═══════════════════════════╗
       ║     AGENDA  VENEZUELA     ║
       ╚═══════════════╤═══════════╝
                       │
          /\___/\      │
         ( o   o )     │       
       ~ ✿ ~ ❀ ~ ✿ ~ ❀ ~ ✿ ~ ❀ ~ ✿ ~

## **🐱 ¿Qué es esto?**

Imagínate una **cartelera** en tu teléfono. Cada evento (un concierto, un taller, una feria) es una **tarjeta** con una foto, la fecha, el nombre y dónde es. Si algo te gusta, le das a la **estrellita** ⭐ ("Me interesa") y se guarda para ti. Y si quieres avisarle a un pana, le das a **compartir** 📤 y le mandas el link. ¡Así de fácil!

## **✨ ¿Qué puede hacer? (la funcionalidad)**

- 🏠 **Inicio**: una lista de tarjetas de eventos, una debajo de la otra.
- 🖼️ **Tarjetas expandibles**: toca una tarjeta para ver organizadores, necesidades, beneficiarios, contacto y enlaces.
- 📍 **Filtro por ciudad**: encuentra eventos de Barcelona, Mataró o cualquier otra ciudad publicada.
- ⭐ **Me interesa**: guarda tus eventos favoritos **en tu propio teléfono** (nadie más los ve).
- 📤 **Compartir**: manda el evento por WhatsApp, Instagram, donde quieras.
- ➕ **Enviar evento**: botón arriba a la derecha para que la gente proponga sus eventos.
- 📱 **Responsive**: se ve genial en el teléfono; en computadora las tarjetas no pasan de 500px de ancho.
- 🎨 **Design system** (`/#/design-system`): una página secreta solo para ti donde puedes cambiar colores, tipografía y estilos en vivo, sin tocar código.

## **🧩 ¿Con qué está hecho? (la tecnología, sin complicaciones)**

Piensa en la app como una **casa de LEGO**. Cada pieza tiene su función:

| **Pieza** | **Qué es** | **Para qué sirve (en criollo)** |
| --- | --- | --- |
| ⚛️ **React** | Librería de interfaz | Arma la pantalla con piezas reutilizables (las tarjetas, los botones). |
| 🔤 **TypeScript** | Lenguaje de programación con tipos | Avisa los errores **antes** de que rompan algo. |
| ⚡ **Vite** | Herramienta de build y servidor de desarrollo | Hace que todo cargue rapidísimo mientras se construye. |
| 🧭 **React Router** | Enrutador de páginas | Lleva del Inicio a la página del Design System. |
| 🗄️ **Supabase** | Base de datos y archivos | Guarda los eventos, el texto editable y las imágenes. |
| 🔐 **Netlify Function** | Backend privado del panel | Verifica el PIN en el servidor y realiza las escrituras sin exponer credenciales. |
| 💾 **localStorage** | Almacenamiento del navegador | Recuerda qué eventos marcaste con la estrellita. |
| 🚀 **Netlify** | Hosting y funciones | Publica la web y ejecuta el backend privado del panel. |

La agenda utiliza los planes gratuitos de Netlify y Supabase. `events.json`
queda como respaldo de lectura si la base de datos no está disponible.

## **🛠️ Para desarrollar**

```
npm install      # instala las piezas
npm run dev      # abre la app en modo local
npm run build    # arma la versión final (carpeta dist/)
npm run preview  # revisa la versión final
```

Para probar también la función de administración usa `netlify dev` y configura
las variables descritas en [`supabase/README.md`](supabase/README.md).

## **📝 Agregar o editar eventos**

Edita `src/data/events.json`. Cada evento se ve así:

```
{
  "id": "identificador-unico",
  "image": "events/mi-imagen.svg",
  "startDate": "2026-01-26T14:00:00",
  "endDate": "2026-01-27T17:00:00",
  "name": "Nombre del evento",
  "venue": "Lugar",
  "city": "Caracas",
  "url": "https://enlace-opcional.com",
  "organizer": "Quién organiza",
  "beneficiary": "A quién beneficia",
  "needs": "Qué necesita",
  "contactPhone": "+34 600 00 00 00",
  "whatsappUrl": "https://chat.whatsapp.com/..."
}
```

- 🖼️ `image`: pon el archivo en `public/events/` (ideal 1200×630, relación 1.91:1).
- `endDate` y `url` son opcionales.
- Para cambiar a dónde lleva el botón **"Enviar evento"** (por ejemplo, un Google Form), edita `SUBMIT_EVENT_URL` en `src/config.ts`.
- El panel `/#/clarisa` permite editar esos mismos campos sin tocar el JSON.
- El texto y el enlace del bloque comunitario se editan desde `/#/clarisa`. En
  proyectos Supabase ya existentes, ejecuta una vez `supabase/site-content.sql`.
- El PIN se guarda como variable privada `CLARISA_PIN` en Netlify; nunca se
  incluye en el JavaScript que recibe el navegador.

## **🎨 Design system (tu página privada)**

Entra a `/#/design-system` (enlace discreto en el pie de página). Ahí ajustas los **tokens** (colores, tipografía, formas, espaciado) y ves los cambios al instante. Se guardan en tu dispositivo; para hacerlos permanentes usa **"Exportar CSS"** y pega el resultado en el bloque `:root` de `src/index.css`.

Estilo inicial: **botones negros sólidos + Helvetica** (fácil de cambiar luego).

## **🚀 Publicar en Netlify**

Conecta el repositorio desde Netlify. La configuración de build vive en
`netlify.toml`: ejecuta `npm run build`, publica `dist/` y empaqueta la función
de `netlify/functions/`.

Antes del primer despliegue configura estas variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — secreta, solo para la función.
- `CLARISA_PIN` — secreto largo compartido con la persona administradora.

Hecho con 🐈 y 🌷 para los venezolanos.
