import { Card, Table } from 'antd'

const Roles = () => {
  return (
    <Card title="角色管理" bordered={false}>
      <Table
        rowKey="id"
        dataSource={[
          { id: 1, name: '管理员', perms: '全部权限' },
          { id: 2, name: '编辑', perms: '内容编辑' },
        ]}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '角色名', dataIndex: 'name' },
          { title: '权限', dataIndex: 'perms' },
        ]}
        pagination={false}
      />
    </Card>
  )
}

export default Roles
