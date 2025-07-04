# Libros APP API

API para servir libros en español gratuitos para la app de [Libros en Español](https://play.google.com/store/apps/details?id=com.luisjdev.libros)

## Concepto

El objetivo de esta API es que a través de peticiones GET permitan: listar todos los libros con paginación, obtener las categorías de los libros existentes, obtener los autores de los libros existentes y realizar búsquedas por coincidencia, categoría o autor.

## Requisitos

- Esta API utiliza el sistema de autenticación clásico por coincidencia de checksum de MD5 así como el sistema de [luisjdev0/auth-api-service](https://github.com/luisjdev0/auth-api-service.git) aunque puede ser modificado directamente en el código fuente.

- El repositorio contiene un archivo llamado ```libros_app_scrapper.py``` El cual permite obtener libros en español de [lectulandia](https://ww3.lectulandia.com/) para posteriormente ser servidos por el API.

## Despliegue

Para compilar el proyecto, ejecutar el comando ``` npm run build ```, se creará un directorio llamado  ``` dist/ ``` el cual contendrá toda la implementación (excepto el archivo de variables de entorno, el cuál deberá se agregado manualmente).

## Headers

El endpoint disponible solo podrá ser utilizado si el token JWT es valido y contiene el ```API_ID``` definido en las variables de entorno, el token será validado con la firma definida en la variable ```JWT_SECRET_KEY```

```http
Authorization: Bearer <AUTH_SECRET_TOKEN>
```

## Endpoints

A continuación, se listarán los endpoints disponibles en el API:

Obtiene información referente a los libros, autores y géneros cargados
```http
GET /v3/stats
```

Obtiene los libros agregados el día actual:
```http
GET /v3/today
```

Obtener los libros por página:
```http
GET /v3/page/<PAGE>
```

Obtener todos los autores registrados o buscar uno:
```http
GET /v3/tags/
GET /v3/tags/<TAG>
```

Obtener los géneros de los libros registrados o buscar uno:
```http
GET /v3/genres/
GET /v3/authors/<AUTHOR>
```

Búsquedas:
    
- Por coincidencia:
    ```http
    GET /v3/search/<PARAM>
    ```
- Por autor:
    ```http
    GET /v3/search/author/<AUTHOR>
    ```
- Por Categoría:
    ```http
    GET /v3/search/genres/<GENRE>
    ```