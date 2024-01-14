import { useCallback, useEffect, useState } from 'react';

import { ArrowRight } from '@/assets/svg/arrow-right';
import { NoNFTsIcon } from '@/assets/svg/NoNFTsIcon';
import Card from '@/components/Card';
import CommonDialog from '@/components/core/CommonDialog';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import { INftItemType } from '@/services/nft/list.service';
import { closeSendNftDialog, openAndCloseContactDialog, resetSelectedNft, setSelectedNft } from '@/store/dialogs';
import { getDialogsStatus } from '@/store/dialogs/dialogsSelector';
import { getNftSelector } from '@/store/nft';

import { DivNoNFTs } from '../NftList/NftList.styles';
import { ButtonSend, DivButtonWrapper, DivHorizontalScroll, DivSendNftSubTitle } from './SendNft.styles';

interface IProps {
  handleClose: () => void;
}

const SendNft = (props: IProps) => {
  const { handleClose } = props;

  const { allNfts = [] } = useAppSelector(getNftSelector);
  const dispatch = useAppDispatch();
  const { selectedNftId, setSelectedNftToFirstPosition } = useAppSelector(getDialogsStatus);

  const [listData, setListData] = useState<INftItemType[]>(allNfts);

  const handleCloseDialog = useCallback(() => {
    dispatch(resetSelectedNft());
    handleClose();
  }, [handleClose]);

  useEffect(() => {
    setListData(allNfts || []);
  }, [allNfts]);

  useEffect(() => {
    if (setSelectedNftToFirstPosition) {
      setListData((listData) => {
        const firstItem = listData.find((data) => data.id === selectedNftId);
        const remainingItems = listData.filter((data) => data.id !== selectedNftId);
        const sortedList = [];
        if (firstItem) {
          sortedList.push(firstItem);
        }
        sortedList.push(...remainingItems);
        return sortedList;
      });
    }
  }, [setSelectedNftToFirstPosition]);

  const handleSelectCard = (selectedNftId: string, isChecked: boolean) => {
    if (!isChecked) {
      dispatch(setSelectedNft({ nftId: selectedNftId, move: false }));
    } else {
      dispatch(resetSelectedNft());
    }
  };

  return (
    <CommonDialog
      open
      onClose={handleCloseDialog}
      title={'Gift NFT'}
      maxWidth="sm"
      crossIconPosition={{
        top: '14px;',
        right: '0px',
      }}
    >
      <DivSendNftSubTitle>Select an NFT you want to send</DivSendNftSubTitle>
      <DivHorizontalScroll>
        {listData?.length ? (
          listData.map((item) => (
            <div key={item.id}>
              <Card
                enableRadiobutton={true}
                data={item}
                isChecked={item.id === selectedNftId}
                disableActionIcon={true}
                onDelete={() => {}}
                onMoveUp={() => {}}
                onDownUp={() => {}}
                onSelect={handleSelectCard}
              />
            </div>
          ))
        ) : (
          <DivNoNFTs>
            <NoNFTsIcon />
          </DivNoNFTs>
        )}
      </DivHorizontalScroll>
      <DivButtonWrapper>
        <ButtonSend
          disabled={!selectedNftId}
          onClick={() => {
            dispatch(openAndCloseContactDialog(true));
            dispatch(closeSendNftDialog());
          }}
        >
          Next <ArrowRight />
        </ButtonSend>
      </DivButtonWrapper>
    </CommonDialog>
  );
};

export default SendNft;
