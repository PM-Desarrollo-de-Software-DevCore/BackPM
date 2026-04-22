# 📋 BackPM - Estructura de Tablas y Endpoints

## 🗂️ Estructura de Base de Datos

### Tablas principales y cómo se llenan:

```
users                   ❌ NO se llena sola → POST /auth/register
    ↓
projects                ❌ NO se llena sola → POST /projects
    ├─ miembro_proyecto  ⚠️ PARCIAL → POST /projects/:id/members
    ├─ sprints           ❌ NO se llena sola → POST /projects/:id/sprints
    │   ├─ task         ❌ NO se llena sola → POST /projects/:id/tasks
    │   │   ├─ comentarios  ❌ NO se llena sola → POST /tasks/:id/comments
```

### Relaciones principales:
- **1 Usuario** → Crea muchos Proyectos
- **1 Proyecto** → Tiene muchos Miembros (usuarios del proyecto)
- **1 Proyecto** → Tiene muchos Sprints
- **1 Sprint** → Tiene muchas Tareas
- **1 Tarea** → Tiene muchos Comentarios
- **1 Usuario** → Puede estar asignado a muchas Tareas

---

## 📊 Columnas importantes para cálculos

### TaskEntity (La más importante para gráficas)
```typescript
- id_task: UUID
- title: string
- description: string
- priority: 'high' | 'medium' | 'low'
- status: 'pending' | 'in_progress' | 'completed' ⭐ (para calcular %)
- start_date: datetime
- end_date: datetime (para detectar si está atrasada)
- id_project: UUID (FK)
- id_sprint: UUID (FK, opcional)
- createdBy: UUID (FK)
- assignedTo: UUID (FK, opcional) (para carga de trabajo)
```

### ProjectEntity
```typescript
- id_project: UUID
- nombre: string
- descripcion: string
- fecha_inicio: datetime
- fecha_fin: datetime (para calcular progreso temporal)
- estado: 'activo' | 'terminado' | 'pausado'
- creado_por: UUID (FK)
```

### SprintEntity
```typescript
- id_sprint: UUID
- nombre: string
- fecha_inicio: datetime
- fecha_fin: datetime
- estado: 'planificado' | 'activo' | 'terminado'
- id_proyecto: UUID (FK)
```

---

## 🚀 Endpoints a implementar

### **PERSONA A: PROYECTOS Y MIEMBROS**

#### Proyectos
```
POST   /projects
   Body: { nombre, descripcion, fecha_inicio, fecha_fin }
   Response: { id_project, nombre, ... }
  
GET    /projects
   Query: ?estado=activo&sort=fecha_inicio
   Response: { projects: [...] }
   
GET    /projects/:id
   Response: { id_project, nombre, miembros: [...], sprints: [...] }
   
PUT    /projects/:id
   Body: { nombre?, descripcion?, fecha_fin?, estado? }
   Response: { id_project, ... }
   
DELETE /projects/:id
   Response: { success: true }
```

#### Miembros del Proyecto
```
POST   /projects/:id/members
   Body: { id_usuario, rol }
   Response: { id_mp, id_usuario, rol }
   Nota: Validar que usuario no esté ya en el proyecto
   
GET    /projects/:id/members
   Response: { members: [{ id_usuario, nombre, lastname, rol }, ...] }
   
PUT    /projects/:id/members/:userId
   Body: { rol: 'admin' | 'developer' | 'viewer' }
   Response: { id_mp, rol }
   
DELETE /projects/:id/members/:userId
   Response: { success: true }
```

---

### **PERSONA B: SPRINTS, TAREAS Y COMENTARIOS**

#### Sprints
```
POST   /projects/:id/sprints
   Body: { nombre, fecha_inicio, fecha_fin }
   Response: { id_sprint, nombre, ... }
   
GET    /projects/:id/sprints
   Response: { sprints: [...] }
   
GET    /sprints/:id
   Response: { id_sprint, nombre, estado, tasks: [...] }
   
PUT    /sprints/:id
   Body: { nombre?, fecha_fin?, estado? }
   Response: { id_sprint, ... }
   
DELETE /sprints/:id
   Response: { success: true }
```

#### Tareas
```
POST   /projects/:id/tasks
   Body: { title, description, priority, id_sprint?, start_date, end_date? }
   Response: { id_task, title, status: 'pending', ... }
   
GET    /projects/:id/tasks
   Query: ?status=pending&priority=high&assignedTo=userId
   Response: { tasks: [...] }
   
GET    /tasks/:id
   Response: { id_task, title, descripcion, createdBy, assignedTo, comments: [...] }
   
PUT    /tasks/:id
   Body: { title?, description?, priority?, end_date?, assignedTo? }
   Response: { id_task, ... }
   
PATCH  /tasks/:id/status
   Body: { status: 'pending' | 'in_progress' | 'completed' }
   Response: { id_task, status }
   
PATCH  /tasks/:id/assign
   Body: { assignedTo: userId }
   Response: { id_task, assignedTo }
   
DELETE /tasks/:id
   Response: { success: true }
```

#### Comentarios
```
POST   /tasks/:id/comments
   Body: { comentario }
   Response: { id_comentario, comentario, createdBy, createdAt }
   
GET    /tasks/:id/comments
   Response: { comments: [{ id_comentario, comentario, user: { nombre, email }, createdAt }, ...] }
   
DELETE /comments/:id
   Response: { success: true }
```

---

### **PERSONA A + B: DASHBOARD (Después de terminar los endpoints anteriores)**

#### Gráficas y Estadísticas
```
GET    /dashboard/projects-stats
   Query: ?userId=xxx
   Response: {
     totalProjects: 5,
     completedProjects: 2,
     inProgressProjects: 3,
     projectsChart: [
       { name: "Proyecto A", completionPercentage: 100 },
       { name: "Proyecto B", completionPercentage: 75 }
     ]
   }
   Cálculo: (tareas_completadas_proyecto / total_tareas_proyecto) * 100

GET    /dashboard/tasks-stats
   Query: ?userId=xxx
   Response: {
     totalTasks: 25,
     completedTasks: 12,
     pendingTasks: 10,
     inProgressTasks: 3,
     tasksChart: [
       { status: "completed", count: 12 },
       { status: "in_progress", count: 3 },
       { status: "pending", count: 10 }
     ]
   }
   Cálculo: COUNT(*) GROUP BY status

GET    /dashboard/user-tasks
   Query: ?userId=xxx&status=pending
   Response: {
     tasks: [
       { id_task, title, priority, status, end_date, project: { nombre }, isOverdue: true }
     ]
   }
   Cálculo: isOverdue = (TODAY > end_date AND status != 'completed')

GET    /dashboard/sprint-velocity
   Query: ?sprintId=xxx
   Response: {
     sprintName: "Sprint 1",
     completedTasks: 8,
     totalTasks: 15,
     velocity: 8,
     expectedVelocity: 10,
     daysRemaining: 3
   }
   Cálculo: (tareas_completadas_sprint / duracion_sprint_en_dias)

GET    /dashboard/team-workload
   Query: ?projectId=xxx
   Response: {
     teamMembers: [
       { userId, nombre, assignedTasks: 5, completedTasks: 3, inProgressTasks: 2 }
     ]
   }
   Cálculo: COUNT(*) GROUP BY assignedTo WHERE id_project = X
```

---

## 🛠️ División de Trabajo Sugerida

### **PERSONA A (Frontend/Gestión de Proyectos)**
1. ✅ Proyectos (CRUD completo)
2. ✅ Miembros del Proyecto (agregar/remover/cambiar rol)
3. ⚠️ Dashboard - Gráfica de proyectos

**Tiempo estimado:** 2-3 días

---

### **PERSONA B (Backend/Gestión de Tareas)**
1. ✅ Sprints (CRUD completo)
2. ✅ Tareas (CRUD completo + cambiar estado + asignar)
3. ✅ Comentarios (CRUD básico)
4. ⚠️ Dashboard - Gráfica de tareas

**Tiempo estimado:** 2-3 días

---

## 📝 Checklist de Implementación

### Persona A - Proyectos
- [ ] Crear `ProjectRepository`
- [ ] Crear `MemberProjectRepository`
- [ ] Crear use-case `CreateProject`
- [ ] Crear use-case `GetProjects`
- [ ] Crear use-case `GetProjectById`
- [ ] Crear use-case `UpdateProject`
- [ ] Crear use-case `DeleteProject`
- [ ] Crear use-case `AddMemberToProject`
- [ ] Crear use-case `RemoveMemberFromProject`
- [ ] Crear use-case `UpdateMemberRole`
- [ ] Crear `projectController`
- [ ] Crear rutas en `projectRoutes.ts`
- [ ] Crear endpoint Dashboard: `GetProjectStats`

### Persona B - Tareas
- [ ] Crear `SprintRepository`
- [ ] Crear `TaskRepository`
- [ ] Crear `CommentRepository`
- [ ] Crear use-case `CreateSprint`
- [ ] Crear use-case `GetSprints`
- [ ] Crear use-case `UpdateSprint`
- [ ] Crear use-case `DeleteSprint`
- [ ] Crear use-case `CreateTask`
- [ ] Crear use-case `GetTasks`
- [ ] Crear use-case `UpdateTask`
- [ ] Crear use-case `UpdateTaskStatus`
- [ ] Crear use-case `DeleteTask`
- [ ] Crear use-case `CreateComment`
- [ ] Crear use-case `GetComments`
- [ ] Crear use-case `DeleteComment`
- [ ] Crear `taskController`
- [ ] Crear rutas en `taskRoutes.ts`
- [ ] Crear `sprintController`
- [ ] Crear rutas en `sprintRoutes.ts`
- [ ] Crear endpoint Dashboard: `GetTaskStats`

---

## 🔒 Middleware y Validaciones Necesarias

En todos los endpoints:
```typescript
// 1. Autenticación (ya existe)
app.use(requireAuth)

// 2. Validación de entrada (Zod)
- Validar body de requests
- Validar parámetros de URL

// 3. Autorización (NUEVA)
- Solo propietario del proyecto puede editarlo
- Solo miembros del proyecto pueden ver sus tareas
- Solo quien creó la tarea puede asignarla (o admin del proyecto)
```

---

## 📱 Ejemplo de Flujo Completo

```
1. Usuario A se registra
   POST /auth/register

2. Usuario A crea un proyecto "Mi Aplicación"
   POST /projects { nombre: "Mi Aplicación" }
   → Se crea ProjectEntity

3. Usuario A agrega a Usuario B al proyecto
   POST /projects/:id/members { id_usuario: B, rol: "developer" }
   → Se crea MemberProjectEntity

4. Usuario A crea Sprint 1
   POST /projects/:id/sprints { nombre: "Sprint 1", fecha_inicio, fecha_fin }
   → Se crea SprintEntity

5. Usuario B crea Tarea 1 en Sprint 1
   POST /projects/:id/tasks { title: "Login", ... }
   → Se crea TaskEntity (status: 'pending')

6. Usuario B asigna la tarea a sí mismo
   PATCH /tasks/:id/assign { assignedTo: B }

7. Usuario B cambia estado a "in_progress"
   PATCH /tasks/:id/status { status: 'in_progress' }

8. Usuario B comenta en la tarea
   POST /tasks/:id/comments { comentario: "Iniciando..." }

9. Usuario B marca como completada
   PATCH /tasks/:id/status { status: 'completed' }

10. Usuario A ve gráficas
    GET /dashboard/projects-stats
    → Backend calcula: (1 tarea_completada / 1 total) = 100% ✅
```

---

## 🚨 Consideraciones Importantes

1. **Permisos**: Validar que solo miembros del proyecto puedan ver sus tareas
2. **Cascada**: Si eliminas proyecto → elimina sprints → elimina tareas (CASCADE)
3. **Fechas**: Validar que `fecha_fin > fecha_inicio`
4. **Estados**: Crear enums para estados: `'pending' | 'in_progress' | 'completed'`
5. **Prioridades**: Crear enums para prioridades: `'high' | 'medium' | 'low'`
6. **Roles**: Crear enums para roles: `'admin' | 'developer' | 'viewer'`

---

## 📞 Puntos de Coordinación Entre Personas A y B

- [ ] Acordar naming conventions (snake_case/camelCase/mixto)
- [ ] Acordar estructura de responses
- [ ] Acordar códigos de error
- [ ] Acordar qué hacer cuando un usuario es eliminado de un proyecto (¿qué pasa con sus tareas?)
- [ ] Acordar qué validaciones hace cada uno
- [ ] Testing en postman/insomnia mientras implementan

---

**👥 ¡Divide y conquista! Buena suerte con el proyecto 🚀**
