export const permissions = {
  ADMIN: [
    "VIEW_DASHBOARD",
    "MANAGE_USERS",
    "CREATE_ARTICLE",
    "EDIT_ARTICLE",
    "DELETE_ARTICLE",
    "VIEW_ANALYTICS",
  ],

  EDITOR: ["VIEW_DASHBOARD", "CREATE_ARTICLE", "EDIT_ARTICLE"],

  VIEWER: ["VIEW_DASHBOARD", "VIEW_ARTICLE", "SEARCH"],
};

export function can(role: string, permission: string) {
  return permissions[role as keyof typeof permissions]?.includes(permission);
}
