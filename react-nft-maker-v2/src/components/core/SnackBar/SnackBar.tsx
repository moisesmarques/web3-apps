import * as React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { AlertColor } from '@mui/material/Alert/Alert';
import IconButton from '@mui/material/IconButton';
import Slide, { SlideProps } from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

type TransitionProps = Omit<SlideProps, 'direction'>;

function TransitionLeft(props: TransitionProps) {
  return <Slide {...props} direction="left" />;
}

export enum SnackBarType {
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
}

interface Props {
  content: string;
  visible: boolean;
  setVisible: (isVisible: boolean) => void;
  type: AlertColor;
  onClick?: () => void;
}

export default function SnackBar({ content, visible, setVisible, type, onClick }: Props) {
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setVisible(false);
  };

  const action = (
    <React.Fragment>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <Snackbar
      open={visible}
      autoHideDuration={5000}
      onClose={handleClose}
      action={action}
      TransitionComponent={TransitionLeft}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      onClick={onClick}
      sx={{ maxWidth: { sm: '100%', md: '30vw' } }}
    >
      <Alert onClose={handleClose} severity={type}>
        {content}
      </Alert>
    </Snackbar>
  );
}
