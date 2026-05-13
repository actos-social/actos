# Actos: definicion inicial

## Tesis

Actos es una red social donde la gente no sube contenido: sube actos.

El producto no busca maximizar atencion. Busca convertir tiempo disponible en ayuda concreta, amistades con proposito y pruebas visibles de comunidad.

Actos no es una app de mandados, favores gratis ni conveniencia inmediata. Su centro son necesidades humanas que tocan dignidad, cuidado, salud, autonomia, pertenencia u oportunidad.

## Version 0.2

La version actual valida el relato y el primer gesto de participacion:

- la persona entiende la tesis en la primera pantalla;
- puede dejar una intencion de piloto;
- recibe un match sugerido por reglas simples;
- obtiene una ficha copiable;
- puede registrar el acto en un diario local;
- ve ejemplos de actos y circulos iniciales.
- distingue entre una necesidad humana y un pedido por comodidad.

Todavia no hay backend. Las postulaciones se guardan en el navegador del usuario para prototipar el flujo sin costo.

## Usuarios iniciales

- Personas que se mudaron o se sienten solas en una ciudad.
- Personas buscando trabajo que necesitan ayuda puntual.
- Personas con saberes practicos que quieren ayudar sin entrar en una ONG formal.
- Barrios, universidades o comunidades que quieren activar ayuda local.

## Tres motores

### Banco de tiempo

Cada usuario puede publicar:

- que puede ofrecer esta semana;
- que necesita recibir;
- cuantos minutos puede dar;
- si prefiere online, presencial o ambos.

### Amistad con proposito

La app forma circulos chicos de 4 a 6 personas durante 21 dias.

Ejemplos:

- conseguir trabajo;
- salir mas de casa;
- adaptarse a una ciudad nueva;
- aprender un oficio;
- ayudar en el barrio.

### Diario colectivo

Cada acto completado puede quedar registrado como:

- privado;
- visible para el circulo;
- anonimo en el diario publico;
- placa compartible.

## Matching sin IA paga

El MVP puede funcionar con reglas simples:

- +40 si lo que una persona necesita coincide con lo que otra ofrece;
- +20 si comparten proposito;
- +15 si comparten zona o aceptan online;
- +15 si tienen horarios compatibles;
- +10 si prefieren el mismo formato.

La IA puede agregarse despues para ordenar textos, detectar categorias, resumir historias y ayudar a moderar. No es necesaria para validar.

## Pilotos recomendados

### Trabajo sin hacerlo solo

Para personas buscando empleo y personas que pueden revisar CVs, practicar entrevistas o dar orientacion.

### Salir mas de casa

Para personas que necesitan planes simples, baja presion y continuidad para volver a moverse.

### Ciudad nueva

Para personas que se mudaron, migraron o sienten que empiezan de cero en un lugar.

## Proxima arquitectura gratuita

- Frontend: GitHub Pages.
- Base de datos: Supabase Free o Firebase Free.
- Autenticacion: email magic link o formulario moderado.
- Matching: reglas deterministicas.
- Moderacion: reportes, revision manual y categorias bloqueadas.
- IA: opcional, solo cuando haya evidencia de uso real.

## Principios

- Gratis para usar.
- Sin likes como metrica central.
- Sin seguidores al principio.
- No resolver comodidad cuando no hay necesidad humana de fondo.
- Priorizar pedidos vinculados a dignidad, cuidado, salud, autonomia, pertenencia u oportunidad.
- Pocas acciones por semana para que sea manejable.
- Privacidad y anonimato cuando el acto lo requiera.
- Moderacion fuerte en pedidos sensibles.
- El impacto se mide en actos, horas y agradecimientos.

## Criterio cultural

La pregunta guia es:

> Si este acto ayuda a una persona a recuperar calma, dignidad, autonomia, salud, pertenencia u oportunidad, probablemente pertenece a Actos.

Ejemplos que si pertenecen:

- acompanar a alguien a un estudio medico si le da miedo ir solo;
- ayudar a preparar una entrevista laboral;
- explicar un tramite esencial;
- escuchar a alguien que atraviesa soledad;
- ensenar una habilidad que destraba autonomia.

Ejemplos que no son el centro:

- pedir traslados casuales por comodidad;
- resolver compras;
- reemplazar trabajo pago sin una necesidad humana de fondo;
- conseguir favores rapidos que no construyen cuidado ni comunidad.
