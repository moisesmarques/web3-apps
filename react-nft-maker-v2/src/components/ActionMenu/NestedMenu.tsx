import React, { FC, useState } from 'react';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuItem from '@mui/material/MenuItem';

import ListPopper from '../core/ListPoper';

interface Props {
  isParentOpen: boolean;
  label: string;
}

const NestedMenu: FC<Props> = ({ isParentOpen, label, children }) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const handleOpen = () => {
    setIsSubMenuOpen(true);
  };

  const handleClose = () => {
    setIsSubMenuOpen(false);
  };

  return (
    <MenuItem onClick={handleOpen} onMouseEnter={handleOpen} onMouseLeave={handleClose} className="menuButton">
      <ListPopper
        open={isParentOpen && Boolean(isSubMenuOpen)}
        onClose={() => setIsSubMenuOpen(false)}
        placement="left-start"
        popperClassName="popper"
        Button={
          <MenuItem className="menu">
            <span className="title">{label}</span>
            <KeyboardArrowDownIcon className="arrow" />
          </MenuItem>
        }
        List={<div className="subMenu">{children}</div>}
      />
    </MenuItem>
  );
};

export default NestedMenu;
