import { useRouter } from 'next/router';

import { useCallback, useState } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import { NoNFTsIcon } from '@/assets/svg/NoNFTsIcon';
import Card from '@/components/Card';
import { useAppSelector } from '@/hooks/useReduxTypedHooks';
import { INftItemType } from '@/services/nft/list.service';
import { getNftSelector } from '@/store/nft';
import { nftDetailsPage } from '@/utils/router.utils';

import {
  DivCardWrapper,
  DivLabel,
  DivMyNftTitleWrapper,
  DivNftListStyled,
  DivNoNFTs,
  SeeAllText,
} from './NftList.styles';

interface NftListProps {
  fromTransactionPage?: boolean;
}

const NftList = ({ fromTransactionPage = false }: NftListProps): JSX.Element => {
  const router = useRouter();
  const [filteredList, setFilteredList] = useState<INftItemType[]>([]);
  const { allNfts = [] } = useAppSelector(getNftSelector);

  const gotoNfts = () => router.push('/nfts');

  const handleClickItem = (id: string) => {
    router.push(nftDetailsPage(id));
  };

  /**
   *
   * @param id - id of NFT Card which needs to be deleted
   */
  const handleItemDelete = (id: string) => {
    // An API call be made, if an API is developed to delete nft
    if (filteredList?.length) {
      const x = filteredList?.filter((item) => item.id !== id);
      setFilteredList([...x]);
    }
  };

  /**
   *
   * @param id - id of NFT Card which needs to be moved up in the list
   */
  const onMoveUpToList = useCallback(
    (id: string) => {
      if (filteredList?.length) {
        const updatedList: INftItemType[] = [];
        let currIndex = -1;
        filteredList?.forEach((item, index) => {
          if (item.id === id) currIndex = index;
          else updatedList.push(item);
        });

        setFilteredList([filteredList[currIndex], ...updatedList]);
      }
    },
    [filteredList]
  );

  /**
   *
   * @param id - id of NFT Card which needs to be moved to end of list
   */
  const onMoveDownToList = useCallback(
    (id: string) => {
      if (filteredList?.length) {
        const updatedList: INftItemType[] = [];
        let currIndex = -1;
        filteredList?.forEach((item, index) => {
          if (item.id === id) currIndex = index;
          else updatedList.push(item);
        });

        setFilteredList([...updatedList, filteredList[currIndex]]);
      }
    },
    [filteredList]
  );

  return (
    <DivNftListStyled>
      <Container maxWidth={'xl'}>
        {!fromTransactionPage && (
          <DivMyNftTitleWrapper>
            <DivLabel>My NFTs</DivLabel>
            {allNfts && allNfts?.length > 0 && <SeeAllText onClick={gotoNfts}>See All</SeeAllText>}
          </DivMyNftTitleWrapper>
        )}

        <Grid container className="nft-grid">
          {allNfts?.length ? (
            allNfts?.map((item) => (
              <Grid
                item
                key={item.id}
                sx={{ padding: '10px', display: 'flex', justifyContent: 'center' }}
                xl={4}
                lg={3}
                md={6}
                sm={12}
                xs={12}
                className="card-container"
                onClick={() => handleClickItem(item.id)}
              >
                <DivCardWrapper>
                  <Card
                    data={item}
                    disableActionIcon
                    onDelete={handleItemDelete}
                    onMoveUp={onMoveUpToList}
                    onDownUp={onMoveDownToList}
                  />
                </DivCardWrapper>
              </Grid>
            ))
          ) : (
            <DivNoNFTs>
              <NoNFTsIcon />
            </DivNoNFTs>
          )}
        </Grid>
      </Container>
    </DivNftListStyled>
  );
};

export default NftList;
