import { DivNoRecordStyled } from '@/components/NoRecordFound/NoRecordFound.styles';

const NoRecordFound = ({ text = 'No records found' }: { text: string }) => {
  return (
    <>
      <DivNoRecordStyled>{text}</DivNoRecordStyled>
    </>
  );
};

export default NoRecordFound;
