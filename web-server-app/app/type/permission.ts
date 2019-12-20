export enum UserPermission {
  getInfo = 1,
  updateInfo,
  updatePassword,
  updateOAuth,
  deleteAccount,
}

export enum AdminPermission {
  getUsers = 1,
  updateUser,
  updateUserGroup,
  deleteUser,
  deleteUserGroup,
}
