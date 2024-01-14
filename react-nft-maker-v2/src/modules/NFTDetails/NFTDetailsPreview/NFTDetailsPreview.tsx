import { useEffect, useState } from 'react';

import { PreviewBackground } from '@/assets/svg/preview-background';
import { useAppSelector } from '@/hooks/useReduxTypedHooks';
import {
  AudioPreview,
  DivPreviewImageContainer,
  ImagePreview,
  VideoPreview,
} from '@/modules/NFTDetails/NFTDetailsPreview/NFTDetailsPreview.styles';
import { getNftSelector } from '@/store/nft';
import { getFileType } from '@/utils/helper';

type PreviewFileType = 'audio' | 'video' | 'image' | undefined;

const NFTDetailsPreview = () => {
  const {
    data: { fileUrl, title },
  } = useAppSelector(getNftSelector);
  const [fileType, setFileType] = useState<PreviewFileType>();

  useEffect(() => {
    if (fileUrl?.length) {
      const fileType = getFileType(fileUrl);
      setFileType(fileType);
    }
  }, [fileUrl]);

  return (
    <DivPreviewImageContainer>
      <PreviewBackground />
      {fileType === 'image' && <ImagePreview src={fileUrl} alt={title} />}
      {fileType === 'video' && <VideoPreview src={fileUrl} controls />}
      {fileType === 'audio' && <AudioPreview controls src={fileUrl} />}
    </DivPreviewImageContainer>
  );
};

export default NFTDetailsPreview;
