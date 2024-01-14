import React from 'react';

import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent, SelectProps } from '@mui/material/Select';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

/**
 * @interface Props
 * @property {filters} - array filter options
 * @property {value} - array of selected options
 * @property {label} - label of the filter
 * @property {allowMutiple} - allowMultiple flag
 * @property {handleChange} - function for handling filter change event
 */
interface Props extends SelectProps {
  filters: string[];
  value: string[];
  label: string;
  allowMutiple?: boolean;
  width?: string;
  handleChange?: (e: SelectChangeEvent<string[]>) => void;
}

/**
 *
 * @param props Contain all necessary information for the component
 * @returns Filter dropdown component
 */
export default function Filter({ filters, label, value, handleChange, allowMutiple = true, width, ...rest }: Props) {
  const onSelectValueChange = (e: SelectChangeEvent<string[]>) => handleChange && handleChange(e);
  return (
    <div>
      <FormControl sx={{ m: 1, width: width || 200 }}>
        <InputLabel id="filters-selection-label">{label}</InputLabel>
        <Select
          {...rest}
          labelId="filters-selection-label"
          multiple={allowMutiple}
          value={value}
          defaultValue={[]}
          onChange={onSelectValueChange}
          input={<OutlinedInput label={label} />}
          renderValue={(selected: string[]) => selected.join(', ')}
          MenuProps={MenuProps}
        >
          {filters.map((item) => (
            <MenuItem key={item} value={item}>
              <Checkbox checked={value.indexOf(item) > -1} />
              <ListItemText primary={item} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
