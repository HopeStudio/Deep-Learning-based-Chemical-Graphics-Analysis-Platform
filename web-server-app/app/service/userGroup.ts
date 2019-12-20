import { Service } from 'egg'
import { UserGroup, SelectUserGroupSchema, UserGroupSchema } from '../type/usergroup'
import CError from '../error'
import { err } from '../decorator'

export default class UserGroupService extends Service {
  async getPermission(id: UserGroup['id']): Promise<UserGroup> {
    const result = await this.app.mysql.select<SelectUserGroupSchema<'id' | 'permission' | 'group_name'>>('user_group', {
      columns: [ 'id', 'permission', 'group_name' ],
      where: {
        id,
      },
    })

    if (!result || result.length === 0) {
      throw new CError(
        'user group is not exist',
        err.type.service().module.userGroup().errCode(11),
        false)
    }
    const userGroup = result[0]

    return {
      id: userGroup.id,
      permission: userGroup.permission,
      groupName: userGroup.group_name,
    }
  }

  async updatePermission(id: UserGroup['id'], permission: UserGroup['permission']) {
    await this.app.mysql.update<Partial<UserGroupSchema>>('user_group', {
      permission,
    }, {
      where: { id },
    })
  }

  async updateGroupName(id: UserGroup['id'], name: UserGroup['groupName']) {
    await this.app.mysql.update<Partial<UserGroupSchema>>('user_group', {
      group_name: name,
    }, {
      where: { id },
    })
  }

  async addUserGroup(name: UserGroup['groupName'], permission: UserGroup['permission'] = 0b1111101000) {
    await this.app.mysql.insert<Partial<UserGroupSchema>>('user_group', {
      group_name: name,
      permission,
    })
  }
}
