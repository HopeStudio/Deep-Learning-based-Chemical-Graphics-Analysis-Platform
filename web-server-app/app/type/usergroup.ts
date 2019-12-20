export interface UserGroupSchema {
  id: number,
  permission: number,
  group_name: string
}

export interface UserGroup extends Omit<UserGroupSchema, 'group_name'> {
  groupName: UserGroupSchema['group_name']
}

export type SelectUserGroup<K extends keyof UserGroup> = Pick<UserGroup, K>
export type SelectUserGroupSchema<K extends keyof UserGroupSchema> = Pick<UserGroupSchema, K>
