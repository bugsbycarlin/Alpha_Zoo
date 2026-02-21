
//
// land.js contains all the code to make land.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

let background_color = 0x8eb35c;
let path_color = 0xf9e6bb;
let grass_color = 0xb1d571;
let forest_color = 0x518f40;
let ice_color = 0xFAFAFF;
let rock_color = 0xCECECE;
let sand_color = 0xf3cca0;
let water_color = 0x42b2d2;
let brown_rock_color = 0x744c29;
let underwater_rock_color = 0x676b5c;
let underwater_grey_rock_color = 0x82aab6;
let fence_color = 0x754c25;

let edging_depth = 25;

let square_width = 900;
let total_ents = 150;


let landDecorations = {
  "grass": {
    probability: 0.6,
    count: 7,
    objects: ["tree", "brown_rock", "grey_rock"]
  },
  "forest": {
    probability: 0.8,
    count: 10,
    objects: ["tree", "tree", "tree", "grey_rock"]
  },
  "sand": {
    probability: 0.4,
    count: 5,
    objects: ["brown_rock"]
  },
  "water": {
    probability: 0.4,
    count: 5,
    objects: ["brown_rock", "grey_rock"]
  },
  "ice": {
    probability: 0.4,
    count: 5,
    objects: ["grey_rock"]
  },
  "rock": {
    probability: 0.4,
    count: 5,
    objects: ["grey_rock", "grey_rock", "brown_rock"]
  }
};



