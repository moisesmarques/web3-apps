import React, { useState, useEffect, useRef } from 'react';

import ClickAwayListener from '@mui/base/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper, { PopperPlacementType } from '@mui/material/Popper';
import cn from 'classnames';

import ListPopperStyled from './ListPopper.styles';

interface Props {
  Button: React.ReactElement;
  List: React.ReactElement;
  open: boolean;
  onClose: () => void;
  popperClassName?: string;
  placement?: PopperPlacementType;
}

export const ListPopper: React.FC<Props> = ({
  Button,
  List,
  open,
  onClose,
  popperClassName,
  placement = 'bottom-end',
}) => {
  const [isFirstRender, setIsFirstRender] = useState(true);
  // on first render there's no ref created which is required by Popper
  // this workaround forces rerender to make the ref accessible by Popper component
  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
    }
  }, [isFirstRender]);

  const anchorRef = useRef<HTMLDivElement>(null);

  const handleCloseList = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    onClose();
  };

  return (
    <ListPopperStyled>
      <div ref={anchorRef}>{Button}</div>
      <Popper
        open={open && !isFirstRender}
        placement={placement}
        anchorEl={anchorRef.current}
        className={cn('dropDown', popperClassName)}
      >
        <ClickAwayListener onClickAway={handleCloseList}>
          {/* ClickAwayListener children should be enwrapped with any component to make it work */}
          <Paper elevation={1}>{List}</Paper>
        </ClickAwayListener>
      </Popper>
    </ListPopperStyled>
  );
};

export default ListPopper;
