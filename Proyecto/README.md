# Proyecto Semi-Social — Seminario de Sistemas 1

**Universidad San Carlos de Guatemala**  
**Facultad de Ingeniería — Escuela de Ciencias y Sistemas**  
**Primer Semestre 2026 — Grupo 5**

---

## 1. Datos de los estudiantes

| Rol | Nombre | Carné | Responsabilidad |
|-----|--------|-------|-----------------|
| Persona 1 | [Tu nombre completo] | [Tu carné] | Infraestructura y Seguridad (Cloud Architect / DevOps) |
| Persona 2 | [Nombre Persona 2] | [Carné Persona 2] | Backend y Servicios Inteligentes |
| Persona 3 | [Nombre Persona 3] | [Carné Persona 3] | Interfaz de Usuario y Comunicación |

---

## 2. Descripción del proyecto

Semi-Social es una aplicación web tipo red social desplegada completamente en Amazon Web Services (AWS). Permite a los usuarios registrarse mediante correo electrónico o reconocimiento facial, publicar imágenes con descripciones, comentar, enviarse mensajes en tiempo real, traducir contenido a múltiples idiomas y consultar a un chatbot sobre la facultad.

### 2.1 Funcionalidades principales

- Registro y autenticación con Amazon Cognito (correo + foto de perfil)
- Login tradicional o por reconocimiento facial (Amazon Rekognition)
- Publicación de imágenes con etiquetado automático (Rekognition)
- Sistema de comentarios por publicación
- Traducción de publicaciones a 3 idiomas (Amazon Translate)
- Sistema de amistades con solicitudes (aceptar/rechazar)
- Chat en tiempo real entre amigos (WebSockets)
- Chatbot informativo sobre la facultad (Amazon Lex)
- Filtro de publicaciones por etiquetas generadas automáticamente

---

## 3. Arquitectura

### 3.1 Diagrama general

![Diagrama de arquitectura](./docs/arquitectura.png)

### 3.2 Flujo de la aplicación

1. El usuario accede al sitio web estático alojado en **S3** (`proyecto-web-g5`).
2. El frontend (React/Angular) consume el backend a través del **Application Load Balancer** (`semi1-g5-alb`).
3. El ALB distribuye el tráfico equitativamente entre 2 instancias **EC2** (`semi1-g5-backend-1` y `semi1-g5-backend-2`).
4. Las EC2 consultan la base de datos **RDS MySQL** (`semi1-db`) para persistencia.
5. Las imágenes se cargan a través de **API Gateway** que dispara una función **Lambda**, la cual las almacena en el bucket **S3** `semi1proyecto-g5`.
6. Las EC2 consumen los servicios de inteligencia artificial: **Rekognition** (etiquetas y reconocimiento facial), **Translate** (traducción) y **Cognito** (autenticación).
7. El chatbot **Lex** es invocado desde el frontend para consultas sobre la facultad.

### 3.3 Componentes de AWS utilizados

| Servicio | Propósito | Nombre del recurso |
|----------|-----------|---------------------|
| IAM | Gestión de identidad, usuarios y roles | 7 usuarios + 2 roles |
| VPC | Red virtual privada | Default VPC |
| EC2 | Cómputo para el backend | `semi1-g5-backend-1`, `semi1-g5-backend-2` |
| Application Load Balancer | Balanceo de tráfico entre EC2 | `semi1-g5-alb` |
| S3 | Almacenamiento de imágenes | `semi1proyecto-g5` |
| S3 | Hosting del sitio web estático | `proyecto-web-g5` |
| RDS | Base de datos relacional (MySQL 8.0) | `semi1-db` |
| Cognito | Autenticación y gestión de usuarios | User Pool `semi1-userpool` |
| Rekognition | Análisis de imágenes y reconocimiento facial | API directa |
| Translate | Traducción de texto | API directa |
| Lambda | Procesamiento de carga de imágenes | `semi1-upload-handler` |
| API Gateway | Endpoint público para carga de imágenes | `semi1-api` |
| Lex | Chatbot de consultas de la facultad | `semi1-bot` |

---

## 4. Gestión de Identidad y Acceso (IAM)

La configuración de IAM sigue el principio de **separación de responsabilidades**. Se crearon usuarios IAM específicos por servicio y roles para recursos que ejecutan código.

### 4.1 Usuarios IAM

Cada usuario tiene permisos exclusivamente para su servicio correspondiente, siguiendo el principio de mínimo privilegio.

| Usuario | Política adjunta | Propósito |
|---------|------------------|-----------|
| `semi1-s3-g5` | `AmazonS3FullAccess` | Operaciones sobre buckets S3 |
| `semi1-ec2-g5` | `AmazonEC2FullAccess` | Gestión de instancias EC2 |
| `semi1-rds-g5` | `AmazonRDSFullAccess` | Gestión de base de datos RDS |
| `semi1-cognito-g5` | `AmazonCognitoPowerUser` | Configuración de User Pool |
| `semi1-rekognition-g5` | `AmazonRekognitionFullAccess` | Uso de Rekognition desde código |
| `semi1-translate-g5` | `TranslateFullAccess` | Uso de Translate desde código |
| `semi1-lambda-g5` | `AWSLambda_FullAccess` | Gestión de funciones Lambda |

**Nota**: Estos usuarios cumplen el requisito del enunciado de mantener credenciales separadas por servicio. La infraestructura fue desplegada desde una cuenta administradora dedicada para mayor eficiencia.

### 4.2 Roles IAM

Los roles son utilizados por los recursos que ejecutan código, eliminando la necesidad de credenciales en código fuente.

| Rol | Servicio asociado | Políticas adjuntas | Propósito |
|-----|-------------------|---------------------|-----------|
| `EC2-Semi1-Role` | EC2 | `AmazonS3FullAccess`, `AmazonRekognitionReadOnlyAccess`, `TranslateReadOnly`, `AmazonCognitoPowerUser`, `AmazonRDSDataFullAccess` | Asignado a ambas EC2 para acceso a servicios AWS sin access keys |
| `Lambda-Semi1-Role` | Lambda | `AWSLambdaBasicExecutionRole`, `AmazonS3FullAccess`, `AmazonRekognitionFullAccess` | Asignado a funciones Lambda para procesar imágenes |

### 4.3 Capturas IAM

![Usuarios IAM](./docs/capturas/01-iam/usuarios.png)

![Roles IAM](./docs/capturas/01-iam/roles.png)

![Política del rol EC2](./docs/capturas/01-iam/ec2-role-politicas.png)

---

## 5. Red y Seguridad

### 5.1 Grupos de Seguridad

Se configuraron 3 Security Groups que implementan el principio de acceso mínimo. Las reglas de cada uno referencian a otros Security Groups en lugar de IPs abiertas donde es posible.

#### 5.1.1 `sg-semi1-elb` (Application Load Balancer)

| Tipo | Puerto | Origen | Descripción |
|------|--------|--------|-------------|
| HTTP | 80 | 0.0.0.0/0 | Acceso público al balanceador |
| HTTPS | 443 | 0.0.0.0/0 | Acceso público al balanceador (preparado para SSL) |

#### 5.1.2 `sg-semi1-ec2` (Instancias EC2)

| Tipo | Puerto | Origen | Descripción |
|------|--------|--------|-------------|
| SSH | 22 | IP Persona 1 /32 | Administración remota |
| SSH | 22 | IP Persona 2 /32 | Administración remota |
| SSH | 22 | IP Persona 3 /32 | Administración remota |
| Custom TCP | 3000 | `sg-semi1-elb` | Backend solo accesible desde el ALB |

El uso del SG del ALB como origen garantiza que las EC2 **nunca** sean accesibles directamente desde internet en el puerto del backend. Solo pueden recibir tráfico que haya pasado por el balanceador.

#### 5.1.3 `sg-semi1-rds` (Base de Datos)

| Tipo | Puerto | Origen | Descripción |
|------|--------|--------|-------------|
| MySQL/Aurora | 3306 | `sg-semi1-ec2` | Acceso desde ambas EC2 backend |
| MySQL/Aurora | 3306 | IPs del equipo /32 | Administración directa para debugging |

### 5.2 Captura

![Security Groups](./docs/capturas/01-iam/security-groups.png)

---

## 6. Amazon S3

### 6.1 Bucket de imágenes (`semi1proyecto-g5`)

Bucket destinado al almacenamiento de las imágenes de publicaciones y fotos de perfil de los usuarios. Las imágenes son públicamente legibles para ser mostradas en el frontend.

**Estructura:**