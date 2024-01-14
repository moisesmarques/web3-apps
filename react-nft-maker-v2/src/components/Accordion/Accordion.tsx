import { ReactNode, useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { DivAccordionStyled, StyledTypography } from './Accordion.styles';

interface IAccordionProps {
  title: string;
  children: ReactNode;
  open?: boolean;
}

/**
 *
 * @returns This component will return Functioning Accordion Component
 */
const CustomAccordion = (props: IAccordionProps) => {
  const { title, children, open } = props;
  const [expanded, setExpanded] = useState<boolean>(open ?? false);

  const handleChange = () => setExpanded(!expanded);

  return (
    <DivAccordionStyled>
      <Accordion expanded={expanded} onChange={handleChange}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} id="panel1bh-header">
          <StyledTypography>{title}</StyledTypography>
        </AccordionSummary>
        <AccordionDetails>{children}</AccordionDetails>
      </Accordion>
    </DivAccordionStyled>
  );
};

export default CustomAccordion;
