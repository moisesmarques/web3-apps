import { useRouter } from 'next/router';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import NoRecordFound from '@/components/NoRecordFound';
import TransactionItem from '@/components/TransactionItem';
import { ITransaction } from '@/components/TransactionItem/TransactionItem.type';
import { useTransactionsData } from '@/hooks/apis/useTransactionsData';

import { DivTransactionListStyled, SeeAllText, DivItemTitleSection } from './TransactionList.styles';

interface ITransactionProps {
  fromTransactionPage?: boolean;
  currentTab?: string;
}

const TransactionList = ({ fromTransactionPage, currentTab = 'All' }: ITransactionProps): JSX.Element => {
  const router = useRouter();
  const { data = [], isLoading } = useTransactionsData();
  const gotoTransaction = () => router.push('/transactions');

  const sortTransaction = (a: ITransaction, b: ITransaction) => {
    if (a.updated < b.updated) {
      return 1;
    }

    if (a.updated > b.updated) {
      return -1;
    }

    return 0;
  };

  let transactions = [] as ITransaction[];
  if (currentTab === 'Sent') {
    transactions = data
      .filter((item: ITransaction) =>
        ['Create_nft_series', 'transfer_nft', 'nft_series_mint', 'nft_series_create'].includes(item.type)
      )
      ?.sort(sortTransaction);
  } else if (currentTab === 'Received') {
    transactions = data.filter((item: ITransaction) => item.type === 'Claim_nft')?.sort(sortTransaction);
  } else {
    transactions = data?.filter((item: ITransaction) => item.type !== 'insert_analytics')?.sort(sortTransaction);
  }

  return (
    <DivTransactionListStyled data-testid="transactions" className={fromTransactionPage ? 'transactions' : ''}>
      {!fromTransactionPage && (
        <DivItemTitleSection>
          <span>
            <h3>Recent Transactions</h3>
          </span>
          {transactions?.length > 0 && <SeeAllText onClick={gotoTransaction}>See All</SeeAllText>}
        </DivItemTitleSection>
      )}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {transactions?.length ? (
            transactions.map((item, index) => <TransactionItem item={item} key={index} />)
          ) : (
            <NoRecordFound text="Your transactions will appear here" />
          )}
        </>
      )}
    </DivTransactionListStyled>
  );
};

export default TransactionList;
