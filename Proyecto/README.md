# Proyecto Semi-Social — Seminario de Sistemas 1

---

## Datos de los estudiantes

| Nombre Completo                    | Carné           |
|------------------------------------|-----------------|
| Sergio Joel Rodas Velez            | 202200271       |
| Rodrigo Sebastian Castro Aguilar   | 202204496       |
| Moisés Iván Daniel Alvarado García | 202002907       |

---
## Tabla de Contenidos

- [Datos del equipo](#1-datos-del-equipo)
- [Descripción del proyecto](#2-descripción-del-proyecto)
- [Arquitectura](#3-arquitectura)
- [Gestión de Identidad y Acceso (IAM)](#4-gestión-de-identidad-y-acceso-iam)
- [Red y Seguridad](#5-red-y-seguridad)
- [Amazon S3](#6-amazon-s3)
- [Amazon RDS](#7-amazon-rds)
- [Amazon EC2 y Balanceador de Carga](#8-amazon-ec2-y-balanceador-de-carga)
- [Servicios de Inteligencia Artificial](#9-servicios-de-inteligencia-artificial)
- [Frontend](#10-sitio-web-frontend)
- [Despliegue](#11-despliegue)
- [Tecnologías utilizadas](#12-tecnologías-utilizadas)
- [Consideraciones de seguridad](#13-consideraciones-de-seguridad)
- [Limitaciones conocidas](#14-limitaciones-conocidas)
- [Repositorio](#15-repositorio)

---

## Descripción del proyecto

Semi-Social es una aplicación web tipo red social desplegada completamente en Amazon Web Services (AWS). Permite a los usuarios registrarse mediante correo electrónico o reconocimiento facial, publicar imágenes con descripciones, comentar, enviarse mensajes en tiempo real, traducir contenido a múltiples idiomas y consultar a un chatbot sobre la facultad.

### Funcionalidades principales

- Registro y autenticación con Amazon Cognito (correo + foto de perfil)
- Login tradicional o por reconocimiento facial (Amazon Rekognition)
- Publicación de imágenes con etiquetado automático (Rekognition)
- Sistema de comentarios por publicación
- Traducción de publicaciones a 3 idiomas (Amazon Translate)
- Sistema de amistades con solicitudes (aceptar / rechazar)
- Chat en tiempo real entre amigos (WebSockets)
- Chatbot informativo sobre la facultad (Amazon Lex)
- Filtro de publicaciones por etiquetas generadas automáticamente

---

## Arquitectura

### Diagrama general

![Diagrama de arquitectura](./docs/arquitectura.png)

### Flujo de la aplicación

1. El usuario accede al sitio web estático alojado en **S3** (`semi1-proyecto-web-g5`).
2. El frontend consume el backend a través del **Application Load Balancer** (`semi1-g5-alb`).
3. El ALB distribuye el tráfico equitativamente entre 2 instancias **EC2** (`semi1-g5-backend-1` y `semi1-g5-backend-2`).
4. Las EC2 consultan la base de datos **RDS MySQL** (`semi1-db`) para persistencia.
5. Las imágenes se cargan a través de **API Gateway**, que dispara una función **Lambda** que las almacena en el bucket S3 `semi1-proyecto-g5-2026`.
6. Las EC2 consumen los servicios de IA: **Rekognition** (etiquetas y reconocimiento facial), **Translate** (traducción) y **Cognito** (autenticación).
7. El chatbot **Lex** es invocado desde el frontend para consultas sobre la facultad.

### Componentes de AWS utilizados

| Servicio | Propósito | Recurso |
|---|---|---|
| IAM | Gestión de identidad, usuarios y roles | 7 usuarios + 2 roles |
| VPC | Red virtual privada | Default VPC |
| EC2 | Cómputo para el backend | `semi1-g5-backend-1`, `semi1-g5-backend-2` |
| Application Load Balancer | Balanceo de tráfico entre EC2 | `semi1-g5-alb` |
| S3 | Almacenamiento de imágenes | `semi1-proyecto-g5-2026` |
| S3 | Hosting del sitio web estático | `semi1-proyecto-web-g5` |
| RDS | Base de datos relacional (MySQL 8.0) | `semi1-db` |
| Cognito | Autenticación y gestión de usuarios | `semi1-userpool` |
| Rekognition | Análisis de imágenes y reconocimiento facial | API directa |
| Translate | Traducción de texto | API directa |
| Lambda | Procesamiento de carga de imágenes | `semi1-upload-handler` |
| API Gateway | Endpoint público para carga de imágenes | `semi1-api` |
| Lex | Chatbot de consultas de la facultad | `semi1-bot` |

---

## Gestión de Identidad y Acceso (IAM)

La configuración de IAM sigue el principio de **separación de responsabilidades**. Se crearon usuarios IAM específicos por servicio y roles para recursos que ejecutan código.

### Usuarios IAM

Cada usuario tiene permisos exclusivamente para su servicio correspondiente, siguiendo el principio de mínimo privilegio.

| Usuario | Política adjunta | Propósito |
|---|---|---|
| `semi1-s3-g5` | `AmazonS3FullAccess` | Operaciones sobre buckets S3 |
| `semi1-ec2-g5` | `AmazonEC2FullAccess` | Gestión de instancias EC2 |
| `semi1-rds-g5` | `AmazonRDSFullAccess` | Gestión de base de datos RDS |
| `semi1-cognito-g5` | `AmazonCognitoPowerUser` | Configuración de User Pool |
| `semi1-rekognition-g5` | `AmazonRekognitionFullAccess` | Uso de Rekognition desde código |
| `semi1-translate-g5` | `TranslateFullAccess` | Uso de Translate desde código |
| `semi1-lambda-g5` | `AWSLambda_FullAccess` | Gestión de funciones Lambda |


### Roles IAM

Los roles son utilizados por los recursos que ejecutan código, eliminando la necesidad de credenciales en el código fuente.

| Rol | Servicio | Políticas adjuntas | Propósito |
|---|---|---|---|
| `EC2-Semi1-Role` | EC2 | `AmazonS3FullAccess`, `AmazonRekognitionReadOnlyAccess`, `TranslateReadOnly`, `AmazonCognitoPowerUser`, `AmazonRDSDataFullAccess` | Asignado a ambas EC2 para acceso a servicios AWS sin access keys |
| `Lambda-Semi1-Role` | Lambda | `AWSLambdaBasicExecutionRole`, `AmazonS3FullAccess`, `AmazonRekognitionFullAccess` | Asignado a funciones Lambda para procesar imágenes |

### Capturas

![Usuarios IAM](./docs/capturas/01-iam/usuarios.png)

![Roles IAM](./docs/capturas/01-iam/roles.png)

![Política del rol EC2](./docs/capturas/01-iam/ec2-role-politicas.png)

---

## Red y Seguridad

Se configuraron 3 Security Groups que implementan el principio de acceso mínimo. Las reglas referencian otros Security Groups en lugar de IPs abiertas donde es posible.

### `sg-semi1-elb` — Application Load Balancer

| Tipo | Puerto | Origen | Descripción |
|---|---|---|---|
| HTTP | 80 | `0.0.0.0/0` | Acceso público al balanceador |
| HTTPS | 443 | `0.0.0.0/0` | Acceso público (preparado para SSL) |

### `sg-semi1-ec2` — Instancias EC2

| Tipo | Puerto | Origen | Descripción |
|---|---|---|---|
| SSH | 22 | IP Persona 1 /32 | Administración remota |
| SSH | 22 | IP Persona 2 /32 | Administración remota |
| SSH | 22 | IP Persona 3 /32 | Administración remota |
| Custom TCP | 3000 | `sg-semi1-elb` | Backend accesible solo desde el ALB |

> El uso del SG del ALB como origen garantiza que las EC2 nunca sean accesibles directamente desde internet en el puerto del backend.

### `sg-semi1-rds` — Base de Datos

| Tipo | Puerto | Origen | Descripción |
|---|---|---|---|
| MySQL/Aurora | 3306 | `sg-semi1-ec2` | Acceso desde ambas EC2 backend |
| MySQL/Aurora | 3306 | IPs del equipo /32 | Administración directa para debugging |

### Captura

![Security Groups](./docs/capturas/01-iam/security-groups.png)

---

## Amazon S3

### Bucket de imágenes — `semi1-proyecto-g5-2026`

Bucket destinado al almacenamiento de imágenes de publicaciones y fotos de perfil. Las imágenes son públicamente legibles para ser mostradas en el frontend. URL pública: `https://semi1-proyecto-g5-2026.s3.us-east-1.amazonaws.com/`

```
semi1-proyecto-g5-2026/
├── Fotos_Perfil/
│   └── [uuid][timestamp].jpg
└── Fotos_Publicadas/
    └── [uuid][timestamp].jpg
```

- **Política de acceso**: lectura pública (`s3:GetObject`) para todos los objetos; la escritura está restringida mediante la función Lambda
- **CORS**: configurado para permitir peticiones desde el frontend

### Bucket del sitio web — `semi1-proyecto-web-g5`

| Campo | Valor |
|---|---|
| Static website hosting | Habilitado |
| Index document | `index.html` |
| Error document | `index.html` (soporte para rutas SPA) |
| Endpoint público | `http://semi1-proyecto-web-g5.s3-website-us-east-1.amazonaws.com/` |

### Capturas

![Bucket de imágenes](./docs/capturas/02-s3/bucket-imagenes.png)

![Carpetas del bucket](./docs/capturas/02-s3/bucket-carpetas.png)

![Bucket del sitio web](./docs/capturas/02-s3/bucket-web.png)

![Configuración de static website hosting](./docs/capturas/02-s3/static-hosting.png)

---

## Amazon RDS

### Configuración

| Campo | Valor |
|---|---|
| Identificador | `semi1-db` |
| Motor | MySQL 8.0 |
| Clase de instancia | `db.t3.micro` (Free Tier) |
| Almacenamiento | 20 GiB gp3 |
| Base de datos inicial | `semisocial` |
| Usuario maestro | `admin` |
| Puerto | 3306 |
| Zona | us-east-1 |
| Acceso público | Sí (temporal para migración de schema) |
| Security Group | `sg-semi1-rds` |

### Credenciales de Conexión

- **DB_HOST**: `semi1-db.c6huueeqyof5.us-east-1.rds.amazonaws.com`
- **DB_PORT**: `3306`
- **DB_USER**: `admin`
- **DB_PASSWORD**: `Semi1_G5_2026_RdS`
- **DB_NAME**: `semisocial`

### Esquema de la base de datos

La base de datos cuenta con 8 tablas relacionales. Las contraseñas se almacenan encriptadas con **MD5** según requisito de la rúbrica; la autenticación real es gestionada por Cognito.

| Tabla | Descripción |
|---|---|
| `usuarios` | Datos personales y relación con Cognito (`cognito_sub`) |
| `publicaciones` | Imágenes y descripciones de los usuarios |
| `etiquetas` | Catálogo de etiquetas generadas por Rekognition |
| `publicacion_etiquetas` | Relación N:M entre publicaciones y etiquetas |
| `comentarios` | Comentarios asociados a publicaciones |
| `solicitudes_amistad` | Solicitudes pendientes / aceptadas / rechazadas |
| `amistades` | Relaciones de amistad confirmadas |
| `mensajes` | Mensajes de chat entre amigos |

El script completo del schema está en [`Proyecto/schema.sql`](./Proyecto/schema.sql).

### Capturas

![Instancia RDS](./docs/capturas/03-rds/instancia.png)

![Conexión desde Workbench](./docs/capturas/03-rds/workbench-conexion.png)

![Tablas creadas](./docs/capturas/03-rds/tablas.png)

---

## Amazon EC2 y Balanceador de Carga

### Instancias EC2

Se configuraron 2 instancias EC2 idénticas en zonas de disponibilidad distintas para mayor resiliencia.

| Campo | Valor |
|---|---|
| AMI | Ubuntu Server 22.04 LTS |
| Tipo | `t3.micro` (Free Tier) |
| Almacenamiento | 8 GiB gp3 |
| Key Pair | `semi1-keypair` |
| IAM Role | `EC2-Semi1-Role` |
| Security Group | `sg-semi1-ec2` |

| Instancia | Zona | IP Pública |
|---|---|---|
| `semi1-g5-backend-1` | `us-east-1a` | `54.87.178.132` |
| `semi1-g5-backend-2` | `us-east-1b` | `54.90.146.54` |

Ambas instancias tienen preinstalado mediante script de user-data: Node.js 20 LTS + npm + PM2, Python 3 + pip + gunicorn + boto3 + flask + pymysql + flask-cors, mysql-client, git y build tools. El backend se ejecuta en el puerto **3000**.

### Application Load Balancer

| Campo | Valor |
|---|---|
| Nombre | `semi1-g5-alb` |
| Tipo | Application Load Balancer |
| Esquema | Internet-facing |
| Listener | HTTP:80 |
| Target Group | `tg-semi1-g5-backend` |
| Health check | `GET /health` → 200 OK |
| DNS público | `semi1-g5-alb-473829343.us-east-1.elb.amazonaws.com` |

El ALB distribuye el tráfico mediante round-robin. Los health checks garantizan que, si una EC2 falla, el tráfico se redirige automáticamente a la otra sin interrupción para el usuario.

### Prueba de alta disponibilidad

Se verificó el comportamiento del balanceador deteniendo una EC2 manualmente. El ALB detectó la caída en menos de 30 segundos y redirigió el 100% del tráfico a la instancia restante, manteniendo el servicio activo.

### Capturas

![Instancias EC2](./docs/capturas/04-ec2/instancias.png)

![IAM Role de las EC2](./docs/capturas/04-ec2/iam-role.png)

![Application Load Balancer](./docs/capturas/05-alb/alb.png)

![Target Group con ambas EC2 saludables](./docs/capturas/05-alb/target-group.png)

![Prueba de balanceo alternado](./docs/capturas/05-alb/balanceo.png)

---

## Servicios de Inteligencia Artificial

### Amazon Cognito

| Campo | Valor |
|---|---|
| Nombre | `semi1-userpool` |
| Atributos requeridos | Email, nombre completo, DPI (atributo personalizado) |
| Verificación | Por correo electrónico |
| Política de contraseñas | Mínimo 8 caracteres con mayúsculas, minúsculas y números |

Cada usuario registrado se sincroniza con la tabla `usuarios` de RDS mediante el campo `cognito_sub`, que actúa como llave foránea.

![Cognito User Pool](./docs/capturas/06-cognito/userpool.png)

### Amazon Rekognition

Utilizado para dos funcionalidades:

1. **Etiquetado de publicaciones**: al subir una imagen se invoca `DetectLabels` para obtener hasta 10 etiquetas con confianza > 75%, que alimentan el sistema de filtros.
2. **Login por reconocimiento facial**: el usuario toma una foto que se compara con su foto de perfil mediante `CompareFaces` (umbral: 90%).

### AWS Lambda + API Gateway

```
Frontend → API Gateway (POST /upload) → Lambda (semi1-upload-handler) → S3
```

| Recurso | Detalle |
|---|---|
| **Lambda** `semi1-upload-handler` | Python 3.11 · Rol: `Lambda-Semi1-Role` · Recibe imagen en base64, decodifica y sube a S3 · Retorna URL pública del objeto |
| **API Gateway** `semi1-api` | Endpoint: `POST /upload` · CORS habilitado · Integración Lambda proxy |

![Lambda](./docs/capturas/07-lambda/funcion.png)

![API Gateway](./docs/capturas/08-apigateway/api.png)

### Amazon Translate

Integrado en el backend para traducir descripciones de publicaciones y comentarios entre español (origen), inglés, francés y portugués.

### Amazon Lex

Chatbot configurado con intents para responder preguntas frecuentes sobre la facultad (horarios, ubicación, servicios). Se integra al frontend mediante un botón flotante.

![Amazon Lex](./docs/capturas/09-lex/bot.png)

---

## Sitio Web (Frontend)

El frontend está alojado como sitio web estático en el bucket `semi1-proyecto-web-g5`.

| Campo | Valor |
|---|---|
| URL pública | `http://semi1-proyecto-web-g5.s3-website-us-east-1.amazonaws.com/` |
| Framework | [especificar] |
| Conexión al backend | URL del ALB (`semi1-g5-alb-473829343.us-east-1.elb.amazonaws.com`) |

![Aplicación Web](./docs/capturas/02-s3/web-app.png)
