# Publicacion en GitHub

## Estado actual

Este proyecto esta separado de Lux y Tidial. La carpeta local contiene una PWA estatica lista para subir a un repositorio nuevo.

Desde la integracion disponible no aparecen organizaciones ni instalaciones de GitHub asociadas a la cuenta. Ademas, GitHub normalmente no permite crear organizaciones completas por API desde este tipo de herramienta.

## Paso 1: crear organizacion

Crear una organizacion nueva en GitHub desde la cuenta principal.

Nombres posibles:

- actos-app
- actos-social
- red-actos
- proyecto-actos
- tiempo-en-comunidad

Recomendacion inicial: `actos-social`, si esta disponible.

## Paso 2: crear repositorio

Dentro de la organizacion, crear un repositorio nuevo:

Nombre recomendado: `actos`

Configuracion:

- visibilidad: public, si la idea va a ser abierta;
- README: no hace falta, ya existe uno local;
- .gitignore: no hace falta, ya existe uno local;
- licencia: pendiente de definir.

## Paso 3: subir archivos

Cuando el repositorio exista, subir estos archivos:

- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `sw.js`
- `icon.svg`
- `README.md`
- `PRODUCT.md`
- `.gitignore`

## Paso 4: activar GitHub Pages

En el repositorio:

1. Entrar a Settings.
2. Ir a Pages.
3. Source: Deploy from a branch.
4. Branch: `main`.
5. Folder: `/root`.

La URL quedaria con este formato:

`https://NOMBRE_ORG.github.io/actos/`

## Paso 5: siguiente version

- agregar registro real;
- conectar una base de datos gratuita;
- crear perfiles;
- guardar actos y circulos;
- sumar moderacion;
- generar placas compartibles para Instagram.
