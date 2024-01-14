import React, { FC } from 'react';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { ArrowBottomLeft } from '@/assets/svg/arrow-bottom-left';
import { ArrowTopRight } from '@/assets/svg/arrow-top-right';
import { ITransaction } from '@/components/TransactionItem/TransactionItem.type';
import { NEAR_TRANSACTION_URL } from '@/constants/api';

import {
  HighlightText,
  HighlightTextBold,
  SimpleText,
  DivItemContainer,
  DivItemLeftSection,
  DivItemRightSection,
} from './TransactionItem.styles';

interface Props {
  item: ITransaction;
}

interface ITransactionProps {
  senderWalletId?: string;
  message?: string;
  transactionId?: string;
  receiverWalletId?: string;
  subMessage?: string;
  transactionHash?: string;
}

dayjs.extend(relativeTime);

const RenderTransaction = ({
  message,
  senderWalletId,
  subMessage,
  transactionId,
  receiverWalletId,
  transactionHash,
}: ITransactionProps) => (
  <>
    <HighlightText> {senderWalletId}</HighlightText>
    <SimpleText> {message}</SimpleText>
    <HighlightTextBold {...(transactionHash ? { href: NEAR_TRANSACTION_URL + transactionHash } : {})} target="_blank">
      {transactionId}
    </HighlightTextBold>
    <SimpleText>{subMessage}</SimpleText>
    <HighlightTextBold>{receiverWalletId}</HighlightTextBold>
  </>
);

const TransactionItem: FC<Props> = ({ item }) => {
  const renderTransactions = () => {
    switch (item.type) {
      case 'create_account':
        return <RenderTransaction message="Your wallet was created" senderWalletId={item.senderWalletId} />;
      case 'Create_nft_series':
      case 'nft_series_create':
        return (
          <RenderTransaction
            message="created an NFT -"
            senderWalletId={item.senderWalletId}
            transactionId={`#${item.transactionId}`}
            transactionHash={item?.transactionHash}
          />
        );
      case 'transfer_nft':
        return (
          <RenderTransaction
            message="sent an NFT - "
            senderWalletId={item.senderWalletId}
            transactionId={`#${item.transactionId}`}
            subMessage="to"
            receiverWalletId={item.receiverWalletId}
            transactionHash={item?.transactionHash}
          />
        );
      case 'gift':
        return (
          <RenderTransaction
            message="sent an NFT - "
            senderWalletId={item.senderWalletId}
            transactionId={`#${item.transactionId}`}
            subMessage="to"
            receiverWalletId={item.receiverWalletId}
            transactionHash={item?.transactionHash}
          />
        );

      case 'nft_series_mint':
        return (
          <RenderTransaction
            message="created and minted an NFT "
            senderWalletId={item.senderWalletId}
            transactionId={`#${item.transactionId}`}
            subMessage="to"
            receiverWalletId={item.receiverWalletId}
            transactionHash={item?.transactionHash}
          />
        );

      default:
        return (
          <RenderTransaction
            message="Your wallet is"
            senderWalletId={item.senderWalletId}
            transactionHash={item?.transactionHash}
          />
        );
    }
  };

  const sent: boolean = ['Create_nft_series', 'transfer_nft', 'nft_series_mint', 'nft_series_create'].includes(
    item.type
  );
  return (
    <DivItemContainer>
      <DivItemLeftSection>
        <div className="item-arrow-icon">{sent ? <ArrowTopRight /> : <ArrowBottomLeft />}</div>
        <div className="item-inner-content">{renderTransactions()}</div>
      </DivItemLeftSection>
      <DivItemRightSection>{dayjs(item?.updated).fromNow()}</DivItemRightSection>
    </DivItemContainer>
  );
};

export default TransactionItem;
