import { useRouter } from 'next/router';

import { useSelector } from 'react-redux';

import CommonDialog from '@/components/core/CommonDialog';
import MediaItem from '@/components/MediaItem';
import { COLORS } from '@/constants/colors';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import {
  ButtonOpen,
  DivContainer,
  NftID,
  NftTitle,
  NftTitleMessage,
} from '@/modules/CreateNFTSuccess/CreateNFTSuccess.styles';
import { setSkipContact } from '@/store/auth/authSlice';
import { getNftSelector } from '@/store/nft';
import { selectedFileSelector } from '@/store/nft/nftSelector';

interface IProps {
  handleClose: () => void;
}

const CreateNFTSuccess = (props: IProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { handleClose } = props;
  const {
    data: { title, nftId },
  } = useAppSelector(getNftSelector);

  const handleOpenDetails = () => {
    router.push(`/nft/${nftId}`);
    dispatch(setSkipContact(false));
  };

  const selectedFile = useSelector(selectedFileSelector);
  return (
    <CommonDialog open title={''} onClose={handleClose}>
      <DivContainer>
        <MediaItem file={selectedFile} />
        <NftTitle>{title}</NftTitle>
        <NftTitleMessage>Successfully Minted</NftTitleMessage>
        <NftID>{`NFT ID #${nftId}`}</NftID>
        <ButtonOpen onClick={handleOpenDetails} backgroundColor={COLORS.THEME_BUTTON} hoverColor={COLORS.THEME_BUTTON}>
          Open
        </ButtonOpen>
      </DivContainer>
    </CommonDialog>
  );
};

export default CreateNFTSuccess;
