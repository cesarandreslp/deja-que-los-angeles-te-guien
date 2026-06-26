Eres un asistente experto en desarrollo de aplicaciones web con Next.js, TypeScript, Prisma (Neon/PostgreSQL) y Node.js. 
Ayúdame a desarrollar un módulo llamado **Arcángel Mentor**, que da una guía diaria al usuario según el día de la semana en que nació. 
Debes dividir el desarrollo en fases claras, revisar errores en cada fase y optimizar el código para producción.

---

## Lógica de asignación de Arcángel Mentor
- Cada usuario debe registrarse o iniciar sesión para usar Arcángel Mentor.
- Se usa la **fecha de nacimiento** para calcular el día de la semana en que nació.
- Según el día de nacimiento, se le asigna un **Arcángel Mentor único y permanente**:

| Día de la semana | Arcángel Mentor |
|------------------|-----------------|
| Lunes            | Jofiel          |
| Martes           | Chamuel         |
| Miércoles        | Gabriel         |
| Jueves           | Rafael          |
| Viernes          | Uriel           |
| Sábado           | Zadkiel         |
| Domingo          | Miguel          |

- Cada Arcángel tiene su **agente de IA propio con identidad definida** (voz, tono, estilo).

---

## Restricción de consultas
- El usuario solo puede hacer **1 consulta diaria** con su Arcángel Mentor.
- Una vez respondida, la consulta queda bloqueada hasta el siguiente día.
- Todas las consultas y respuestas deben guardarse en la base de datos.

---

## Fase 1: Modelos Prisma
- Ampliar `User` para incluir:
  - `birthDate`: Date
  - `mentorArcangel`: enum (`JOFIEL`, `CHAMUEL`, `GABRIEL`, `RAFAEL`, `URIEL`, `ZADQUIEL`, `MIGUEL`)
- Nuevo modelo `MentorConsultation`:
  - `id`: uuid
  - `userId`: relación con `User`
  - `arcangel`: enum (7 posibles valores)
  - `question`: string
  - `answer`: string (respuesta del agente de IA)
  - `createdAt`: DateTime
- Índice para garantizar **una consulta por día por usuario**.

---

## Fase 2: Registro / login obligatorio
- Validar que el usuario esté logueado antes de acceder a `/arcangel-mentor`.
- En el registro:
  - Capturar `birthDate`.
  - Calcular el día de la semana.
  - Asignar `mentorArcangel` automáticamente según la tabla.
  - Guardar en la DB.

---

## Fase 3: API de consultas
- Endpoint `POST /api/mentor/consult`:
  - Validar que el usuario tenga un `mentorArcangel` asignado.
  - Revisar si ya hizo consulta ese día.
  - Si no, recibir `question` y enviarla al agente de IA del arcángel.
  - Guardar `question` y `answer` en `MentorConsultation`.
  - Devolver la respuesta.

- Endpoint `GET /api/mentor/history`:
  - Listar consultas pasadas del usuario.

---

## Fase 4: Integración con agentes de IA de los Arcángeles
- Cada arcángel tiene un agente Zhipu AI con personalidad única (definida previamente).
- La API debe llamar al agente correspondiente según `mentorArcangel`.
- El estilo de la respuesta debe ser coherente con la identidad del arcángel.

---

## Fase 5: Frontend
- Página `/arcangel-mentor`:
  - Mostrar al usuario cuál es su Arcángel Mentor asignado.
  - Si no ha hecho consulta hoy:
    - Caja de texto para escribir su pregunta.
    - Botón “Consultar”.
  - Si ya hizo consulta:
    - Mostrar mensaje “Ya realizaste tu consulta de hoy. Vuelve mañana”.
  - Mostrar historial de consultas anteriores.

---

## Fase 6: Validación y testing
- Probar que:
  - El cálculo de Arcángel Mentor funciona según el día de nacimiento.
  - No se permiten más de 1 consulta diaria.
  - Las consultas y respuestas se guardan en la DB.
  - La integración con IA responde según el arcángel.
- Revisar errores y optimizar.

---

## Flujo del usuario
1. El usuario se registra o inicia sesión.
2. Al registrarse, ingresa su fecha de nacimiento.
3. El sistema asigna un Arcángel Mentor permanente.
4. Entra a la sección “Arcángel Mentor”.
5. Puede hacer 1 pregunta al día → el arcángel responde con su estilo.
6. La consulta y respuesta quedan guardadas en la DB.
7. El usuario ve su historial de consultas.
