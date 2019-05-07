# Prueba para fintonic

## Operaciones

### Listar

Para listar todos los productos

```
GET http://localhost:3000/product
``` 

Para listar un producto determinado por id

```
GET http://localhost:3000/product/id
```

### Insertar

```
POST http://localhost:3000/product

{name: 'nombre'[, description: 'descripcion']}
```

### Eliminar

```
DELETE http://localhost:3000/product/id
```

## Uso

### Ejecución 

```
npm start
```

Por defecto escucha en **localhost:3000** y crea una base de datos en **localhost** con nombre **fintonic**. Se puede configurar por
variables de entorno.

### Tests

````
npm test
````

Por defecto escucha en **localhost:3001** y crea una base de datos en **localhost** con nombre **test**. Se puede configurar por 
variables de entorno.

## Variables de entorno

- **DB_URL**: Url del servidor de base de datos
- **DB_NAME**: Nombre de la base de datos
- **PORT**: Puerto del servidor http

## TODO

- Operación para actualizar productos ( con autenticación )
- Listado por filtros y paginado
- https
- Múltiples usuarios
- Credenciales encriptadas
- Autenticación para acceso a base de datos
- Implementar sistema de logs / auditoría