export const classroomSearchableFields = ["name", "ageGroup"];
export const classroomFilterableFields = ["branchId"];
export const classroomListIncludeConfig = {
    branch: { select: { id: true, name: true } },
    _count: {
        select: {
            children: { where: { status: "ENROLLED" } },
            teacherAssignments: true,
        },
    },
};
export const classroomDetailIncludeConfig = {
    branch: { select: { id: true, name: true, tenantId: true } },
    teacherAssignments: {
        include: {
            teacher: { select: { id: true, name: true, email: true, role: true } },
        },
    },
    children: {
        where: { status: "ENROLLED" },
        select: { id: true, firstName: true, lastName: true, photoUrl: true, status: true },
    },
    _count: {
        select: {
            children: { where: { status: "ENROLLED" } },
            teacherAssignments: true,
        },
    },
};
