import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { getStorage, listAll, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './main';
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Paper,
  SvgIcon
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Header from './Header';
import AddImagePopup from './AddImagePopup';
import useWindowDimensions from './useWindowDimensions';
import Carousel from 'react-material-ui-carousel';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

interface imageSource {
  url: string;
  name: string;
}

function App() {
  const [images, setImages] = useState<imageSource[]>([]);
  const [addImage, setAddImage] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselImages, setCarouselImages] = useState<imageSource[]>([]);
  const [autoplay, setAutoplay] = useState(false);
  const { height, width } = useWindowDimensions();
  const columns = width > 1000 ? 3 : width > 600 ? 2 : 1;

  useEffect(() => {
    GetImages();
  }, []);

  //Get all images from firebase
  const GetImages = async () => {
    const storageRef = ref(storage, 'images');
    const result = await listAll(storageRef);
    const newImages: imageSource[] = [];
    for (const item of result.items) {
      const url = await getDownloadURL(ref(storage, item.fullPath));
      newImages.push({ url, name: item.name });
    }

    setImages(newImages.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const onClosePopup = () => {
    setAddImage(false);
    GetImages();
  };

  const onDeleteImage = (image: imageSource) => {
    const storage = getStorage();
    const desertRef = ref(storage, 'images/' + image.name);
    deleteObject(desertRef).then(() => {
      GetImages();
    });
  };

  const openCarousel = (index: number) => {
    const newImages: imageSource[] = [];

    for (let i = index; i < images.length + index; i++){
      newImages.push(images[i % (images.length)])
    }

    setCarouselImages(newImages);
    setShowCarousel(true);
  }

  const closeCarousel = () => {
    setShowCarousel(false);
    setCarouselImages([]);
  }

  return (
    <div>
      {showCarousel && (
          <div className={'carousel-wrapper'}>
              <Carousel height={height} autoPlay={autoplay} navButtonsAlwaysVisible={true} stopAutoPlayOnHover={false}>
                {carouselImages.map((value) => <Paper className={'image-paper'}>
                  <div className={'image-paper-header'}>
                    <div>
                      <FormControlLabel control={<Checkbox checked={autoplay} value={autoplay} onChange={(event, checked) => setAutoplay(checked)}/>} label="Autoplay"/>
                    </div>
                    <h2 className={'image-title'}>{value.name.slice(0, value.name.length - 4)}</h2>
                    <IconButton className={'image-paper-cancel'} onClick={closeCarousel}>
                      <CancelOutlinedIcon/>
                    </IconButton>
                  </div>
                  <img src={value.url}/>
                </Paper>)}
              </Carousel>
          </div>
      )}
      {addImage && (
        <AddImagePopup close={onClosePopup} cancel={() => setAddImage(false)}/>
      )}
      <div className={'popup-background' + (addImage ? '' : '-invisible')}>
        <Header onAdd={() => setAddImage(true)}/>
        <div className="App">
          <ImageList variant="masonry" cols={columns}>
            {images.map((image, index) => (
              <ImageListItem>
                <img src={image.url} alt={image.name} onClick={() => openCarousel(index)}/>
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
