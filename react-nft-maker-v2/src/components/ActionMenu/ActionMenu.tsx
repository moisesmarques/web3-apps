import React, { FC, useState } from 'react';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

import ListPopper from '../core/ListPoper';

interface Props {
  onSelectAll?: () => void;
  onSelect?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete: () => void;
}

const ActionMenu: FC<Props> = ({ onSelectAll, onSelect, onMoveUp, onMoveDown, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleOpenMenu = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setIsMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSelectAll = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    handleCloseMenu();
    onSelectAll && onSelectAll();
  };

  const handleSelect = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    handleCloseMenu();
    onSelect && onSelect();
  };

  const handleMoveUp = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    handleCloseMenu();
    onMoveUp && onMoveUp();
  };

  const handleMoveDown = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    handleCloseMenu();
    onMoveDown && onMoveDown();
  };

  const handleDelete = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    handleCloseMenu();
    onDelete();
  };

  const renderList = () => {
    return (
      <MenuList className="menu">
        {onSelectAll && (
          <MenuItem className="root" onClick={handleSelectAll}>
            <DoneAllIcon />
            <span className="title">Select All</span>
          </MenuItem>
        )}
        {onSelect && (
          <MenuItem className="root" onClick={handleSelect}>
            <DoneIcon />
            <span className="title">Select</span>
          </MenuItem>
        )}
        {onMoveUp && (
          <MenuItem className="root" onClick={handleMoveUp}>
            <ArrowUpwardIcon />
            <span className="title">Move Up</span>
          </MenuItem>
        )}
        {onMoveDown && (
          <MenuItem className="root" onClick={handleMoveDown}>
            <ArrowDownwardIcon />
            <span className="title">Move Down</span>
          </MenuItem>
        )}
        <MenuItem className="root" onClick={handleDelete}>
          <DeleteIcon />
          <span className="title">Delete list</span>
        </MenuItem>
      </MenuList>
    );
  };

  return (
    <ListPopper
      open={isMenuOpen}
      onClose={handleCloseMenu}
      Button={
        <IconButton aria-label="Expand" role="button" onClick={handleOpenMenu}>
          <MoreHorizIcon />
        </IconButton>
      }
      List={renderList()}
    />
  );
};

export default ActionMenu;
