import { useQuery } from 'react-query';

import { getDashboardData } from '@/services/nft/dashboard.service';

/**
 * Hook for querying dashboard data
 * @returns data for dashboard
 */
export function useDashboardData() {
  return useQuery('dashboardData', getDashboardData);
}
