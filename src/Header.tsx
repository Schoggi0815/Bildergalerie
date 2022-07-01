import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Rubiks from './Rubiks';
import { Canvas } from '@react-three/fiber';
import firebase from 'firebase/compat';
import onLog = firebase.onLog;
import { useState } from 'react';

export interface IHeaderProps {
  onAdd: () => void;
}

export default function Header(props: IHeaderProps) {
  let onClickCube= () => {};

  return (
    <div className="header">
      <IconButton onClick={props.onAdd}>
        <AddIcon/>
      </IconButton>
      <div className={'canvas-wrapper'} onClick={() => {
        onClickCube();
      }}>
        <Canvas>
          <Rubiks getOnClick={onClick1 => onClickCube = onClick1}/>
        </Canvas>
      </div>
    </div>
  );
}