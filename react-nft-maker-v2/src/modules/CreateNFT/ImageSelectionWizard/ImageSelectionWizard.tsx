import { useCallback, useState } from 'react';

import { ArrowRight } from '@/assets/svg/arrow-right';
import { RemoveIcon } from '@/assets/svg/remove-icon';
import MediaItem from '@/components/MediaItem';
import { COLORS } from '@/constants/colors';
import { ACCEPTED_FILE_EXTENSIONS } from '@/constants/file';
import { useAppDispatch } from '@/hooks/useReduxTypedHooks';
import { setSelectedFile as setSelectedFileToStore } from '@/store/nft/nftSlice';
import fileHelper from '@/utils/file-upload.utils';

import { ButtonCreate, TextButton } from '../CreateNFT.styles';
import {
  DivContentContainer,
  DivFileUploadWrapper,
  DivImageUploadContainer,
  InputFileUpload,
  LabelFileUpload,
  ParagraphExtensionDescription,
  TitleImageContainer,
  DivMediaPreviewContainer,
} from './ImageSelectionWizard.styles';

const allowedUploadCount = 1;
const requiredFileExtensionsDescription = `${ACCEPTED_FILE_EXTENSIONS.map((extension) =>
  extension.substring(1).toUpperCase()
)
  .join(', ')
  .replace(/, ([^,]*)$/, ' or $1')}`;

type IProps = {
  setProgress: (progress: number) => void;
  handleNext: () => void;
};

const ImageSelectionWizard = (props: IProps) => {
  const { handleNext, setProgress } = props;

  const dispatch = useAppDispatch();
  const [, setCorruptedFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const nextStep = useCallback(() => {
    if (selectedFile) {
      dispatch(setSelectedFileToStore(selectedFile));
      handleNext();
    }
  }, [handleNext, selectedFile]);

  const handleNewFileUpload = async (files: FileList | null) => {
    if (!files) {
      return;
    }

    const errorObject = fileHelper.validateFilesForUpload(files, allowedUploadCount, ACCEPTED_FILE_EXTENSIONS);

    if (!errorObject) {
      const newFile = files[0];
      setSelectedFile(newFile);
      setProgress(15);
      setCorruptedFile(false);
    }
  };

  const handleDragableItem = (actionType: string) => (e: any) => {
    switch (actionType) {
      case 'placed':
        e.preventDefault();
        e.stopPropagation();
        handleNewFileUpload(e.dataTransfer.files);
        break;
      case 'over':
        e.preventDefault();
        e.stopPropagation();
        break;
      default:
        break;
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(undefined);
    setCorruptedFile(false);
    setProgress(0);
  };

  return (
    <DivContentContainer selectedFile={!!selectedFile}>
      <TitleImageContainer>Upload File</TitleImageContainer>
      <DivImageUploadContainer onDrop={handleDragableItem('placed')} onDragOver={handleDragableItem('over')}>
        <InputFileUpload
          type="file"
          id="files"
          name="file"
          data-testid="file-uploader"
          onChange={(e) => handleNewFileUpload(e.target.files)}
          onClick={(e: any) => {
            e.target.value = null;
          }}
          accept={ACCEPTED_FILE_EXTENSIONS.join(', ')}
          required
        />
        <DivFileUploadWrapper>
          <LabelFileUpload htmlFor="files">Choose File</LabelFileUpload>
        </DivFileUploadWrapper>
        <ParagraphExtensionDescription>
          {requiredFileExtensionsDescription} Max{' '}
          {fileHelper.convertBytesToMB(fileHelper.DEFAULT_MAX_FILE_SIZE_IN_BYTES)}MB
        </ParagraphExtensionDescription>
      </DivImageUploadContainer>
      {selectedFile && (
        <DivMediaPreviewContainer>
          <MediaItem file={selectedFile} />
          File: {selectedFile?.name}
        </DivMediaPreviewContainer>
      )}
      {selectedFile && (
        <TextButton onClick={removeSelectedFile} backgroundColor={COLORS.WHITE_100} hoverColor={COLORS.WHITE_100}>
          Remove <RemoveIcon />
        </TextButton>
      )}
      {selectedFile && (
        <ButtonCreate onClick={nextStep} backgroundColor={COLORS.THEME_BUTTON} hoverColor={COLORS.THEME_BUTTON}>
          Next <ArrowRight />
        </ButtonCreate>
      )}
    </DivContentContainer>
  );
};

export default ImageSelectionWizard;
