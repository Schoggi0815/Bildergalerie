import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { getStorage, listAll, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './main';
import { IconButton, ImageList, ImageListItem, ImageListItemBar, SvgIcon } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Header from './Header';
import AddImagePopup from './AddImagePopup';

interface imageSource {
  url: string;
  name: string;
}

function App() {
  const [images, setImages] = useState<imageSource[]>([]);
  const [addImage, setAddImage] = useState(false);

  useEffect(() => {
    GetImages();
  }, []);

  //Get all images from firebase
  const GetImages = () => {
    const storageRef = ref(storage, 'images');
    listAll(storageRef).then(result => {
      setImages([]);
      result.items.forEach(item => {
        getDownloadURL(ref(storage, item.fullPath)).then(url => {
          setImages(images => [...images, { url, name: item.name }]);
        });
      });
    });
  };

  const onClosePopup = () => {
    setAddImage(false);
    GetImages();
  }

  const onDeleteImage = (image: imageSource) => {
    const storage = getStorage();
    const desertRef = ref(storage, 'images/' + image.name);
    deleteObject(desertRef).then(() => {
      GetImages();
    });
  }

  return (
    <div>
      {addImage && (
        <AddImagePopup close={onClosePopup} cancel={() => setAddImage(false)}/>
      )}
      <div className={'popup-background' + (addImage ? '' : '-invisible')}>
        <Header onAdd={() => setAddImage(true)}/>
        <div className="App">
          <ImageList variant="masonry" cols={3}>
            {images.map(image => (
              <ImageListItem>
                <img src={image.url} alt={image.name}/>
                <ImageListItemBar
                  title={image.name}
                  actionIcon={
                    <IconButton
                      sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                      onClick={() => onDeleteImage(image)}
                    >
                      <DeleteIcon/>
                    </IconButton>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
        </div>
      </div>
    </div>
  );
}

export default App;
