export default function RoleConstants(roleChar) {
  const roleDict = {
    O: "Owner",
    A: "Admin",
    R: "Researcher",
  };

  if (roleChar === "ALL") {
    return roleDict;
  } else {
    return roleDict[roleChar];
  }
}

export const ROLES_WITH_EDIT_PRIVILEGES = ["Owner", "Editor"];
