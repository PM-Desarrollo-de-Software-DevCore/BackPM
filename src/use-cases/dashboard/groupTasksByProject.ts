import { Task } from "../../entities/Task"

// Agrupa tareas por id_project preservando el orden de entrada.
// Usado para colapsar el N+1 de los dashboards: en vez de una query de tareas
// por proyecto, se hace una sola query (getTasksByProjects) y se agrupa en memoria.
export const groupTasksByProject = (tasks: Task[]): Map<string, Task[]> => {
    const map = new Map<string, Task[]>()
    for (const task of tasks) {
        const bucket = map.get(task.id_project)
        if (bucket) {
            bucket.push(task)
        } else {
            map.set(task.id_project, [task])
        }
    }
    return map
}
