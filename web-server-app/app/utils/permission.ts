const permission = {
  setPermission(permissionCode: number, pos: number, permit: boolean) {
    const hasPermit = this.getPermission(permissionCode, pos)
    if (hasPermit && !permit) {
      return permissionCode - Math.pow(2, pos - 1 + 5)
    }

    if (!hasPermit && permit) {
      return permissionCode + Math.pow(2, pos - 1 + 5)
    }
  },

  setPermissionLeft(permissionCode: number, pos: number, permit: boolean) {
    const dividePos = this.getDividePos(permissionCode)
    return this.setPermission(permissionCode, dividePos + pos, permit)
  },

  getDividePos(permissionCode: number) {
    return permissionCode % 0b100000
  },

  getPermission(permissionCode: number, pos: number) {
    return !!(permissionCode >> (pos - 1 + 5) & 0b1)
  },

  getPermissionLeft(permissionCode: number, pos: number) {
    const dividePos = this.getDividePos(permissionCode)
    return this.getPermission(permissionCode, dividePos + pos)
  },
}

export default permission
