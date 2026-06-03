/* =============================================================================
   Indices de performance (R2) — BackPM / SQL Server (Azure SQL)
   -----------------------------------------------------------------------------
   En SQL Server las FOREIGN KEYS *no* crean indice automaticamente, por lo que
   todo filtro/JOIN por id_project, assignedTo, id_user, id_task, etc. hace table
   scan. Estos indices NONCLUSTERED cubren las columnas FK/filtro mas usadas en
   hot paths (dashboard, tareas, comentarios, finanzas, perfil).

   - NO modifica datos. Reversible con DROP INDEX.
   - Idempotente: cada CREATE esta guardado con IF NOT EXISTS.
   - Como ejecutarlo: contra la BD activa, via Azure Data Studio / portal query
     editor / sqlcmd. (La tabla notifications ya tiene indices propios.)
   - Alternativa "TypeORM": agregar @Index a las entidades y `npm run
     migration:generate` cuando la BD este disponible (ojo: generate alucina
     nombres; revisar antes de aplicar).
   ============================================================================= */

-- task
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_task_id_project' AND object_id = OBJECT_ID('dbo.task'))
    CREATE NONCLUSTERED INDEX IX_task_id_project ON dbo.task (id_project);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_task_assignedTo' AND object_id = OBJECT_ID('dbo.task'))
    CREATE NONCLUSTERED INDEX IX_task_assignedTo ON dbo.task (assignedTo);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_task_id_sprint' AND object_id = OBJECT_ID('dbo.task'))
    CREATE NONCLUSTERED INDEX IX_task_id_sprint ON dbo.task (id_sprint);

-- member_project
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_member_project_id_project' AND object_id = OBJECT_ID('dbo.member_project'))
    CREATE NONCLUSTERED INDEX IX_member_project_id_project ON dbo.member_project (id_project);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_member_project_id_user' AND object_id = OBJECT_ID('dbo.member_project'))
    CREATE NONCLUSTERED INDEX IX_member_project_id_user ON dbo.member_project (id_user);

-- comment
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_comment_id_task' AND object_id = OBJECT_ID('dbo.comment'))
    CREATE NONCLUSTERED INDEX IX_comment_id_task ON dbo.comment (id_task);

-- time_entry
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_time_entry_id_task' AND object_id = OBJECT_ID('dbo.time_entry'))
    CREATE NONCLUSTERED INDEX IX_time_entry_id_task ON dbo.time_entry (id_task);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_time_entry_id_user' AND object_id = OBJECT_ID('dbo.time_entry'))
    CREATE NONCLUSTERED INDEX IX_time_entry_id_user ON dbo.time_entry (id_user);

-- progress_entries
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_progress_entries_id_project' AND object_id = OBJECT_ID('dbo.progress_entries'))
    CREATE NONCLUSTERED INDEX IX_progress_entries_id_project ON dbo.progress_entries (id_project);

-- expense
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_expense_id_project' AND object_id = OBJECT_ID('dbo.expense'))
    CREATE NONCLUSTERED INDEX IX_expense_id_project ON dbo.expense (id_project);

-- invoice
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_invoice_id_project' AND object_id = OBJECT_ID('dbo.invoice'))
    CREATE NONCLUSTERED INDEX IX_invoice_id_project ON dbo.invoice (id_project);

-- milestones
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_milestones_id_project' AND object_id = OBJECT_ID('dbo.milestones'))
    CREATE NONCLUSTERED INDEX IX_milestones_id_project ON dbo.milestones (id_project);

-- sprints
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_sprints_id_project' AND object_id = OBJECT_ID('dbo.sprints'))
    CREATE NONCLUSTERED INDEX IX_sprints_id_project ON dbo.sprints (id_project);

-- user_technologies
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_user_technologies_id_user' AND object_id = OBJECT_ID('dbo.user_technologies'))
    CREATE NONCLUSTERED INDEX IX_user_technologies_id_user ON dbo.user_technologies (id_user);

-- profile_change_requests
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_pcr_id_user' AND object_id = OBJECT_ID('dbo.profile_change_requests'))
    CREATE NONCLUSTERED INDEX IX_pcr_id_user ON dbo.profile_change_requests (id_user);
