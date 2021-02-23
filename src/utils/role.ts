import { Role } from "src/types/role";

export function isAdmin(role) {
    return role === Role.ADMIN || role === Role.SUPER_ADMIN
}

export function isEditor(role) {
    return role === Role.ADMIN || role === Role.SUPER_ADMIN || role === Role.EDITOR
}
