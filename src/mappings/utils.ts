
// export function entityConcatID(
//     entity: string[],
//     id: string
// ): void{
//     if (entity == null) {
//         entity = [id]
//     } else if (!entity.includes(id)) {
//         entity = entity.concat([id]);
//     }
// }

import { log } from "matchstick-as";

export function entityConcatID(
    entity: string[],
    id: string
): string[] {
    if (entity == null) {
        entity = [id]
    } else if (!entity.includes(id)) {
        entity = entity.concat([id]);
    }
    return entity
}

export function createBindID(
    ids: Array<string>
): string {
    let id = ""
    for(let i = 0; i < ids.length; i++){
        if (i === 0) {
            id = ids[i]
        } else {
            id = id + "-" + ids[i]
        }
    }
    return id
}