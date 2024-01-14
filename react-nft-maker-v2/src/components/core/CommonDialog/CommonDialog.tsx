import * as React from 'react';

import { Breakpoint, Dialog, DialogContent } from '@mui/material';

import { CloseButton } from '@/assets/svg/CloseButton';

import { DialogTitleStyled, DivBackButtonWrapper, DivButtonWrapper, DivTitleStyle } from './CommonDialog.styles';
import { AlignTitleType } from './CommonDialog.types';

export interface IDialogProps {
  open: boolean;
  onClose?: (event: object, reason: 'backdropClick' | 'escapeKeyDown' | 'buttonClick') => void;
  onBack?: () => void;
  disableBack?: boolean;
  title?: string;
  children: any;
  alignTitle?: AlignTitleType;
  maxWidth?: false | Breakpoint;
  className?: string;
  paperStyle?: any;
  crossIconPosition?: {
    top: string;
    right: string;
  };
  showClose?: boolean;
  altClose?: boolean;
  altIconPosition?: {
    top: string;
    right: string;
  };
  altIcon?: JSX.Element;
  altFunc?(): void;
}

const CommonDialog: React.FC<React.PropsWithChildren<IDialogProps>> = (props) => {
  const {
    onClose,
    onBack,
    disableBack,
    open,
    title,
    children,
    alignTitle,
    maxWidth,
    className,
    paperStyle,
    crossIconPosition,
    showClose = true,
    altClose = false,
    altIconPosition,
    altIcon,
    altFunc,
  } = props;
  return (
    <Dialog
      className={className}
      data-testid="common-dialog-component"
      onClose={onClose}
      open={open}
      keepMounted
      fullWidth
      maxWidth={maxWidth || 'xs'}
      PaperProps={{
        style: { overflow: 'hidden', borderRadius: 8, padding: 20, ...paperStyle },
      }}
    >
      <DialogTitleStyled>
        <DivTitleStyle alignTitle={alignTitle}>
          {onBack && !disableBack && (
            <DivBackButtonWrapper onClick={onBack} data-testid="back-button">
              Back
            </DivBackButtonWrapper>
          )}
          {title}
          {showClose && !altClose && (
            <DivButtonWrapper
              position={crossIconPosition}
              onClick={(e) => (onClose ? onClose(e, 'buttonClick') : null)}
              data-testid="close-button"
            >
              <CloseButton />
            </DivButtonWrapper>
          )}
          {altClose && altIcon && (
            <DivButtonWrapper
              position={altIconPosition}
              onClick={(e) => {
                e.preventDefault();
                if (altFunc) altFunc();
              }}
              data-testid="alt-button"
            >
              {altIcon}
            </DivButtonWrapper>
          )}
        </DivTitleStyle>
      </DialogTitleStyled>
      <DialogContent
        style={{
          overflowX: 'hidden',
          overflowY: 'auto',
          padding: '20px 14px',
        }}
        sx={{
          ['@media (max-width:576px)']: {
            padding: '0 !important',
          },
        }}
      >
        {/* <div className="scroll-prevent"> */}
        {/* {children} */}
        {children}
        {/* </div> */}
      </DialogContent>
    </Dialog>
  );
};

export default CommonDialog;
