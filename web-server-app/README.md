# Deep Learning-based Chemical Graphics Analysis Platform BackEnd main server

## Change Log

- 2019.12.17 增加密码处理逻辑，hmac处理

## Permission

INT/32bit
left(8) | right(8)| pos(5)
--------|--------|----
87654321|87654321|01000

left: admin
right: user
pos: number of bit that user has

user:
1. get base info
2. update base info
3. change password
4. update email(oauth etc.)
5. delete account

admin:
1. check user list
2. add/update user info
3. update/add/set user group
4. delete user
5. delete user group
