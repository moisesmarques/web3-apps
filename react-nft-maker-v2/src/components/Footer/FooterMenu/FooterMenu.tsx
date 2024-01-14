import React, { FC, MouseEvent, memo, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import CallMadeIcon from '@mui/icons-material/CallMade';
import { ListItemIcon } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';

import { MainFooterMenu } from '@/components/Footer/FooterMenu/FooterMenu.styles';
import { useAppDispatch } from '@/hooks/useReduxTypedHooks';
import { openSendNftDialog } from '@/store/dialogs';
import { openCreateNftDialog } from '@/store/dialogs/dialogsSlice';

/**
 * Main Footer component
 * @interface FooterMenuTypes
 * @property {children} - FooterMenu children
 */

interface FooterMenuTypes {
  children: any;
  toggleActive(): void;
}

const FooterMenu: FC<FooterMenuTypes> = memo(({ children, toggleActive }) => {
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    toggleActive();
  };
  const handleClose = () => {
    setAnchorEl(null);
    toggleActive();
  };

  const handleSendNft = () => {
    dispatch(openSendNftDialog());
  };

  const handleMintNft = () => {
    dispatch(openCreateNftDialog());
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        data-testid="footerMenu"
      >
        {children}
      </IconButton>
      <MainFooterMenu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        style={{ paddingTop: 0 }}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 2,
          style: {
            background: 'black',
            borderRadius: 24,
            height: 'fit-content',
            padding: '10px 30px',
          },
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              bottom: -8,
              right: 103,
              width: 10,
              height: 10,
              bgcolor: 'black',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
      >
        <MenuItem style={{ color: 'white' }} onClick={handleMintNft}>
          <ListItemIcon>
            <AddIcon style={{ color: 'white' }} fontSize="small" />
          </ListItemIcon>
          Mint NFT
        </MenuItem>
        <MenuItem style={{ color: 'white' }} onClick={handleSendNft}>
          <ListItemIcon>
            <CallMadeIcon style={{ color: 'white' }} fontSize="small" />
          </ListItemIcon>
          Gift NFT
        </MenuItem>
      </MainFooterMenu>
    </>
  );
});

export default FooterMenu;
