import { SetStateAction, useState } from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { storage } from './main';
import { ref, uploadBytes } from 'firebase/storage';

export interface IAddImagePopupProps {
  close: () => void;
  cancel: () => void;
}

export default function AddImagePopup(props: IAddImagePopupProps) {
  const [file, setFile] = useState<File | undefined>();
  const [preview, setPreview] = useState<string>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const file = files.item(0);
    if (!file) return;

    if (file.type === 'image/jpeg' || file.type === 'image/png') {
      setFile(file);
      const reader = new FileReader();
      reader.onload = function (e) {
        setPreview(e.target?.result?.toString());
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!file) return;
    const storageRef = ref(storage, 'images/' + file.name);
    uploadBytes(storageRef, file).then(() => {
      setFile(undefined);
      setPreview(undefined);
      props.close();
    });
  };

  const handleCancel = () => {
    setFile(undefined);
    setPreview(undefined);
    props.cancel();
  }

  return (
    <div className="popup">
      <div className={'popup-header'}>
        <h3 className={'popup-header-text'}>Add Image</h3>
      </div>
      <form onSubmit={handleSubmit} className={'popup-form'}>
        <Button variant="contained" component="label" color="primary">
          {' '}
          <AddIcon/> Select a file
          <input type="file" hidden onInput={handleChange}/>
        </Button>
        <img src={preview} className={'image-preview'} alt={'preview'}/>
        <div className={'popup-form-buttons'}>
          <Button variant="contained" color="primary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" type="submit">
            Upload
          </Button>
        </div>
      </form>
    </div>
  );
}