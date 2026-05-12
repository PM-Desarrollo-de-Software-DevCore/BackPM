import { AppDataSource } from "../db/DataSource"
import { CommentEntity } from "../db/entities/CommentEntity"
import { Comment } from "../../entities/Comment"

const repo = AppDataSource.getRepository(CommentEntity)

export const createComment = async (data: Omit<Comment, "id_comment" | "createdAt">): Promise<Comment> => {
    const comment = repo.create(data)
    return await repo.save(comment)
}

export const getCommentById = async (id: string): Promise<Comment | null> => {
    return await repo.findOne({ where: { id_comment: id } })
}

export const getCommentsByTask = async (taskId: string) => {
    return await repo.find({
        where: { id_task: taskId },
        relations: ["user"],
        order: { createdAt: "ASC" }
    })
}

export const updateComment = async (id: string, data: Partial<Pick<Comment, "comment">>): Promise<Comment | null> => {
    await repo.update({ id_comment: id }, data)
    return await getCommentById(id)
}

export const deleteComment = async (id: string): Promise<boolean> => {
    const result = await repo.delete({ id_comment: id })
    return (result.affected ?? 0) > 0
}
