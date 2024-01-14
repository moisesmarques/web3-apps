import React, { FC } from 'react';

import { getFileType } from '@/utils/helper';

import ActionMenu from '../ActionMenu';
import NftCardStyled from './Card.styles';
import { INftCardType } from './Card.types';

interface Props {
  data: INftCardType;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onDownUp: (id: string) => void;
  onSelect?: (selectedNftId: string, isChecked: boolean) => void;
  disableActionIcon?: boolean;
  isChecked?: boolean;
  enableRadiobutton?: boolean;
}

const Card: FC<Props> = ({
  data,
  onDelete,
  onMoveUp,
  onDownUp,
  disableActionIcon,
  isChecked,
  enableRadiobutton,
  onSelect,
}) => {
  const onDeletePress = () => onDelete(data.id);

  const onMoveUpClicked = () => onMoveUp(data.id);

  const onMoveDownClicked = () => onDownUp(data.id);

  const renderMedia = (fileUrl: string) => {
    const fileType = getFileType(fileUrl);

    if (fileType === 'image') {
      return <img className="card-image" src={fileUrl} />;
    }
    if (fileType === 'video') {
      return <video controls className="card-image" src={fileUrl} />;
    }
    if (fileType === 'audio') {
      return <audio controls className="card-image" src={fileUrl} />;
    }
  };

  return (
    <NftCardStyled onClick={() => onSelect && onSelect(data.id, isChecked || false)}>
      <div className="card-image-container">
        <span className="card-category-label">Digital Art</span>
        {renderMedia(data.fileUrl)}
      </div>
      <div className="card-content-area">
        <div className="card-content-actions">
          <p className="card-title-text">{data.title}</p>
          {!disableActionIcon && (
            <ActionMenu onDelete={onDeletePress} onMoveUp={onMoveUpClicked} onMoveDown={onMoveDownClicked} />
          )}
          {enableRadiobutton && (
            <label
              className="container-radio"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onClick={() => onSelect && onSelect(data.id, isChecked || false)}
              />
              <span className="checkmark-radio">{isChecked}</span>
            </label>
          )}
        </div>
        <p className="card-id-text">{`#${data.id}`}</p>
      </div>
    </NftCardStyled>
  );
};
export default Card;
