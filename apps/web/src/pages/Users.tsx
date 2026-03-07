import { Card, Table, Tag } from 'antd'

const Users = () => {
  return (
    <Card title="用户管理" bordered={false}>
      <Table
        rowKey="id"
        dataSource={[
          { id: 1, name: '张三', role: '管理员', status: '启用' },
          { id: 2, name: '李四', role: '编辑', status: '禁用' },
        ]}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '用户名', dataIndex: 'name' },
          { title: '角色', dataIndex: 'role' },
          {
            title: '状态',
            dataIndex: 'status',
            render: (text: string) => (
              <Tag color={text === '启用' ? 'green' : 'red'}>{text}</Tag>
            ),
          },
        ]}
        pagination={false}
      />
    </Card>
  )
}

export default Users
