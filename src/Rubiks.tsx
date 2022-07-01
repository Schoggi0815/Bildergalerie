import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export interface IRubiksProps {
  getOnClick: (onClick: (() => void)) => void;
}

export default function Rubiks(props: IRubiksProps) {
  const cube: THREE.Group[][][] = [];

  let moves: {direction: Direction, backSide: boolean, backwards: boolean}[] = [];

  props.getOnClick(() => {
    backtrack = true;
  });

  let index = 0;

  for (let i = 0; i < 3; i++) {
    cube[i] = [];
    for (let j = 0; j < 3; j++) {
      cube[i][j] = [];
      for (let k = 0; k < 3; k++) {
        if (i === 1 && j === 1 && k === 1) {
          continue;
        }

        const fbx = useLoader(FBXLoader, 'models/cube' + index.toString() + '.fbx');
        fbx.scale.set(0.006, 0.006, 0.006);
        cube[i][j][k] = fbx;

        index++;
      }
    }
  }

  const forEachCube = (callback: (cube: THREE.Group, x: number, y: number, z: number) => void) => {
    cube.forEach((cube1, y) => {
      cube1.forEach((cube2, z) => {
        cube2.forEach((fbx, x) => {
          callback(fbx, x, y, z);
        });
      });
    });
  }

  const mapCube = (callback: (cube: THREE.Group) => JSX.Element) => {
    return cube.map(cube1 => {
      return cube1.map(cube2 => {
        return cube2.map(fbx => {
          return callback(fbx);
        });
      });
    });
  }

  let backtrack = false;
  let rotateTimer = 0;
  const tween: {call: (num: number) => void, duration: number, current: number}[] = [];

  useFrame((state, delta) => {
    tween.forEach(t => {
      const newCurrent = Math.min(t.current + delta / t.duration, 1);
      t.call(newCurrent - t.current);
      t.current = newCurrent;

      if (newCurrent === 1) {
        tween.splice(tween.indexOf(t), 1);
      }
    })

    rotateTimer += delta;
    cube[0][0][0].parent?.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), backtrack ? -delta : delta);

    if (rotateTimer > 1) {
      if (!backtrack) {
        rotateTimer -= 1;
        const move = {
          direction: Math.floor(Math.random() * 3),
          backSide: Math.random() < 0.5,
          backwards: Math.random() < 0.5
        };
        rotate(move.direction, move.backSide, move.backwards);
        moves.push(move);
      }
      else {
        rotateTimer -= 0.25;
        const move = moves.pop();
        if (move) {
          rotate(move.direction, move.backSide, !move.backwards);
        }
        if (moves.length === 0) {
          backtrack = false;
          rotateTimer -= 1;
        }
      }
    }
  })

  function multiply(a: number[][], b: number[][]) {
    const aNumRows = a.length, aNumCols = a[0].length,
      bNumCols = b[0].length,
      m = new Array(aNumRows);  // initialize array of rows
    for (let r = 0; r < aNumRows; ++r) {
      m[r] = new Array(bNumCols); // initialize the current row
      for (let c = 0; c < bNumCols; ++c) {
        m[r][c] = 0;             // initialize the current cell
        for (let i = 0; i < aNumCols; ++i) {
          m[r][c] += a[r][i] * b[i][c];
        }
      }
    }
    return m;
  }

  const getRotMatrix = (angle: number) => {
    angle = angle * Math.PI / 180;
    return [
      [Math.cos(angle), -Math.sin(angle)],
      [Math.sin(angle), Math.cos(angle)]
    ]
  }

  const rotatePos = (pos: number[], angle: number) => {
    const rotMatrix = getRotMatrix(angle);
    const result = multiply(rotMatrix, [[pos[0]], [pos[1]]]);
    return [Math.round(result[0][0]), Math.round(result[1][0])];
  }

  const rotate = (direction: Direction, backside: boolean, negative: boolean) => {
    const angle = negative ? -90 : 90;
    const toRotate: {fbx: THREE.Group, newPos: number[]}[] = [];

    forEachCube((fbx, x, y, z) => {
      let axis = 0;
      switch (direction) {
        case Direction.X:
          axis = x;
          break;
        case Direction.Y:
          axis = y;
          break;
        case Direction.Z:
          axis = z;
          break;
      }

      if (axis === (backside ? 2 : 0)){
        toRotate.push({fbx, newPos: rotatePos([(direction != Direction.X ? x : y) - 1, (direction === Direction.Z ? y : z) - 1], direction === Direction.Y ? -angle : angle)});
      }
    })

    const fbxToRotate: THREE.Group[] = [];

    toRotate.forEach(({fbx, newPos}) => {
      let x = 0;
      let y = 0;
      let z = 0;
      switch (direction) {
        case Direction.X:
          x = backside ? 2 : 0;
          y = newPos[0] + 1;
          z = newPos[1] + 1;
          break;
        case Direction.Y:
          x = newPos[0] + 1;
          y = backside ? 2 : 0;
          z = newPos[1] + 1;
          break;
        case Direction.Z:
          x = newPos[0] + 1;
          y = newPos[1] + 1;
          z = backside ? 2 : 0;
          break;
      }

      cube[y][z][x] = fbx;

      fbxToRotate.push(fbx);
    })

    tween.push({
      duration: 0.25,
      call: (num) => {
        fbxToRotate.forEach(fbx => {
          fbx.rotateOnWorldAxis(new THREE.Vector3(direction === Direction.X ? 1 : 0, direction === Direction.Y ? 1 : 0, direction === Direction.Z ? 1 : 0), num * angle * Math.PI / 180);
        })
      },
      current: 0
    })
  }

  return(
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <group>
        {mapCube(fbx => {
          return <primitive object={fbx} />
        })}
      </group>
    </>
  )
}

enum Direction {
  X,
  Y,
  Z
}