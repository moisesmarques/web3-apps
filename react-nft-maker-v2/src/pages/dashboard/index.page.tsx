import { PrivateLayout } from '@/components/Layout';
import Table, { IColumnType } from '@/components/Table';
import { useDashboardData } from '@/hooks/apis/useDashboardData';

import { DashboardStyled, DivLoader } from './index.styles';

const columns: IColumnType[] = [
  {
    name: 'Name',
    key: 'name',
  },
  {
    name: 'Title',
    key: 'title',
  },
  {
    name: 'Role',
    key: 'role',
  },
  {
    name: 'Email',
    key: 'email',
  },
];

/**
 *
 * @returns Dashboard with users
 */
const Dashboard = (): JSX.Element => {
  const { data = [], isLoading } = useDashboardData();

  return (
    <PrivateLayout>
      <DashboardStyled>
        {!isLoading ? <Table columns={columns} data={data} /> : <DivLoader>Loading...</DivLoader>}
      </DashboardStyled>
    </PrivateLayout>
  );
};

export default Dashboard;
