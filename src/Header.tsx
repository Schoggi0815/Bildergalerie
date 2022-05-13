import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export interface IHeaderProps {
  onAdd: () => void;
}

export default function Header(props: IHeaderProps) {
  return (
    <div className="header">
      <IconButton onClick={props.onAdd}>
        <AddIcon/>
      </IconButton>
    </div>
  );
}