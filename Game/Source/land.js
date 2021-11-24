
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



Game.prototype.initializeMap = function() {
  var self = this;
  var screen = this.screens["zoo"];

  let static_background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  static_background.width = 1280;
  static_background.height = 960;
  static_background.tint = background_color;

  screen.addChild(static_background);

  // The zoo is an NxN grid of square pens. Small is 5, leading to at most 25 pens.
  // Large is 8, leading to at most 64 pens.
  // Note some squares may be snipped, meaning less pens.
  this.zoo_size = parseInt(localStorage.getItem("zoo_size")) || 6;
  if (this.zoo_size == null) this.zoo_size = 6;
  console.log("Zoo size is " + this.zoo_size);

  this.map = new PIXI.Container();
  this.map.position.set(640,480)
  screen.addChild(this.map);

  this.map.background_layer = new PIXI.Container();
  this.map.addChild(this.map.background_layer);

  this.map.build_effect_layer = new PIXI.Container();
  this.map.addChild(this.map.build_effect_layer);

  this.map.terrain_layer = new PIXI.Container();
  this.map.addChild(this.map.terrain_layer);

  this.map.decoration_layer = new PIXI.Container();
  this.map.addChild(this.map.decoration_layer);

  this.decorations = [];

  // Vertices (crossroads in the path)
  this.zoo_vertices = {};
  for (let i = 0; i <= this.zoo_size; i++) {
    this.zoo_vertices[i] = {};
    for (let j = 0; j <= this.zoo_size; j++) {
      this.zoo_vertices[i][j] = {
        use: false,
        n_path: false,
        s_path: false,
        w_path: false,
        e_path: false,
        vertex: [square_width * i, square_width * j],
        halo: {
          nw: [square_width * i - 180 - 60 * Math.random(), square_width * j - 180 - 60 * Math.random()],
          ne: [square_width * i + 180 + 60 * Math.random(), square_width * j - 180 - 60 * Math.random()],
          sw: [square_width * i - 180 - 60 * Math.random(), square_width * j + 180 + 60 * Math.random()],
          se: [square_width * i + 180 + 60 * Math.random(), square_width * j + 180 + 60 * Math.random()],
          n: [square_width * i - 30 + 60 * Math.random(), square_width * j - 180 - 60 * Math.random()],
          s: [square_width * i - 30 + 60 * Math.random(), square_width * j + 180 + 60 * Math.random()],
          e: [square_width * i + 180 + 60 * Math.random(), square_width * j - 30 + 60 * Math.random()],
          w: [square_width * i - 180 - 60 * Math.random(), square_width * j - 30 + 60 * Math.random()],
        }
      };
    }
  }

  // The square faces between vertices.
  // The (0,0) vertex lies above and to the left of the (0,0) square.
  // The (1,1) vertex lies below and to the right of the (1,1) square.
  // Obviously coords are x,y.
  this.zoo_squares = {};
  for (let i = 0; i < this.zoo_size; i++) {
    this.zoo_squares[i] = {};
    for (let j = 0; j < this.zoo_size; j++) {
      this.zoo_squares[i][j] = {
        group: -1,
        new_group: null,
        section: null,
        reachable: false,
        outer: (i == 0 || i == this.zoo_size - 1 || j == 0 || j == this.zoo_size - 1),
        n_edge: false,
        s_edge: false,
        w_edge: false,
        e_edge: false,
        pen: null,
      };
    }
  }

  this.zoo_pens = [];
}



Game.prototype.makeMapGroups = function() {
  var self = this;
  var screen = this.screens["zoo"];

  // Mark groups using a random search
  let group_num = 1;
  let group_count = 0;
  let max_group_count = Math.floor(2 + Math.random() * 5);
  this.group_colors = {};
  this.group_counts = {};

  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      if (this.zoo_squares[i][j].group == -1) {
        let new_group_count = this.markGroup(i, j, group_num, group_count, max_group_count);
        this.group_colors[group_num] = PIXI.utils.rgb2hex([Math.random(), Math.random(), Math.random()]);
        this.group_counts[group_num] = new_group_count;
        group_num += 1;
        group_count = 0;
        max_group_count = Math.floor(2 + Math.random() * 5);
      }
    }
  }

  // Attach singletons to larger groups
  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      let cell = this.zoo_squares[i][j];
      if (this.group_counts[cell.group] == 1) {
        let neighbors = [];
        if (i > 0) neighbors.push(this.zoo_squares[i-1][j].group);
        if (i < this.zoo_size - 1) neighbors.push(this.zoo_squares[i+1][j].group);
        if (j > 0) neighbors.push(this.zoo_squares[i][j-1].group);
        if (j < this.zoo_size - 1) neighbors.push(this.zoo_squares[i][j+1].group);
        shuffleArray(neighbors);
        cell.new_group = neighbors[0];
      }
    }
  }
  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      let cell = this.zoo_squares[i][j];
      if (this.group_counts[cell.group] == 1) {
        cell.group = cell.new_group;
        cell.new_group = null;
      }
    }
  }

}


Game.prototype.markGroup = function(i, j, group_num, group_count, max_group_count) {
  if (group_count >= max_group_count) return group_count;

  this.zoo_squares[i][j].group = group_num;
  group_count += 1;

  let neighbors = [];
  if (i > 0 && this.zoo_squares[i-1][j].group == -1) {
    neighbors.push([i-1,j]);
  }
  if (i < this.zoo_size - 1 && this.zoo_squares[i+1][j].group == -1) {
    neighbors.push([i+1,j]);
  }
  if (j > 0 && this.zoo_squares[i][j-1].group == -1) {
    neighbors.push([i,j-1]);
  }
  if (j < this.zoo_size - 1 && this.zoo_squares[i][j+1].group == -1) {
    neighbors.push([i,j+1]);
  }
  
  if (neighbors.length > 0) {
    shuffleArray(neighbors);
    group_count = this.markGroup(neighbors[0][0], neighbors[0][1], group_num, group_count, max_group_count);
  }

  return group_count;
}


Game.prototype.makeMapPath = function() {
  var self = this;
  var screen = this.screens["zoo"];

  for (let i = 1; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      if (this.zoo_squares[i][j].group != this.zoo_squares[i-1][j].group) {
          
        this.zoo_squares[i][j].w_edge = true;
        this.zoo_squares[i-1][j].e_edge = true;

        this.zoo_squares[i][j].reachable = true;
        this.zoo_squares[i-1][j].reachable = true;

        this.zoo_vertices[i][j].s_path = true;
        this.zoo_vertices[i][j+1].n_path = true;
      }
    }
  }

  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 1; j < this.zoo_size; j++) {
      if (this.zoo_squares[i][j].group != this.zoo_squares[i][j-1].group) {
        this.zoo_squares[i][j].n_edge = true;
        this.zoo_squares[i][j-1].s_edge = true;

        this.zoo_squares[i][j].reachable = true;
        this.zoo_squares[i][j-1].reachable = true;

        this.zoo_vertices[i][j].e_path = true;
        this.zoo_vertices[i+1][j].w_path = true;
      }
    }
  }
}


Game.prototype.isFerrisTile = function(i,j) {
  if (this.special_ferris_tile == null) return false;

  if (i == this.special_ferris_tile[0] && j == this.special_ferris_tile[1]) return true;

  return false;
}


Game.prototype.isCafeTile = function(i,j) {
  if (this.special_cafe_tile == null) return false;

  if (i == this.special_cafe_tile[0] && j == this.special_cafe_tile[1]) return true;

  return false;
}


Game.prototype.makeMapPens = function() {

  // first, choose a special ferris wheel tile pair. hold these out from this process.
  this.special_ferris_tile = null;
  if (this.zoo_size >= 6) {
    let potential_ferris_tiles = [];
    for (let i = 1; i < this.zoo_size - 2; i++) {
      for (let j = 2; j < this.zoo_size - 2; j++) {
        if (this.zoo_squares[i][j].reachable) {
          if (this.zoo_squares[i][j].e_edge == false && this.zoo_squares[i+1][j].w_edge == false) { // both should always be true or false anyway
            potential_ferris_tiles.push([i,j]);
          }
        }
      }
    }

    if (potential_ferris_tiles.length > 0) {
      shuffleArray(potential_ferris_tiles);
      this.special_ferris_tile = potential_ferris_tiles[0];
    }
  }


  // next, choose a special cafe tile, and hold that out too.
  this.special_cafe_tile = null;
  if (this.zoo_size >= 6) {
    let potential_cafe_tiles = [];
    for (let i = 1; i < this.zoo_size - 1; i++) {
      for (let j = 1; j < this.zoo_size - 1; j++) {
        if (this.zoo_squares[i][j].reachable && !this.isFerrisTile(i,j) && !this.isFerrisTile(i-1,j)
          && this.zoo_squares[i][j].s_edge == true) { // put the cafe somewhere where there's a road below it.
          potential_cafe_tiles.push([i,j]);
        }
      }
    }

    if (potential_cafe_tiles.length > 0) {
      shuffleArray(potential_cafe_tiles);
      this.special_cafe_tile = potential_cafe_tiles[0];
    } else {
      console.log("ALERT: NO SPACE TO PUT THE CAFE!");
    }
  }

  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {

      if (this.zoo_squares[i][j].reachable && !this.isCafeTile(i,j)
        && !this.isFerrisTile(i,j) && !this.isFerrisTile(i-1,j)) {

        let polygon = [];

        let no_north_neighbor = (j <= 0 || this.zoo_squares[i][j-1].group != this.zoo_squares[i][j].group || !this.zoo_squares[i][j-1].reachable);
        let no_south_neighbor = (j >= this.zoo_size - 1 || this.zoo_squares[i][j+1].group != this.zoo_squares[i][j].group || !this.zoo_squares[i][j+1].reachable);
        let no_west_neighbor = (i <= 0 || this.zoo_squares[i-1][j].group != this.zoo_squares[i][j].group || !this.zoo_squares[i-1][j].reachable);
        let no_east_neighbor = (i >= this.zoo_size - 1 || this.zoo_squares[i+1][j].group != this.zoo_squares[i][j].group || !this.zoo_squares[i+1][j].reachable);

        // northwest corner
        let nw_vertex = this.zoo_vertices[i][j];
        if (nw_vertex.s_path || nw_vertex.n_path || nw_vertex.e_path || nw_vertex.w_path) {
          // pre corner
          if (nw_vertex.s_path == false) {
            polygon.push(nw_vertex.halo.s);
            if (no_north_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
          }
          
          // corner
          polygon.push(nw_vertex.halo.se);
          if (no_north_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
          
          // post corner
          if (nw_vertex.e_path == false) {
            polygon.push(nw_vertex.halo.e);
            if (no_north_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
          }
        } else {
          polygon.push(nw_vertex.vertex);
          if (no_north_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
        }

        // halfsies for the hybrid lands
        polygon.push([square_width * i + square_width / 2 - 50 * Math.random(), polygon[polygon.length - 1][1]]);

        // northeast corner
        let ne_vertex = this.zoo_vertices[i+1][j];
        if (ne_vertex.s_path || ne_vertex.n_path || ne_vertex.e_path || ne_vertex.w_path) {
          // pre corner
          if (ne_vertex.w_path == false) {
            polygon.push(ne_vertex.halo.w);
            if (no_north_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");
          }
          
          // corner
          polygon.push(ne_vertex.halo.sw)
          if (no_north_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");

          // post corner
          if (ne_vertex.s_path == false) {
            polygon.push(ne_vertex.halo.s);
            if (no_north_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");
          }
        } else {
          polygon.push(ne_vertex.vertex);
          if (no_north_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");
        }

        // southeast corner
        let se_vertex = this.zoo_vertices[i+1][j+1];
        if (se_vertex.s_path || se_vertex.n_path || se_vertex.e_path || se_vertex.w_path) {
          // pre corner
          if (se_vertex.n_path == false) {
            polygon.push(se_vertex.halo.n);
            if (no_south_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");
          }
          
          // corner
          polygon.push(se_vertex.halo.nw);
          if (no_south_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");
          
          // post corner
          if (se_vertex.w_path == false) {
            polygon.push(se_vertex.halo.w);
            if (no_south_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");
          }
        } else {
          polygon.push(se_vertex.vertex);
          if (no_south_neighbor && no_east_neighbor) polygon[polygon.length - 1].push("s");
        }

        // halfsies for the hybrid lands
        polygon.push([square_width * i + square_width / 2 - 50 * Math.random(), polygon[polygon.length - 1][1]]);
        
        // southwest corner
        let sw_vertex = this.zoo_vertices[i][j+1];
        if (sw_vertex.s_path || sw_vertex.n_path || sw_vertex.e_path || sw_vertex.w_path) {
          // pre corner
          if (sw_vertex.e_path == false) {
            polygon.push(sw_vertex.halo.e);
            if (no_south_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
          }
          
          // corner
          polygon.push(sw_vertex.halo.ne);
          if (no_south_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
          
          // post corner
          if (sw_vertex.n_path == false) {
            polygon.push(sw_vertex.halo.n);
            if (no_south_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
          }
        } else {
          polygon.push(sw_vertex.vertex);
          if (no_south_neighbor && no_west_neighbor) polygon[polygon.length - 1].push("s");
        }

        let s_count = 0;
        for (let m = 0; m < polygon.length; m++) {
          let point = polygon[m];
          if (polygon[m].length > 2 && polygon[m][2] == "s") {
            s_count += 1;
          }
        }

        // Now do smoothing on any corner with an "s" in it.
        polygon = specialSmoothPolygon(polygon, 0.7, function(x) {return (x.length > 2 && x[2] == "s")});

        // Now remove points that are too close to each other and add points
        // when they're too far
        for(let c = 0; c < 2; c++) {
          polygon = evenPolygon(polygon, 60, 180);
        }

        // Now check the north neighbor and find and copy the common boundary.
        // Note: if you end up doing the western border, do it a little differently
        // BECAUSE THE WESTERN BORDER STARTS WITH A POINT OF CONTACT.
        let northern_border = [];
        if (j > 0 && this.zoo_squares[i][j].n_edge == false
          && this.zoo_squares[i][j - 1].pen != null
          && this.zoo_squares[i][j - 1].pen.special == null) {
          let points_of_contact = [];

          let neighbor_polygon = this.zoo_squares[i][j - 1].pen.polygon;

          for (let m = 0; m < polygon.length; m++) {
            let point = polygon[m];
            for (let n = 0; n < neighbor_polygon.length; n++) {
              let neighbor_point = neighbor_polygon[n];
              if (distance(point[0], point[1], neighbor_point[0], neighbor_point[1]) < 1) {
                points_of_contact.push([point, m, n]);
              }
            }
          }

          if (points_of_contact.length >= 2) {
            let replaced_polygon = [];
            let m1 = points_of_contact[0][1];
            let m2 = points_of_contact[1][1];
            let n1 = points_of_contact[0][2];
            let n2 = points_of_contact[1][2];
            for (let p = 0; p < m1; p++) {
              replaced_polygon.push(polygon[p]);
            }
            for (let p = n1; p > n2; p--) {
              replaced_polygon.push(neighbor_polygon[p]);
              northern_border.push(neighbor_polygon[p]);
            }
            northern_border.push(polygon[m2]);
            for (let p = m2; p < polygon.length; p++) {
              replaced_polygon.push(polygon[p]);
            }

            polygon = replaced_polygon;
          }
        }

        this.zoo_pens.push({
          use: false,
          outer: false,
          polygon: polygon,
          polygon_flat: polygon.flat(),
          inner_polygon: [],
          cx: square_width * i + square_width / 2,
          cy: square_width * j + square_width / 2,
          animal: null,
          special: null,
          land: "grass",
          northern_border: northern_border,
          //western_border: western_border,
          decoration_objects: [],
          land_object: null,
          special_object: null,
          animal_objects: null,
          state: "ungrey",
          square_numbers: [i,j],
          location: this.zoo_squares[i][j],
        });
        this.zoo_squares[i][j].pen = this.zoo_pens[this.zoo_pens.length - 1];
      } else if (this.zoo_squares[i][j].reachable && this.isFerrisTile(i,j)) {
        let polygon = [];
        let center_x = square_width * (i + 1);
        let center_y = square_width * j + square_width / 2;
        // polygon.push(this.zoo_vertices[i][j].halo.se);
        // polygon.push(this.zoo_vertices[i+1][j].halo.s);
        // polygon.push(this.zoo_vertices[i+2][j].halo.sw);
        // polygon.push(this.zoo_vertices[i+2][j+1].halo.nw);
        // polygon.push(this.zoo_vertices[i+1][j+1].halo.n);
        // polygon.push(this.zoo_vertices[i][j+1].halo.ne);
        // polygon.push(this.zoo_vertices[i][j].halo.se);
        polygon.push([center_x + 600, center_y + 160]);
        polygon.push([center_x - 600, center_y + 160]);
        polygon.push([center_x - 540, center_y + 160 - 60]);
        polygon.push([center_x - 480, center_y + 160 - 120]);
        polygon.push([center_x + 480, center_y + 160 - 120]);
        polygon.push([center_x + 540, center_y + 160 - 60]);
        polygon.push([center_x + 600, center_y + 160]);

        this.zoo_pens.push({
          use: false,
          outer: false,
          polygon: polygon,
          polygon_flat: polygon.flat(),
          cx: center_x,
          cy: center_y,
          animal: null,
          special: "FERRIS_WHEEL",
          land: "grass",
          decoration_objects: [],
          land_object: null,
          animal_objects: null,
          state: "ungrey",
          inner_polygon: null,
          square_numbers: [i,j],
          location: this.zoo_squares[i][j],
        });
        this.zoo_squares[i][j].pen = this.zoo_pens[this.zoo_pens.length - 1];
      } else if (this.zoo_squares[i][j].reachable && this.isCafeTile(i,j)) {
        let polygon = [];
        let center_x = square_width * i + square_width / 2;
        let center_y = square_width * (j + 1) - 186; // 100 pixels of path, 86 pixels of space until the cafe door.
        polygon.push([center_x + 300, center_y + 50]); // the bottom is 50 pixels from the door
        polygon.push([center_x + 80, center_y + 50]); // the next four vertices define an indentation for the door
        polygon.push([center_x + 80, center_y - 55]);
        polygon.push([center_x - 80, center_y - 55]);
        polygon.push([center_x - 80, center_y + 50]);
        polygon.push([center_x - 300, center_y + 50]); // now we're back to the proper exterior
        polygon.push([center_x - 300, center_y - 630]); // the top is 630 from the door, with a bit allowed for the player to walk partially out of view behind the building.
        polygon.push([center_x + 300, center_y - 630]);
        polygon.push([center_x + 300, center_y + 50]);

        let grey_polygon = []; // we also define a simpler polygon for when the object is grey.
        grey_polygon.push([center_x + 300, center_y + 50]);
        grey_polygon.push([center_x - 300, center_y + 50]);
        grey_polygon.push([center_x - 300, center_y - 630]);
        grey_polygon.push([center_x + 300, center_y - 630]);
        grey_polygon.push([center_x + 300, center_y + 50]);

        this.zoo_pens.push({
          use: false,
          outer: false,
          polygon: grey_polygon,
          ungrey_polygon: polygon,
          grey_polygon: grey_polygon,
          polygon_flat: polygon.flat(),
          cx: center_x,
          cy: center_y,
          animal: null,
          special: "CAFE",
          land: "grass",
          decoration_objects: [],
          land_object: null,
          animal_objects: null,
          state: "ungrey",
          inner_polygon: null,
          square_numbers: [i,j],
          location: this.zoo_squares[i][j],
        });
        this.zoo_squares[i][j].pen = this.zoo_pens[this.zoo_pens.length - 1];
      }
    }
  }

  shuffleArray(this.zoo_pens);
}


Game.prototype.designatePens = function() {
  console.log("There are " + this.zoo_pens.length + " pens.");

  // There are currently three zoo sections.
  // Choose a random angle, and divide the cells into three sections
  // as though they are slices of a pie centered on the center of the zoo.
  // Then assign animals by section.
  let section_dividing_angle = 360 * Math.random();

  let center_x = square_width * this.zoo_size / 2;
  let center_y = square_width * this.zoo_size / 2;

  shuffleArray(section);

  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      let x = square_width * (i + 0.5);
      let y = square_width * (j + 0.5);
      let relative_angle = (Math.atan2(y - center_y, x - center_x) * 180 / Math.PI - section_dividing_angle + 720) % 360;

      if (relative_angle >= 0 && relative_angle < 120) {
        this.zoo_squares[i][j].section = section[0]
      } else if (relative_angle >= 120 && relative_angle < 240) {
        this.zoo_squares[i][j].section = section[1]
      } else if (relative_angle >= 240 && relative_angle < 360) {
        this.zoo_squares[i][j].section = section[2]
      } 
      
      let group = this.zoo_squares[i][j].group;
    }
  }

  for(let k = 0; k < section.length; k++) {
    shuffleArray(section[k]);
  }
  
  for (let i = 0; i < this.zoo_pens.length; i++) {
    let pen = this.zoo_pens[i];
    if (pen.special == null) {
      let s = pen.location.section;

      if (s != null && s.length > 0) {
        new_animal = s.pop();
        // new_animal = "ORANGUTAN";
        // new_animal = "BROWN_BEAR";
        new_animal = "POLAR_BEAR";
        // new_animal = "SWAN";
        // new_animal = "COW";
        // new_animal = "OTTER";
        // new_animal = "MEERKAT";
        pen.animal = new_animal;
        pen.land = animals[new_animal].land;
        pen.pond_choice = animals[new_animal].pond;
        pen.terrace_choice = animals[new_animal].terrace;

        // if (pen.land == "water") {
        //   pen.inner_polygon = shrinkPolygon(pen.polygon, pen.cx, pen.cy, 0.92);
        // }
      }
    }
  }
}


Game.prototype.getPenByAnimal = function(animal) {
  for (let i = 0; i < this.zoo_pens.length; i++) {
    if (this.zoo_pens[i].animal == animal) return this.zoo_pens[i];
  }
  return null;
}


// Spend a few iterations swapping zoo pens to try to increase the number of neighbors with the same terrain.
Game.prototype.swapPens = function() {
  this.countLikeNeighbors();

  let swaps_considered = 0;
  let swaps_performed = 0;
  for (let k = 0; k < 500; k++) {
    let i1 = Math.floor(Math.random() * this.zoo_size);
    let j1 = Math.floor(Math.random() * this.zoo_size);
    let i2 = Math.floor(Math.random() * this.zoo_size);
    let j2 = Math.floor(Math.random() * this.zoo_size);

    if (i1 != i2 || j1 != j2) {
      if (this.zoo_squares[i1][j1].pen != null &&
        this.zoo_squares[i1][j1].pen.special == null
        && this.zoo_squares[i1][j1].pen.animal != null
        && this.zoo_squares[i2][j2].pen != null &&
        this.zoo_squares[i2][j2].pen.special == null
        && this.zoo_squares[i2][j2].pen.animal != null
        && this.zoo_squares[i1][j1].pen.location.section == this.zoo_squares[i2][j2].pen.location.section) {
        swaps_considered +=1;

        let land1 = this.zoo_squares[i1][j1].pen.land;
        let land2 = this.zoo_squares[i2][j2].pen.land;

        let stack_1 = 0;
        if (this.neighborLand(i1,j1,"n") == land1) stack_1 += 1;
        if (this.neighborLand(i1,j1,"s") == land1) stack_1 += 1;
        if (this.neighborLand(i1,j1,"e") == land1) stack_1 += 1;
        if (this.neighborLand(i1,j1,"w") == land1) stack_1 += 1;
        if (this.neighborLand(i2,j2,"n") == land2) stack_1 += 1;
        if (this.neighborLand(i2,j2,"s") == land2) stack_1 += 1;
        if (this.neighborLand(i2,j2,"e") == land2) stack_1 += 1;
        if (this.neighborLand(i2,j2,"w") == land2) stack_1 += 1;

        let stack_2 = 0;
        if (this.neighborLand(i1,j1,"n") == land2) stack_2 += 1;
        if (this.neighborLand(i1,j1,"s") == land2) stack_2 += 1;
        if (this.neighborLand(i1,j1,"e") == land2) stack_2 += 1;
        if (this.neighborLand(i1,j1,"w") == land2) stack_2 += 1;
        if (this.neighborLand(i2,j2,"n") == land1) stack_2 += 1;
        if (this.neighborLand(i2,j2,"s") == land1) stack_2 += 1;
        if (this.neighborLand(i2,j2,"e") == land1) stack_2 += 1;
        if (this.neighborLand(i2,j2,"w") == land1) stack_2 += 1;

        if (stack_2 > stack_1) {
          let temp_1 = this.zoo_squares[i1][j1].pen.animal;
          this.zoo_squares[i1][j1].pen.animal = this.zoo_squares[i2][j2].pen.animal;
          this.zoo_squares[i2][j2].pen.animal = temp_1;

          let temp_2 = this.zoo_squares[i1][j1].pen.land;
          this.zoo_squares[i1][j1].pen.land = this.zoo_squares[i2][j2].pen.land;
          this.zoo_squares[i2][j2].pen.land = temp_2;

          let temp_3 = this.zoo_squares[i1][j1].pen.pond_choice;
          this.zoo_squares[i1][j1].pen.pond_choice = this.zoo_squares[i2][j2].pen.pond_choice;
          this.zoo_squares[i2][j2].pen.pond_choice = temp_3;

          let temp_4 = this.zoo_squares[i1][j1].pen.terrace_choice;
          this.zoo_squares[i1][j1].pen.terrace_choice = this.zoo_squares[i2][j2].pen.terrace_choice;
          this.zoo_squares[i2][j2].pen.terrace_choice = temp_4;

          swaps_performed += 1;
        }
      }
    }
  }
  console.log("Swaps considered: " + swaps_considered);
  console.log("Swaps performed: " + swaps_performed);

  this.countLikeNeighbors();
}


// count how many shared lands there are.
// for now, this does not count half lands (eg water neighboring watergrass)
Game.prototype.countLikeNeighbors = function() {
  let neighbor_count = 0;
  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      if (this.zoo_squares[i][j].pen != null
          && this.zoo_squares[i][j].pen.special == null) {

        let land = this.zoo_squares[i][j].pen.land;

        // north
        if (this.neighborLand(i,j,"n") == land) neighbor_count += 1;

        // south
        if (this.neighborLand(i,j,"s") == land) neighbor_count += 1;

        // east
        if (this.neighborLand(i,j,"e") == land) neighbor_count += 1;

        // west
        if (this.neighborLand(i,j,"w") == land) neighbor_count += 1;
      }
    }
  }

  console.log("There are " + neighbor_count + " neighboring land borders.");
}


Game.prototype.neighborLand = function(i, j, direction) {
  if (direction == "n") {
    // north
    if (i > 0 && this.zoo_squares[i-1][j].pen != null
      && this.zoo_squares[i-1][j].pen.special == null) {
      return this.zoo_squares[i-1][j].pen.land;
    }
  } else if (direction == "s") {
    // south
    if (i < this.zoo_size - 1 && this.zoo_squares[i+1][j].pen != null
      && this.zoo_squares[i+1][j].pen.special == null) {
      return this.zoo_squares[i+1][j].pen.land;
    }
  } else if (direction == "w") {
    // west
    if (j > 0 && this.zoo_squares[i][j-1].pen != null
      && this.zoo_squares[i][j-1].pen.special == null) {
      return this.zoo_squares[i][j-1].pen.land;
    }
  } else if (direction == "e") {
    // east
    if (j < this.zoo_size - 1 && this.zoo_squares[i][j+1].pen != null
      && this.zoo_squares[i][j+1].pen.special == null) {
      return this.zoo_squares[i][j+1].pen.land;
    }
  }

  return null;
}


Game.prototype.prepPondsAndTerraces = function() {

  for (let i = 0; i < this.zoo_pens.length; i++) {
    let pen = this.zoo_pens[i];
    let dividing_angle = null;

    if (pen.land != null && pen.special == null && pen.animal != null) {

      if (pen.land == "water") {
        pen.inner_polygon = shrinkPolygon(pen.polygon, pen.cx, pen.cy, 0.92);
      }

      if (pen.pond_choice != false) {

        let choice = pen.pond_choice;
        if (pen.pond_choice == "any") {
          if (Math.random() < 0.5) {
            choice = "large";
          } else {
            choice = "small";
          }
        }
        
        if (choice == "large") {
          // a large pond is built by slicing the pen at an angle, making
          // a polygon out of all the pen points on one side of the angle,
          // and shrinking that polygon slightly away from the edges.
          let new_pond = [];
          
          let angle = Math.random() * 180;
          // If there's a terrace, the pond must be roughly the lower half.
          if (pen.terrace_choice != false) {
            angle = 180 - Math.random() * 20;
            dividing_angle = angle;
            //if (angle > 20) angle = 200 - angle;
          }
          for (let j = 0; j < pen.polygon.length - 1; j++) {
            let point = pen.polygon[j];
            let point_angle = Math.atan2(point[1] - pen.cy, point[0] - pen.cx) * 180/Math.PI;
            if (point_angle >= angle - 200 && point_angle <= angle + 20) {

              new_pond.push([point[0], point[1]]);
            }
          }

          let last_point = new_pond[new_pond.length - 1]
          let first_point = new_pond[0]
          let mid_point = blendPoints([[pen.cx, pen.cy], last_point, first_point], [0.3, 0.35, 0.35]);

          new_pond.push(mid_point)
          new_pond.push(first_point); // duplicate the last point
          new_pond = evenPolygon(new_pond, 60, 180);
          new_pond = shrinkPolygon(new_pond, pen.cx, pen.cy, 0.85);


          pen.pond = new_pond;
        } else if (choice == "small") {
          // a small pond is built by finding a point a random angle and distance from the center,
          // then making a wonky circle around the point, keeping all points that are inside the pen,
          // then shrinking this wonky circle a bit.

          let angle = Math.random() * 180;
          let distance = 100 + Math.random() * 100;
          let pond_x = pen.cx + distance * Math.cos(angle * Math.PI / 180);
          let pond_y = pen.cy + distance * Math.sin(angle * Math.PI / 180);
          // If there's a terrace, only put the pond center in the lower half of the pen.
          if (pen.terrace_choice != false) {
            pond_y = pen.cy + Math.abs(distance * Math.sin(angle * Math.PI / 180));
          }

          let new_pond = [];
          for (let j = 0; j < 360; j+= 25 + Math.random() * 10) {
            let point_x = pond_x + (100 + Math.random() * 40) * Math.cos(j * Math.PI / 180);
            let point_y = pond_y + (80 + Math.random() * 30) * Math.sin(j * Math.PI / 180);
            if (pointInsidePolygon([point_x, point_y], pen.polygon)) {
              new_pond.push([point_x, point_y]);
            }
          }

          if (new_pond.length > 0) {
            new_pond = evenPolygon(new_pond, 40, 180);
            new_pond = shrinkPolygon(new_pond, pond_x, pond_y, 0.95);
            new_pond.push([new_pond[0][0], new_pond[0][1]]);

            pen.pond = new_pond;
          }
          
        }
      }

      if (pen.terrace_choice != false) {
        let new_terrace = [];
        let angle = dividing_angle;
        if (dividing_angle == null) {
          angle = 180 - Math.random() * 20;
          dividing_angle = angle;
        }

        for (let j = 0; j < pen.polygon.length - 1; j++) {
          let point = pen.polygon[j];
          let point_angle = Math.atan2(point[1] - pen.cy, point[0] - pen.cx) * 180/Math.PI;
          if (point_angle <= angle - 200 || point_angle >= angle + 20) {
            new_terrace.push([point[0], point[1]]);
          }
        }

        // if there's no pond, drop all the bottoms by 100.
        //if (pen.pond == null) {
          for (let j = 0; j < new_terrace.length; j++) {
            let t = new_terrace[j];
            if (pointInsidePolygon([t[0], t[1] - 10], new_terrace)) {
              t[1] += 100;
            }
          }
        //}

        for (let j = 0; j < new_terrace.length; j++) {
          let t = new_terrace[j];
          nTries(
            function() {
              t[0] = pen.cx + (t[0] - pen.cx) * 0.9;
              t[1] = (pen.cy - 50) + (t[1] - (pen.cy - 50)) * 0.9;
            }, function() {
              return !pointInsidePolygon([t[0], t[1]], pen.polygon) 
                || (pen.pond != null && pointInsidePolygon([t[0], t[1]], pen.pond));
            }, 20
          );
          // while(!pointInsidePolygon([t[0], t[1]], pen.polygon)
          //   || (pen.pond != null && pointInsidePolygon([t[0], t[1]], pen.pond))) {
          //   t[0] = pen.cx + (t[0] - pen.cx) * 0.9;
          //   t[1] = (pen.cy - 50) + (t[1] - (pen.cy - 50)) * 0.9;
          // }
        }

        new_terrace.push([new_terrace[0][0], new_terrace[0][1]]);
        new_terrace = evenPolygon(new_terrace, 60, 130);
        new_terrace = smoothPolygon(new_terrace, 0.5);
        new_terrace = shrinkPolygon(new_terrace, pen.cx, pen.cy, 0.9);

        // jitter
        for (let j = 0; j < new_terrace.length; j++) {
          let t = new_terrace[j];
          t[1] = t[1] - 10 + Math.random() * 20;
        }

        // drop the bottoms if they can be dropped without crossing the pond or pen boundaries
        for (let j = 0; j < new_terrace.length; j++) {
          let t = new_terrace[j];
          if (pointInsidePolygon([t[0], t[1] - 10], new_terrace)
            && pointInsidePolygon([t[0], t[1] + 60], pen.polygon) 
            && (pen.pond == null || !pointInsidePolygon([t[0], t[1] + 60], pen.pond) )) {
            t[1] += 30;
          }
        }


        pen.terrace = [new_terrace];

        let iterations = Math.ceil(Math.random() * 3);
        for (let m = 0; m < iterations; m++) {
          let last_terrace = pen.terrace[pen.terrace.length - 1];
          top_point = null;
          for (let j = 0; j < last_terrace.length; j++) {
            if (top_point == null || last_terrace[j][1] < top_point[1]) {
              top_point = [last_terrace[j][0], last_terrace[j][1]];
            }
          }
          let new_terrace = shrinkPolygon(last_terrace, top_point[0], top_point[1] + 10, 0.6 + Math.random() * 0.25);
          let fixed_terrace = [];
          for (let j = 0; j < new_terrace.length; j++) {
            new_terrace[j][1] = new_terrace[j][1] - 10 + Math.random() * 20;
            if (pointInsidePolygon([new_terrace[j][0], new_terrace[j][1]], last_terrace)) {
              fixed_terrace.push([new_terrace[j][0], new_terrace[j][1]]);
            }
          }
          if (fixed_terrace.length > 0) {
            fixed_terrace = evenPolygon(fixed_terrace, 60, 130);
            fixed_terrace = smoothPolygon(fixed_terrace, 0.5);
            pen.terrace.push(fixed_terrace);
          }
        }
      }
    }
  }
}


// populate zoo
Game.prototype.addAnimalsAndDecorations = function() {

  this.animals_obtained = 0;
  this.animals_available = 0;

  let sheet = PIXI.Loader.shared.resources["Art/Decorations/trees.json"].spritesheet;

  for (let i = 0; i < this.zoo_pens.length; i++) {
    let pen = this.zoo_pens[i];
    let corner_x = pen.cx - square_width / 2;
    let corner_y = pen.cy - square_width / 2;

    if (pen.special == null) {
      let land = pen.land;
      let info = landDecorations[land];
      let polygon = pen.polygon;
      let prior_decorations = [];
      if (land == "water") polygon = pen.inner_polygon;

      for (let c = 0; c < info.count; c++) {
        if (Math.random() < info.probability) {
          let decoration_type = pick(info.objects);
          let in_pond = false;

          let valid = true;
          let x = 0;
          let y = 0;
          // Take ten tries to find a position for the decoration,
          // requiring it to be well inside the main pen polygon,
          // well outside the pond polygon, or well inside,
          // well outside the terraces, and far away from the
          // center feeding area.
          nTries(
            function() { // choose a point
              x = corner_x + 100 + Math.floor(Math.random() * (square_width - 100));
              y = corner_y + 100 + Math.floor(Math.random() * (square_width - 100));
            }, 
            function() { // perform validations
              let margin = 50;
              valid = true;

              if (distance(x, y, pen.cx, pen.cy) < 150) valid = false;

              for (let k = 0; k < prior_decorations.length; k++) {
                if (distance(x, y, prior_decorations[k].x, prior_decorations[k].y) < 70) valid = false;
              }

              if (valid == true) {
                for (let k = 0; k < 8; k++) {
                  check_x = x + margin * Math.cos(2 * Math.PI * k / 8);
                  check_y = y + margin * Math.sin(2 * Math.PI * k / 8);
                
                  if (!pointInsidePolygon([check_x, check_y], polygon)) {
                    valid = false;
                    break;
                  }

                  if (pen.terrace != null && pen.terrace.length > 0) {
                    if (pointInsidePolygon([check_x, check_y], pen.terrace[0])) {
                      valid = false;
                      break;
                    }
                  }
                }
              }

              all_inside = true;
              all_outside = true;
              if (valid == true && pen.pond != null) {
                for (let k = 0; k < 8; k++) {
                  check_x = x + margin * Math.cos(2 * Math.PI * i / 8);
                  check_y = y + margin * Math.sin(2 * Math.PI * i / 8);
              
                  if (!pointInsidePolygon([check_x, check_y], pen.pond)) all_inside = false;
                  if (pointInsidePolygon([check_x, check_y], pen.pond)) all_outside = false;
                }
              }
              if (!all_inside && !all_outside) valid = false;
              if (pen.pond != null && decoration_type == "tree" && all_inside) valid = false; // no trees in ponds!
              if (pen.pond == null || all_inside == false) {
                in_pond = false;
              } else {
                in_pond = true;
              }

              return !valid;
            }, 10
          );

          if (valid) {
            decoration = new PIXI.Container();
            decoration.type = decoration_type;
            decoration.position.set(x, y);

            if (decoration_type == "tree") {
              decoration.scale.set(1.2, 1.2);
              decoration.tree_number = Math.ceil(Math.random() * 3)
              let shadow = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/tree_shadow.png"));
              shadow.anchor.set(0.5, 0.5);
              shadow.position.set(0,25);
              decoration.addChild(shadow);
              let tree_sprite = new PIXI.AnimatedSprite(sheet.animations["tree_v4"]);
              tree_sprite.gotoAndStop(decoration.tree_number - 1);
              tree_sprite.anchor.set(0.5, 0.85);
              decoration.addChild(tree_sprite);
              this.shakers.push(decoration);
            } else if (decoration_type == "brown_rock" || decoration_type == "grey_rock") {
              let sprite_name = "brown_rock";
              if (decoration_type == "grey_rock") sprite_name = "grey_rock";
              if (!in_pond && land == "grass") sprite_name += "_grass";
              if (!in_pond && land == "forest") sprite_name += "_forest";
              if (in_pond || land == "water") sprite_name += "_water";
              sprite_name += "_" + Math.ceil(Math.random() * 3);

              rock_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/" + sprite_name + ".png"));
              rock_sprite.scale.set(0.85, 0.85);
              rock_sprite.anchor.set(0.5, 0.5);

              if (in_pond) rock_sprite.position.set(0,30); // put it down into the pond, and deeper than normal to account for the way the rock is sunk.
              decoration.addChild(rock_sprite);
            }


            this.decorations.push(decoration);
            pen.decoration_objects.push(decoration);
            prior_decorations.push(decoration);
          }
        }
      }
    }


    if (false && pen.decorations != null) {
      let decoration_number = 5;
      // if (pen.animal != null && animals[pen.animal].movement == "arboreal") {
      //   decoration_number = 10;
      // }
      if (pen.land == "forest") decoration_number = 10;
      for (let t = 0; t < decoration_number; t++) {
        if (Math.random() > 0.3) {
          let decoration_type = pick(pen.decorations);
          let decoration = null;

          if (decoration_type == "tree" || decoration_type == "rock") {
            if (decoration_type != "tree") {
              decoration = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/" + decoration_type + ".png"));

            }
            if (decoration_type == "tree") {
              decoration = new PIXI.Container();
              decoration.tree_number = Math.ceil(Math.random() * 3)
              let shadow = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/tree_shadow.png"));
              shadow.anchor.set(0.5, 0.5);
              shadow.position.set(0,25);
              decoration.addChild(shadow);
              let tree = new PIXI.AnimatedSprite(sheet.animations["tree_v4"]);
              tree.gotoAndStop(decoration.tree_number - 1);
              tree.anchor.set(0.5, 0.85);
              decoration.addChild(tree);
              this.shakers.push(decoration);
            }
            decoration.type = decoration_type;
            let edge = pick(pen.polygon);
            let fraction = 0.3 + 0.5 * Math.random();
            decoration.position.set(
              (1-fraction) * pen.cx + (fraction) * edge[0],
              (1-fraction) * pen.cy + (fraction) * edge[1]);
            if (decoration_type == "tree" && 
              pen.pond != null
              && pointInsidePolygon([decoration.position.x, decoration.position.y], pen.pond)) {
              // protect against putting trees in ponds.
            } else {
              // okay, it's cool, you can add it.
              if (decoration_type == "rock") {
                decoration.scale.set(0.75, 0.75);
                decoration.anchor.set(0.5, 0.5);
              } else {
                decoration.scale.set(1.2, 1.2);
                if (decoration_type != "tree") {
                  decoration.anchor.set(0.5,0.9);
                }
              }
             
              this.decorations.push(decoration);
              pen.decoration_objects.push(decoration);


            }
          }
          
        }
      }
    }

    if (pen.animal != null) {
      this.animals_available += 1;
      pen.animal_objects = [];
      let animal_name = pen.animal;

      let num_animals_here = animals[animal_name].min + Math.floor(Math.random() * (1 + animals[animal_name].max - animals[animal_name].min))

      for (let n = 0; n < num_animals_here; n++) {
        
        let x = pen.cx - 60 + 120 * Math.random();
        let y = pen.cy - 60 + 120 * Math.random();
        if (this.pointInPen(x, y) == pen) { // don't make animals outside the pen

          let animal = this.makeAnimal(animal_name, pen);
          animal.position.set(x, y);
          // animal.position.set(pen.cx, pen.cy);
          this.decorations.push(animal);
          pen.animal_objects.push(animal);
          this.animals.push(animal);
          this.shakers.push(animal);
          this.shakers.push(pen.land_object);
        }
      }
    }

    if (pen.special == "FERRIS_WHEEL") {
      this.ferris_wheel = this.makeFerrisWheel(pen);
      this.ferris_wheel.position.set(pen.cx, pen.cy + 180);
      this.decorations.push(this.ferris_wheel);
      pen.special_object = this.ferris_wheel;
    }

    if (pen.special == "CAFE") {
      this.cafe = this.makeCafeExterior(pen);
      this.cafe.position.set(pen.cx, pen.cy);
      this.decorations.push(this.cafe);
      pen.special_object = this.cafe;
    }  
  }

  // Add lots of trees just outside the perimeter.
  // But not a thousand trees.
  // Just a hundred trees. They move around with the player.
  // HA HA HA HA HA HA HA HA HA HA HA.
  this.ent_positions = [];
  for (let i = -1; i <= this.zoo_size; i++) {
    for (let j = -1; j <= this.zoo_size; j++) {
      if (i == -1 || j == -1 || i == this.zoo_size || j == this.zoo_size
        || (i >= 0 && j >= 0 && i < this.zoo_size && j < this.zoo_size && this.zoo_squares[i][j].reachable == false)) {
        for (let t = 0; t < 70; t++) {
          if (Math.random() > 0.4) {
            let x = square_width * i + square_width * Math.random();
            let y = square_width * j + square_width * Math.random();
            // let outside_all_pens = true;
            // for (let k = 0; k < this.zoo_pens.length; k++) {
            //   if (this.zoo_pens[k].animal_objects != null || this.zoo_pens[k].special_object != null) {
            //     if (pointInsidePolygon([x, y], this.zoo_pens[k].polygon)) {
            //       outside_all_pens = false;
            //       console.log("cancelled a tree");
            //       break;
            //     }
            //   }
            // }
            if (this.pointInPen(x, y) == null && distance(x, y, this.player.x, this.player.y) > 250) { // && distance(x, y, blobs)
              this.ent_positions.push([x,y, Math.ceil(Math.random() * 3)]);
            } else {
              // console.log("cancelled a tree, too close to player");
            }
          }
        }
      }
    }
  }
  
  this.ents = [];
  for (let k = 0; k < total_ents; k++) {

    let ent = new PIXI.Container();
    let shadow = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/tree_shadow.png"));
    shadow.anchor.set(0.5, 0.5);
    shadow.position.set(0,25);
    ent.addChild(shadow);
    let tree = new PIXI.AnimatedSprite(sheet.animations["tree_v4"]);
    tree.gotoAndStop(0);
    tree.anchor.set(0.5, 0.85);
    ent.addChild(tree);
    ent.tree = tree;

    // let ent = new PIXI.AnimatedSprite(sheet.animations["tree_v4"]);
    ent.position.set(0, 0);
    // ent.gotoAndStop(0);
    ent.visible = false;
    this.ents.push(ent);
    this.decorations.push(ent);
  }


  // Add a few trees around the edges of the pens
  let tree_lining_points = [];
  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].w_edge
        && !this.isCafeTile(i,j)) {
        for (let t = 0; t < 4; t++) {
          if (Math.random() > 0.4) {
            let x = square_width * i + 120 + 20 * Math.random();
            let y = square_width * j + 200 + (square_width - 400) * Math.random();
            if (this.pointInPen(x, y) == null) {
              tree_lining_points.push([x, y])
            }
          }
        }
      }
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].e_edge
        && !this.isCafeTile(i,j)) {
        for (let t = 0; t < 4; t++) {
          if (Math.random() > 0.4) {
            let x = square_width * i + square_width - 120 - 20 * Math.random();
            let y = square_width * j + 200 + (square_width - 400) * Math.random();
            if (this.pointInPen(x, y) == null) {
              tree_lining_points.push([x, y]);
            }
          }
        }
      }
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].n_edge) {
        for (let t = 0; t < 3; t++) {
          if (Math.random() > 0.3) {
            let x = square_width * i + 200 + (square_width - 400) * Math.random();
            let y = square_width * j + 120 + 20 * Math.random();
            if (this.pointInPen(x, y) == null) {
              tree_lining_points.push([x, y]);
            }
          }
        }
      }
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].s_edge
        && !this.isCafeTile(i,j)) {
        for (let t = 0; t < 3; t++) {
          if (Math.random() > 0.2) {
            let x = square_width * i + 200 + (square_width - 400) * Math.random();
            let y = square_width * j + square_width - 120 - 20 * Math.random();
            if (this.pointInPen(x, y) == null) {
              tree_lining_points.push([x, y]);
            }
          }
        }
      }
    }
  }

  for (let i = 0; i < tree_lining_points.length; i++) {
    let x = tree_lining_points[i][0];
    let y = tree_lining_points[i][1];

    let decoration = new PIXI.Container();
    decoration.type = "tree";
    decoration.tree_number = Math.ceil(Math.random() * 3)
    let shadow = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/tree_shadow.png"));
    shadow.anchor.set(0.5, 0.5);
    shadow.position.set(0,25);
    decoration.addChild(shadow);
    let tree = new PIXI.AnimatedSprite(sheet.animations["tree_v4"]);
    tree.gotoAndStop(decoration.tree_number - 1);
    tree.anchor.set(0.5, 0.85);
    decoration.addChild(tree);
    decoration.position.set(x, y);
    this.decorations.push(decoration);
  }

  this.updateAnimalCount();

  this.updateEnts();
}


Game.prototype.debugDrawMapGroups = function() {
  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      let group = this.zoo_squares[i][j].group;
      let color = this.group_colors[group];
      let cell = new PIXI.Graphics();
      cell.beginFill(color);
      let polygon = [
        square_width * i, square_width * j,
        square_width * i, square_width * (j+1),
        square_width * (i+1), square_width * (j+1),
        square_width * (i+1), square_width * j,
        square_width * i, square_width * j,
      ]
      cell.drawPolygon(polygon);
      cell.endFill();
      if (!this.zoo_squares[i][j].reachable) cell.alpha = 0.5;
      this.map.background_layer.addChild(cell);
    }
  }
}


Game.prototype.drawMap = function() {
  var self = this;
  var screen = this.screens["zoo"];

  // Map background
  // let background = new PIXI.Sprite(PIXI.Texture.from("Art/zoo_gradient.png"));
  // background.width = square_width * (this.zoo_size + 4);
  // background.height = square_width * (this.zoo_size + 4);
  // background.anchor.set(0, 0);
  // background.position.set(-2 * square_width, -2 * square_width);
  // this.map.background_layer.addChild(background);

  this.drawMapPath();

  for (let i = 0; i < this.zoo_pens.length; i++) {

    let pen = this.zoo_pens[i];

    pen.land_object = new PIXI.Container();
    pen.land_object.cx = pen.cx;
    pen.land_object.cy = pen.cy;

    let corner_x = pen.cx - square_width / 2;
    let corner_y = pen.cy - square_width / 2;

    let grid_i = pen.square_numbers[0];
    let grid_j = pen.square_numbers[1];

    if (pen.special == null) {
      if (pen.land == "magma") {
        var render_container = new PIXI.Container();

        let terrain_grid = [];
        for (let x = 0; x < square_width/100; x++) {
          terrain_grid[x] = [];
          for (let y = 0; y < square_width/100; y++) {
            terrain_grid[x][y] = 0;
          }
        }

        for (let x = 0; x < square_width/100; x++) {
          for (let y = 0; y < square_width/100; y++) {
            let points_inside = 0;
            for (r = 0; r < 30; r++) {
              let test_point = [corner_x + 100 * x + 100 * Math.random(), corner_y + 100 * y + 100 * Math.random()];
              if (pointInsidePolygon(test_point, pen.polygon)) {
                points_inside += 1;
              }
            }
            if (points_inside >= 18) terrain_grid[x][y] = 1;
          }
        }

        let grid_size = square_width/100;
        let tg = terrain_grid;
        for (let x = 0; x < grid_size; x++) {
          for (let y = 0; y < grid_size; y++) {
            let square = null;
            if (terrain_grid[x][y] == 1) {
              // center tile
              if (checkNeighbor(tg, x, y, "w", 1)
                && checkNeighbor(tg, x, y, "e", 1)
                && checkNeighbor(tg, x, y, "n", 1)
                && checkNeighbor(tg, x, y, "s", 1)) {
                square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_c_v1.png"));
              } 
              // north facing tile
              else if (checkNeighbor(tg, x, y, "w", 1)
                && checkNeighbor(tg, x, y, "e", 1)
                && !checkNeighbor(tg, x, y, "n", 1)) {
                if (grid_j > 0 && this.zoo_squares[grid_i][grid_j-1].pen != null &&
                  this.zoo_squares[grid_i][grid_j-1].pen.land == pen.land) {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_c_v1.png"));
                } else {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_n_v1.png"));
                }
              }
              // south facing tile
              else if (checkNeighbor(tg, x, y, "w", 1)
                && checkNeighbor(tg, x, y, "e", 1)
                && !checkNeighbor(tg, x, y, "s", 1)) {
                if (grid_j < this.zoo_size - 1 && this.zoo_squares[grid_i][grid_j+1].pen != null &&
                  this.zoo_squares[grid_i][grid_j+1].pen.land == pen.land) {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_c_v1.png"));
                } else {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_s_v1.png"));
                }
              }
              // west facing tile
              else if (checkNeighbor(tg, x, y, "n", 1)
                && checkNeighbor(tg, x, y, "s", 1)
                && !checkNeighbor(tg, x, y, "w", 1)) {
                if (grid_i > 0 && this.zoo_squares[grid_i-1][grid_j].pen != null &&
                  this.zoo_squares[grid_i-1][grid_j].pen.land == pen.land) {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_c_v1.png"));
                } else {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_w_v1.png"));
                }
              }
              // east facing tile
              else if (checkNeighbor(tg, x, y, "n", 1)
                && checkNeighbor(tg, x, y, "s", 1)
                && !checkNeighbor(tg, x, y, "e", 1)) {
                if (grid_i < this.zoo_size - 1 && this.zoo_squares[grid_i+1][grid_j].pen != null &&
                  this.zoo_squares[grid_i+1][grid_j].pen.land == pen.land) {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_c_v1.png"));
                } else {
                  square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_e_v1.png"));
                }
                
              }
              // northwest facing tile
              else if (!checkNeighbor(tg, x, y, "w", 1)
                && checkNeighbor(tg, x, y, "e", 1)
                && !checkNeighbor(tg, x, y, "n", 1)) {
                square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_nw_v1.png"));
              }
              // northeast facing tile
              else if (checkNeighbor(tg, x, y, "w", 1)
                && !checkNeighbor(tg, x, y, "e", 1)
                && !checkNeighbor(tg, x, y, "n", 1)) {
                square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_ne_v1.png"));
              }
              // southwest facing tile
              else if (!checkNeighbor(tg, x, y, "w", 1)
                && checkNeighbor(tg, x, y, "e", 1)
                && !checkNeighbor(tg, x, y, "s", 1)) {
                square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_sw_v1.png"));
              }
              // southeast facing tile
              else if (checkNeighbor(tg, x, y, "w", 1)
                && !checkNeighbor(tg, x, y, "e", 1)
                && !checkNeighbor(tg, x, y, "s", 1)) {
                square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_se_v1.png"));
              }


              if (square != null) {
                square.position.set(100 * x, 100 * y);
                render_container.addChild(square);
              }
              // let square = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_c_v1.png"));
              // square.position.set(100 * x, 100 * y);
              // square.scale.set(0.98, 0.98);
              // square.alpha = 0.4;
              // render_container.addChild(square);
            }
          }
        }

        // let nw = [200, 200, "nw"];
        // let ne = [600, 200, "ne"];
        // let sw = [200, 600, "sw"];
        // let se = [600, 600, "se"];

        // if (pen.location.e_edge == false) {
        //   ne = [800, 200, "n"];
        //   se = [800, 600, "s"];


        // }

        // if (pen.location.w_edge == false) {
        //   nw = [0, 200, "n"];
        //   sw = [0, 600, "s"];
        // }

        // if (pen.location.n_edge == false) {
        //   nw = [200, 0, "w"];
        //   ne = [600, 0, "e"];
        // }

        // if (pen.location.s_edge == false) {
        //   sw = [200, 800, "w"];
        //   se = [600, 800, "e"];
        // }

        // let top_left = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_" + nw[2] + "_v1.png"));
        // top_left.position.set(nw[0], nw[1]);
        // render_container.addChild(top_left);
        // let top_right = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_" + ne[2] + "_v1.png"));
        // top_right.position.set(ne[0], ne[1]);
        // render_container.addChild(top_right);
        // let bottom_left = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_" + sw[2] + "_v1.png"));
        // bottom_left.position.set(sw[0], sw[1]);
        // render_container.addChild(bottom_left);
        // let bottom_right = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/path_" + se[2] + "_v1.png"));
        // bottom_right.position.set(se[0], se[1]);
        // render_container.addChild(bottom_right);

        var terrain_texture = this.renderer.generateTexture(render_container,
        PIXI.SCALE_MODES.LINEAR,
        1,
        new PIXI.Rectangle(0, 0, 1024, 1024));

        var terrain_sprite = new PIXI.Sprite(terrain_texture);
        terrain_sprite.anchor.set(0, 0);
        terrain_sprite.position.set(corner_x, corner_y);
       
        if (pen.land == "grass") {
          terrain_sprite.true_color = grass_color;
        } else if (pen.land == "forest") {
          terrain_sprite.true_color = forest_color;
        }

        terrain_sprite.grey_color = 0xFFFFFF;
        terrain_sprite.tint = terrain_sprite.true_color;
        pen.land_object.addChild(terrain_sprite);

      } else {

        var render_container = new PIXI.Container();

        let polygon = pen.polygon;
        // if (pen.land == "water") {
        //   polygon = pen.inner_polygon;
        // }

        if (pen.land != "water") {

          //let flat_polygon = polygon.flat();
          let flat_polygon = [];
          for (let j = 0; j < polygon.length; j++) {
            flat_polygon.push(polygon[j][0] - corner_x);
            flat_polygon.push(polygon[j][1] - corner_y);
          }

          let ground = new PIXI.Graphics();
          ground.beginFill(0xFFFFFF);
          ground.drawPolygon(flat_polygon);
          ground.endFill();

          // ground.grey_color = 0xFFFFFF;

          if (pen.land == null || pen.land == "grass") {
            ground.tint = grass_color;
          } else if (pen.land == "water") {
            ground.tint = water_color;
          } else if (pen.land == "sand") {
            ground.tint = sand_color;
          } else if (pen.land == "forest") {
            ground.tint = forest_color;
          } else if (pen.land == "ice") {
            ground.tint = ice_color;
          } else if (pen.land == "rock") {
            ground.tint = rock_color;
          }

          render_container.addChild(ground);

          if (pen.land == "forest" || pen.land == "grass" || pen.land == "sand") {
            this.drawEdging(render_container, pen.land, null, corner_x, corner_y, polygon, true);
          }
        }

        if (pen.land == "ice" || pen.land == "rock") {
          this.drawRockEdging(render_container, pen.land, corner_x, corner_y, polygon);
        }

        if (pen.land == "water") {
          this.drawPond(render_container, pen.land, corner_x, corner_y, pen.inner_polygon);
        }

        if (pen.pond != null) {
          this.drawPond(render_container, pen.land, corner_x, corner_y, pen.pond);
        }

        if (pen.land == "grass" || pen.land == "forest") {
          this.dappleGround(render_container, pen.land, corner_x, corner_y, polygon, (pen.pond == null ? [] : [pen.pond]));
        }

        if (pen.land == "sand") {
          this.dappleGround(render_container, pen.land, corner_x, corner_y, polygon, (pen.pond == null ? [] : [pen.pond]), 1, true);
        }

        if (pen.land == "ice" || pen.land == "rock") {
          this.dappleGround(render_container, pen.land, corner_x, corner_y, polygon, (pen.pond == null ? [] : [pen.pond]), 1);
        }

        if (pen.terrace != null) {
          this.drawTerrace(pen, pen.land, corner_x, corner_y, pen.terrace, pen.terrace_choice, pen.pond)
        }

        // if (pen.pond != null && (pen.land == "ice" || pen.land == "rock")) {
        //   this.drawRockPond(render_container, pen.land, corner_x, corner_y, pen.pond);
        // }

        if (pen.land == "forest" || pen.land == "grass" || pen.land == "sand" || pen.land == "water") {
          this.drawFenceShadow(render_container, corner_x, corner_y, pen.polygon);
        }


        var terrain_texture = this.renderer.generateTexture(render_container,
          PIXI.SCALE_MODES.LINEAR, 1, new PIXI.Rectangle(-50, -50, 1024, 1024));

        var terrain_sprite = new PIXI.Sprite(terrain_texture);
        terrain_sprite.anchor.set(0, 0);
        terrain_sprite.position.set(corner_x - 50, corner_y - 50);

        pen.land_object.addChild(terrain_sprite);
      }

      this.drawFence(pen.polygon, corner_x, corner_y);
    }

    this.terrain.push(pen.land_object)
  }

  this.sortLayer(this.map.terrain_layer, this.terrain, true);
}


// TACO CHIP STYLE DAPPLES
// for (let x = 0; x < square_width/40; x++) {
//   for (let y = 0; y < square_width/40; y++) {
//     if (terrain_grid[x][y] == 1) {
//       let angle = (Math.random() * 360) * 180 / Math.PI;
//       let triangle = new PIXI.Graphics();
//       triangle.beginFill(0xFFFFFF);
//       triangle.drawPolygon([
//         30 * Math.cos(angle), 30 * Math.sin(angle),
//         30 * Math.cos(angle + 4 * Math.PI / 3), 30 * Math.sin(angle + 4 * Math.PI / 3),
//         30 * Math.cos(angle + 2 * Math.PI / 3), 30 * Math.sin(angle + 2 * Math.PI / 3),
//         30 * Math.cos(angle + 0), 30 * Math.sin(angle + 0),
//       ]);
//       triangle.endFill();

//       triangle.alpha = 0.1 + 0.2 * Math.random();

//       if (Math.random() < 0.5) {
//         triangle.tint = 0x000000;
//         triangle.alpha = 0.05 + 0.1 * Math.random();
//       }

      
//       // triangle.angle = Math.random() * 360;
//       let scale = 0.2 + 0.4 * Math.random();
//       triangle.scale.set(scale, scale * 0.75);
//       triangle.position.set(40 * x + 10 + Math.random() * 20, 40 * y + 10 + Math.random() * 20)

//       render_container.addChild(triangle);
//     }
//   }
// }


// Obviously, create beautiful ground texture effects for grass and forest land.
Game.prototype.dappleGround = function(render_container, land, corner_x, corner_y, polygon_yes, polygons_no, probability=0.15, conservative_borders=false) {
  let terrain_grid = [];
  for (let x = 0; x < square_width/40; x++) {
    terrain_grid[x] = [];
    for (let y = 0; y < square_width/40; y++) {
      terrain_grid[x][y] = 0;
    }
  }

  for (let x = 0; x < square_width/40; x++) {
    for (let y = 0; y < square_width/40; y++) {
      let points = [
        [corner_x + 40 * x, corner_y + 40 * y],
        [corner_x + 40 * (x+1), corner_y + 40 * y],
        [corner_x + 40 * (x+1), corner_y + 40 * (y+1)],
        [corner_x + 40 * x, corner_y + 40 * (y+1)],
      ]
      terrain_grid[x][y] = 1;
      for (let i = 0; i < points.length; i++) {
        if (!pointInsidePolygon(points[i], polygon_yes)) {
          terrain_grid[x][y] = 0;
          break;
        }
      }
      if (terrain_grid[x][y] == 1) {
        for (let i = 0; i < points.length; i++) {
          for (let j = 0; j < polygons_no.length; j++) {
            if (pointInsidePolygon(points[i], polygons_no[j])) {
              terrain_grid[x][y] = 0;
              break;
            }
          }
        }
      }
    }
  }

  // if conservative borders, switch off any grid point whose neighbors are off.
  if (conservative_borders) {
    for (let x = 0; x < square_width/40; x++) {
      for (let y = 0; y < square_width/40; y++) {
        if (x == 0 || terrain_grid[x-1][y] == 0) terrain_grid[x][y] = -1;
        if (x == terrain_grid.length - 1 || terrain_grid[x+1][y] == 0) terrain_grid[x][y] = -1;
        if (y == 0 || terrain_grid[x][y-1] == 0) terrain_grid[x][y] = -1;
        if (y == terrain_grid[x].length - 1 || terrain_grid[x][y+1] == 0) terrain_grid[x][y] = -1;
      }
    }
    for (let x = 0; x < square_width/40; x++) {
      for (let y = 0; y < square_width/40; y++) {
        if (terrain_grid[x][y] == -1) terrain_grid[x][y] = 0;
      }
    }
  }

  for (let x = 0; x < square_width/40; x++) {
    for (let y = 0; y < square_width/40; y++) {
      if (terrain_grid[x][y] == 1) {

        if (Math.random() < probability) {

          if (land == "grass" || land == "forest") {
            let doodad = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/light_round.png"));
            if (Math.random() < 0.4) {
              doodad = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/light_grass.png"));
            }

            doodad.alpha = 0.1 + 0.2 * Math.random();

            if (Math.random() < 0.5) {
              doodad.tint = 0x000000;
              doodad.alpha = 0.05 + 0.1 * Math.random();
            }

            let scale = 0.6 + 0.3 * Math.random();
            doodad.scale.set(scale, scale);
            doodad.position.set(40 * x + 10 + Math.random() * 20, 40 * y + 10 + Math.random() * 20)

            render_container.addChild(doodad);
          } else if (land == "sand") {
            if (Math.random() < 0.1) {
              let doodad = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/light_grass.png"));

              if (Math.random() < 0.5) {
                doodad.tint = forest_color;
              } else {
                doodad.tint = grass_color;
              }

              let scale = 0.6 + 0.3 * Math.random();
              doodad.scale.set(scale, scale);
              doodad.position.set(40 * x + 10 + Math.random() * 20, 40 * y + 10 + Math.random() * 20);
              render_container.addChild(doodad);
            } else {
              let swoop_polygon = [];
              let rise = -3 + 10 * Math.random();
              let y_val = Math.random() * 20;
              let distance = 6 + Math.floor(Math.random() * 7);

              let doodad = new PIXI.Graphics();
              doodad.beginFill(0xeda064);
              for (let i = 0; i <= distance; i++) {
                swoop_polygon.push(10 * i + 40 * x);
                swoop_polygon.push(y_val + 5 * Math.sin((i+2)/8 * 2 * Math.PI) - i/8 * rise + 40 * y + 20);
              }
              for (let i = distance - 1; i >= 0; i--) {
                swoop_polygon.push(10 * i + 40 * x);
                swoop_polygon.push(y_val + 5 * Math.sin((i+2)/8 * 2 * Math.PI) - i/8 * rise + 40 * y + 20 - 0.375*(i-distance/2)*(i-distance/2) + 6);
              }
              doodad.drawPolygon(swoop_polygon);
              doodad.endFill();

              doodad.alpha = 0.2 + 0.1 * Math.random();

              render_container.addChild(doodad);
            }
          // } else if (land == "rice") {
          //   let doodad = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/light_round.png"));

          //   //doodad.alpha = 0.05 + 0.1 * Math.random();

          //   let tint = 1 - (0.7 + 0.1 * Math.random());
          //   doodad.tint = PIXI.utils.rgb2hex([1 - tint, 1 - tint/2, 1 - tint/4]);
          //   doodad.alpha = 0.2 + 0.2 * Math.random();

          //   let scale = 0.2 + 0.15 * Math.random();
          //   doodad.scale.set(scale, scale);
          //   doodad.position.set(40 * x + 10 + Math.random() * 20, 40 * y + 10 + Math.random() * 20)

          //   render_container.addChild(doodad);
          // } 
          } else if (land == "ice" || land == "rock") {
            let angle = (Math.random() * 360) * 180 / Math.PI;
            let n_gon = new PIXI.Graphics();
            n_gon.beginFill(0xFFFFFF);
            let gon = [];
            let sides = 3 + Math.floor(Math.random() * 4);
            for (let k = 0; k < sides; k++) {
              gon.push(30 * Math.cos(angle + k * 2 * Math.PI / sides));
              gon.push(30 * Math.sin(angle + k * 2 * Math.PI / sides));
            }
            gon.push(30 * Math.cos(angle));
            gon.push(30 * Math.sin(angle));
            n_gon.drawPolygon(gon);
            n_gon.endFill();

            let tint = 1 - (0.7 + 0.1 * Math.random());
            if (land == "ice") {
              n_gon.tint = PIXI.utils.rgb2hex([1 - tint, 1 - tint/2, 1 - tint/4]);
              n_gon.alpha = 0.2 + 0.2 * Math.random();
              
            } else if (land == "rock") {
              n_gon.tint = PIXI.utils.rgb2hex([1 - tint, 1 - tint, 1 - tint]);
              n_gon.alpha = 0.3 + 0.4 * Math.random();
            }
            
            // n_gon.angle = Math.random() * 360;
            let scale = 0.2 + 0.2 * Math.random();
            n_gon.scale.set(scale, scale * 0.75);
            n_gon.position.set(40 * x + 10 + Math.random() * 20, 40 * y + 10 + Math.random() * 20)

            render_container.addChild(n_gon);
          }
        }
      }
    }
  }
}





// Duh, create a nice set of decorative effects for sand lands.
Game.prototype.sandTexture = function(render_container, corner_x, corner_y, polygon_yes, polygons_no, probability=1) {
  let terrain_grid = [];
  for (let x = 0; x < square_width/40; x++) {
    terrain_grid[x] = [];
    for (let y = 0; y < square_width/40; y++) {
      terrain_grid[x][y] = 0;
    }
  }

  for (let x = 0; x < square_width/40; x++) {
    for (let y = 0; y < square_width/40; y++) {
      let points = [
        [corner_x + 40 * x, corner_y + 40 * y],
        [corner_x + 40 * (x+1), corner_y + 40 * y],
        [corner_x + 40 * (x+1), corner_y + 40 * (y+1)],
        [corner_x + 40 * x, corner_y + 40 * (y+1)],
      ]
      terrain_grid[x][y] = 1;
      for (let i = 0; i < points.length; i++) {
        if (!pointInsidePolygon(points[i], polygon_yes)) {
          terrain_grid[x][y] = 0;
          break;
        }
      }
      if (terrain_grid[x][y] == 1) {
        for (let i = 0; i < points.length; i++) {
          for (let j = 0; j < polygons_no.length; j++) {
            if (pointInsidePolygon(points[i], polygons_no[j])) {
              terrain_grid[x][y] = 0;
              break;
            }
          }
        }
      }
    }
  }

  // conservative borders; switch off any grid point whose neighbors are off.
  //for (let i = 0; i < 2; i++) {
    for (let x = 0; x < square_width/40; x++) {
      for (let y = 0; y < square_width/40; y++) {
        if (x == 0 || terrain_grid[x-1][y] == 0) terrain_grid[x][y] = -1;
        if (x == terrain_grid.length - 1 || terrain_grid[x+1][y] == 0) terrain_grid[x][y] = -1;
        if (y == 0 || terrain_grid[x][y-1] == 0) terrain_grid[x][y] = -1;
        if (y == terrain_grid[x].length - 1 || terrain_grid[x][y+1] == 0) terrain_grid[x][y] = -1;
      }
    }
    for (let x = 0; x < square_width/40; x++) {
      for (let y = 0; y < square_width/40; y++) {
        if (terrain_grid[x][y] == -1) terrain_grid[x][y] = 0;
      }
    }
  //}

  for (let x = 0; x < square_width/40; x++) {
    for (let y = 0; y < square_width/40; y++) {
      if (terrain_grid[x][y] == 1) {

        if (Math.random() < probability) {

          let doodad = null;
          if (Math.random() < 0.1) {
            doodad = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/light_grass.png"));

            if (Math.random() < 0.5) {
              doodad.tint = forest_color;
            } else {
              doodad.tint = grass_color;
            }

            let scale = 0.6 + 0.3 * Math.random();
            doodad.scale.set(scale, scale);
            doodad.position.set(40 * x + 10 + Math.random() * 20, 40 * y + 10 + Math.random() * 20);
            render_container.addChild(doodad);
          } else {
            let doodad = new PIXI.Graphics();
            doodad.beginFill(0xeda064);

            let swoop_polygon = [];
            let rise = -3 + 10 * Math.random();
            let y_val = Math.random() * 20;
            let distance = 6 + Math.floor(Math.random() * 7);
            for (let i = 0; i <= distance; i++) {
              swoop_polygon.push(10 * i + 40 * x);
              swoop_polygon.push(y_val + 5 * Math.sin((i+2)/8 * 2 * Math.PI) - i/8 * rise + 40 * y + 20);
            }
            for (let i = distance - 1; i >= 0; i--) {
              swoop_polygon.push(10 * i + 40 * x);
              // swoop_polygon.push(10 * Math.sin(i/8 * 2 * Math.PI) + i/8 * rise - (8 * 0.0625 * (i-4)*(i-4) - 8) + 40 * y + 20);
              swoop_polygon.push(y_val + 5 * Math.sin((i+2)/8 * 2 * Math.PI) - i/8 * rise + 40 * y + 20 - 0.375*(i-distance/2)*(i-distance/2) + 6);
            }
            doodad.alpha = 0.2 + 0.1 * Math.random();

            doodad.drawPolygon(swoop_polygon);

            doodad.endFill();

            // doodad.alpha = 0.1 + 0.2 * Math.random();

            // if (Math.random() < 0.5) {
            //   doodad.tint = 0x000000;
            //   doodad.alpha = 0.05 + 0.1 * Math.random();
            // }
            render_container.addChild(doodad);
          }


          
        }
      }
    }
  }
}


Game.prototype.drawPond = function(render_container, land, corner_x, corner_y, polygon) {
  // first, the water polygon
  let flat_water_polygon = [];
  for (let j = 0; j < polygon.length; j++) {
    flat_water_polygon.push(polygon[j][0] - corner_x);
    flat_water_polygon.push(polygon[j][1] - corner_y);
  }

  let water_fill = new PIXI.Graphics();
  water_fill.beginFill(0xFFFFFF);
  water_fill.drawPolygon(flat_water_polygon);
  water_fill.endFill();
  water_fill.tint = water_color;

  render_container.addChild(water_fill);

  // next, the dirt polygons
  riverbank_depth = 20;
  for (let k = 0; k < polygon.length - 1; k++) {
    let p1 = polygon[k];
    let p2 = polygon[0];
    if (k < polygon.length) p2 = polygon[k+1];

    // only do this when one or the other points are "atop" the polygon,
    // in the sense that we could drop a ray down and the end point would be inside the polygon.
    if (pointInsidePolygon([p1[0], p1[1] + 10], polygon)
      || pointInsidePolygon([p2[0], p2[1] + 10], polygon)) {
      
      // main section
      let riverbank_section = new PIXI.Graphics();
      if (land == "forest" || land == "grass" || land == "sand" || land == "water") {
        riverbank_section.beginFill(brown_rock_color);
      } else if (land == "ice") {
        riverbank_section.beginFill(ice_color);
      } else if (land == "rock") {
        riverbank_section.beginFill(rock_color);
      }
      riverbank_section.drawPolygon([
        p1[0] - corner_x, p1[1] - corner_y,
        p2[0] - corner_x, p2[1] - corner_y,
        p2[0] - corner_x, p2[1] + riverbank_depth - corner_y,
        p1[0] - corner_x, p1[1] + riverbank_depth - corner_y,
        p1[0] - corner_x, p1[1] - corner_y,
      ]);
      riverbank_section.endFill();
      if (land == "forest" || land == "grass" || land == "sand" || land == "water") {
        if (p2[1] < p1[1]) {
          let tint = 0.6 + 0.25 * Math.random();
          riverbank_section.tint = PIXI.utils.rgb2hex([tint, tint, tint]);
        }
      } else if (land == "rock") {
        if (p2[1] < p1[1]) {
          let tint = 0.6 + 0.15 * Math.random();
          riverbank_section.tint = PIXI.utils.rgb2hex([tint, tint, tint]);
        } else {
          let tint = 0.7 + 0.15 * Math.random();
          riverbank_section.tint = PIXI.utils.rgb2hex([tint, tint, tint]);
        }
      } else if (land == "ice") {
        if (p2[1] < p1[1]) {
          let tint = 1 - (0.7 + 0.1 * Math.random());
          riverbank_section.tint = PIXI.utils.rgb2hex([1 - tint, 1 - tint/2, 1 - tint/4]);
        } else {
          let tint = 1 - (0.8 + 0.1 * Math.random());
          riverbank_section.tint = PIXI.utils.rgb2hex([1 - tint, 1 - tint/2, 1 - tint/4]);
        }
      }
      render_container.addChild(riverbank_section);

      // weird shadowy color underbank
      let underbank_section = new PIXI.Graphics();
      if (land == "forest" || land == "grass" || land == "sand" || land == "water") {
        underbank_section.beginFill(underwater_rock_color);
      } else if (land == "ice") {
        underbank_section.beginFill(ice_color);
      } else if (land == "rock") {
        underbank_section.beginFill(underwater_grey_rock_color);
      }
      underbank_section.drawPolygon([
        p1[0] - corner_x, p1[1] + riverbank_depth - corner_y,
        p2[0] - corner_x, p2[1] + riverbank_depth - corner_y,
        p2[0] - corner_x, p2[1] + riverbank_depth * 1.7 - corner_y,
        p1[0] - corner_x, p1[1] + riverbank_depth * 1.7 - corner_y,
        p1[0] - corner_x, p1[1] + riverbank_depth - corner_y,
      ]);
      underbank_section.endFill();
      if (land == "forest" || land == "grass" || land == "sand" || land == "water") {
        if (p2[1] < p1[1]) {
          let tint = 0.4 + 0.25 * Math.random();
          underbank_section.tint = PIXI.utils.rgb2hex([tint, tint, tint]);
        } else {
          let tint = 0.6 + 0.3 * Math.random();
          underbank_section.tint = PIXI.utils.rgb2hex([tint, tint, tint]);
        }
      } else if (land == "rock") {
        if (p2[1] < p1[1]) {
          let tint = 0.6 + 0.25 * Math.random();
          underbank_section.tint = PIXI.utils.rgb2hex([tint, tint, tint]);
        } else {
          let tint = 0.7 + 0.3 * Math.random();
          underbank_section.tint = PIXI.utils.rgb2hex([tint, tint, tint]);
        }
      } else if (land == "ice") {
        if (p2[1] < p1[1]) {
          let tint = 1 - (0.4 + 0.1 * Math.random());
          underbank_section.tint = PIXI.utils.rgb2hex([1 - tint, 1 - tint/2, 1 - tint/4]);
        } else {
          let tint = 1 - (0.5 + 0.1 * Math.random());
          underbank_section.tint = PIXI.utils.rgb2hex([1 - tint, 1 - tint/2, 1 - tint/4]);
        }
      }
      render_container.addChild(underbank_section);

      // bright bits
      let d = distance(p1[0], p1[1], p2[0], p2[1]);
      let fixed_d = null;
      for (let l = 50; l <= 150; l += 50) {
        if (fixed_d == null || Math.abs(l - d) < Math.abs(fixed_d - d)) {
          fixed_d = l;
        }
      }

      let rescale = d / fixed_d;
      let angle = 180/Math.PI * Math.atan2(p1[1] - p2[1], p1[0] - p2[0]);
    
      if (rescale > 0.5 && rescale < 2 && Math.abs(Math.abs(angle) - 90) > 20) {
        let dice = 3;
        let x = (p1[0] + p2[0])/2;
        let y = (p1[1] + p2[1])/2;

        let bright_bit = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/bank_lines_" + fixed_d + "_" + Math.ceil(Math.random() * dice) + ".png"));

        bright_bit.position.set(x - corner_x, y - corner_y + riverbank_depth * 1.3);
        bright_bit.anchor.set(0.5, 0.5);
        bright_bit.angle = angle;
        bright_bit.scale.set(rescale, 1);

        render_container.addChild(bright_bit);
      }
    }
  }

  if (land == "forest" || land == "grass" || land == "sand" || land == "water") {
    this.drawEdging(render_container, "water", land, corner_x, corner_y, polygon);
  }
}


Game.prototype.drawTerrace = function(pen, land, corner_x, corner_y, terraces, terrace_choice, pond) {
  check_polygons = [];
  if (pond != null) check_polygons = [pond];

  // find the top point, to place the object correctly for draw/depth order.
  let first_terrace = pen.terrace[0];
  top_point = null;
  for (let j = 0; j < first_terrace.length; j++) {
    if (top_point == null || first_terrace[j][1] < top_point[1]) {
      top_point = [first_terrace[j][0], first_terrace[j][1]];
    }
  }

  let terrace_container = new PIXI.Container();

  for (let i = 0; i < terraces.length; i++) {
    polygon = terraces[i];

    let outline_polygon = [];
    for (let j = 0; j < polygon.length; j++) {
      outline_polygon.push(polygon[j][0] - corner_x);
      outline_polygon.push(polygon[j][1] - corner_y - (edging_depth*(i+1) + 2));
    }
    let tint = 1 - (0.7 + 0.1 * Math.random());
    if (terrace_choice != "rock" && land == "sand") tint = 1 - (0.5 + 0.1 * Math.random());
    let outline_color = PIXI.utils.rgb2hex([1 - tint, 1 - tint/2, 1 - tint/4]);
    if (terrace_choice != "rock" && land != "ice") outline_color = PIXI.utils.rgb2hex([1 - tint/2, 1 - tint/2, 1 - tint/2]);

    let flat_terrace_polygon = [];
    for (let j = 0; j < polygon.length; j++) {
      flat_terrace_polygon.push(polygon[j][0] - corner_x);
      flat_terrace_polygon.push(polygon[j][1] - corner_y - (edging_depth * (i+1)));
    }

    let terrace = new PIXI.Graphics();
    terrace.beginFill(outline_color);
    terrace.drawPolygon(outline_polygon);
    terrace.endFill();
    terrace.beginFill(0xFFFFFF);
    terrace.drawPolygon(flat_terrace_polygon);
    terrace.endFill();

    if (land == null || land == "grass") {
      terrace.tint = grass_color;
    } else if (land == "water") {
      terrace.tint = water_color;
    } else if (land == "sand") {
      terrace.tint = sand_color;
    } else if (land == "forest") {
      terrace.tint = forest_color;
    } else if (land == "ice") {
      terrace.tint = ice_color;
    } else if (land == "rock") {
      terrace.tint = rock_color;
    }
    if (terrace_choice == "rock") terrace.tint = rock_color;

    terrace_container.addChild(terrace);

    let terrace_polygon = [];
    for (let j = 0; j < polygon.length; j++) {
      terrace_polygon.push([polygon[j][0], polygon[j][1] - edging_depth * (i+1)]);
    }

    if (terrace_choice != "rock" && (land == "forest" || land == "grass")) {
      this.dappleGround(terrace_container, land, corner_x, corner_y, terrace_polygon, [], 0.4);
      check_polygons.push(terrace_polygon);
    }

    if (terrace_choice != "rock" && land == "sand") {
      this.dappleGround(terrace_container, land, corner_x, corner_y, terrace_polygon, [], 0.2, true);
      check_polygons.push(terrace_polygon);
    }

    if (land == "ice" || land == "rock") {
      this.dappleGround(terrace_container, land, corner_x, corner_y, terrace_polygon, [], 1);
      check_polygons.push(terrace_polygon);
    }

    if (terrace_choice == "rock") {
      this.dappleGround(terrace_container, "rock", corner_x, corner_y, terrace_polygon, [], 1);
      check_polygons.push(terrace_polygon);
    }

    if (terrace_choice != "rock") {
      this.drawTerraceEdging(terrace_container, land, corner_x, corner_y, terrace_polygon);
    } else {
      this.drawTerraceEdging(terrace_container, "rock", corner_x, corner_y, terrace_polygon);
    }
    if (terrace_choice != "rock" && (land == "forest" || land == "grass")) {  // sand doesn't grass, it just has hard edging.
      this.drawEdging(terrace_container, land, null, corner_x, corner_y, terrace_polygon)
    }
  }


  var terrace_texture = this.renderer.generateTexture(terrace_container,
    PIXI.SCALE_MODES.LINEAR, 1, new PIXI.Rectangle(-100, -100, 1024, 1024));

  var terrace_sprite = new PIXI.Sprite(terrace_texture);
  terrace_sprite.anchor.set(0, 0);
  // terrace_sprite.position.set(corner_x - 100 + (corner_x - top_point[0]), corner_y - 100 + (corner_y - top_point[1]));
  terrace_sprite.position.set(corner_x - 100 - top_point[0], corner_y - 100 - top_point[1]);
  terrace_container = new PIXI.Container();
  terrace_container.position.set(top_point[0], top_point[1]);
  terrace_container.addChild(terrace_sprite);

  // pen.land_object.addChild(terrace_container);
  pen.decoration_objects.push(terrace_container);
  this.decorations.push(terrace_container);
}


Game.prototype.drawTerraceEdging = function(render_container, land, corner_x, corner_y, polygon) {
  for (let k = 0; k < polygon.length; k++) {
    let p1 = polygon[k];
    let p2 = polygon[0];
    if (k < polygon.length - 1) p2 = polygon[k+1];

    // only do this when one or the other points are "underneath" the polygon,
    // in the sense that we could send a ray up and the end point would be inside the polygon.
    if (pointInsidePolygon([p1[0], p1[1] - 10], polygon)
      || pointInsidePolygon([p2[0], p2[1] - 10], polygon)) {

      let rock_edging = new PIXI.Graphics();
      let tint = 1;
      if (land == "rock") rock_edging.beginFill(rock_color);
      if (land == "ice") rock_edging.beginFill(ice_color);
      if (land != "ice" && land != "rock") rock_edging.beginFill(brown_rock_color);
      rock_edging.drawPolygon([
        p1[0] - corner_x, p1[1] - corner_y,
        p2[0] - corner_x, p2[1] - corner_y,
        p2[0] - corner_x, p2[1] + edging_depth - corner_y,
        p1[0] - corner_x, p1[1] + edging_depth - corner_y,
        p1[0] - corner_x, p1[1] - corner_y,
      ]);
      rock_edging.endFill();
      if (land == "forest" || land == "grass" || land == "sand" || land == "water") {
        if (p1[1] < p2[1]) {
          tint = 0.6 + 0.25 * Math.random();
          rock_edging.tint = PIXI.utils.rgb2hex([tint, tint, tint]);
        }
      } else if (land == "ice") {
        if (p1[1] < p2[1]) {
          tint = 1 - (0.7 + 0.1 * Math.random());
          rock_edging.tint = PIXI.utils.rgb2hex([1 - tint, 1 - tint/2, 1 - tint/4]);
        } else {
          tint = 1 - (0.8 + 0.1 * Math.random());
          rock_edging.tint = PIXI.utils.rgb2hex([1 - tint, 1 - tint/2, 1 - tint/4]);
        }
      } else if (land == "rock") {
        if (p1[1] < p2[1]) {
          tint = 0.7 + 0.1 * Math.random();
          rock_edging.tint = PIXI.utils.rgb2hex([tint, tint, tint]);
        } else {
          tint = 0.8 + 0.1 * Math.random();
          rock_edging.tint = PIXI.utils.rgb2hex([tint, tint, tint]);
        }
      }
      render_container.addChild(rock_edging);
    }
  }
}


Game.prototype.drawRockEdging = function(render_container, land, corner_x, corner_y, polygon) {
  for (let k = 0; k < polygon.length - 1; k++) {
    let p1 = polygon[k];
    let p2 = polygon[0];
    if (k < polygon.length) p2 = polygon[k+1];

    rock_edging_depth = 8;

    // only do this when one or the other points are "underneath" the polygon,
    // in the sense that we could send a ray up and the end point would be inside the polygon.
    if (pointInsidePolygon([p1[0], p1[1] - 10], polygon)
      || pointInsidePolygon([p2[0], p2[1] - 10], polygon)) {

      let rock_edging = new PIXI.Graphics();
      if (land == "rock") rock_edging.beginFill(rock_color);
      if (land == "ice") rock_edging.beginFill(ice_color);
      rock_edging.drawPolygon([
        p1[0] - corner_x, p1[1] - corner_y,
        p1[0] - corner_x, p1[1] - rock_edging_depth - corner_y,
        p2[0] - corner_x, p2[1] - rock_edging_depth - corner_y,
        p2[0] - corner_x, p2[1] - corner_y,
        p1[0] - corner_x, p1[1] - corner_y,
      ]);
      rock_edging.endFill();
      if (land == "ice") {
        if (p1[1] < p2[1]) {
          let tint = 1 - (0.7 + 0.1 * Math.random());
          rock_edging.tint = PIXI.utils.rgb2hex([1 - tint, 1 - tint/2, 1 - tint/4]);
        } else {
          let tint = 1 - (0.8 + 0.1 * Math.random());
          rock_edging.tint = PIXI.utils.rgb2hex([1 - tint, 1 - tint/2, 1 - tint/4]);
        }
      } else if (land == "rock") {
        if (p1[1] < p2[1]) {
          let tint = 0.7 + 0.1 * Math.random();
          rock_edging.tint = PIXI.utils.rgb2hex([tint, tint, tint]);
        } else {
          let tint = 0.8 + 0.1 * Math.random();
          rock_edging.tint = PIXI.utils.rgb2hex([tint, tint, tint]);
        }
      }
      render_container.addChild(rock_edging);
    }
  }
}


Game.prototype.drawEdging = function(render_container, land, second_land, corner_x, corner_y, polygon, ignore_sides=false) {
  //let edgings = [];
  for (let k = 0; k < polygon.length - 1; k++) {
    let p1 = polygon[k];
    let p2 = polygon[0];
    if (k < polygon.length) p2 = polygon[k+1];

    let d = distance(p1[0], p1[1], p2[0], p2[1]);
    let fixed_d = null;
    for (let l = 50; l <= 300; l += 50) {
      if (fixed_d == null || Math.abs(l - d) < Math.abs(fixed_d - d)) {
        fixed_d = l;
      }
    }

    let rescale = d / fixed_d;
    let angle = 180/Math.PI * Math.atan2(p1[1] - p2[1], p1[0] - p2[0]);
    if (rescale > 0.5 && rescale < 2 && (Math.abs(angle) < 80 || Math.abs(angle) > 100 || land == "water" || ignore_sides == false)) {
      
      let dice = 3;
      let x = (p1[0] + p2[0])/2;
      let y = (p1[1] + p2[1])/2;

      // if ((angle >= 90 || angle <= -90) && land == "water") {
      //   // add basic riverbank
      //   let riverbank = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/basic_riverbank.png"));
      //   riverbank.scale.set(rescale, 1);
      //   riverbank.anchor.set(0.5, 0.5);
      //   riverbank.alpha = 0.4;
      //   riverbank.angle = angle;
      //   riverbank.position.set(x - corner_x, y - corner_y);
      //   render_container.addChild(riverbank);
      // }

      let root_name = "Art/Terrain/edging_";
      if (angle <= 90 && angle >= -90) root_name = "Art/Terrain/edging_shadow_";
      if (land == "sand") {
        root_name = "Art/Terrain/edging_reverse_shadow_"
        if (angle <= 90 && angle >= -90) root_name = "Art/Terrain/edging_reverse_";
        dice = 1;
      }
      if (land == "water") {
        root_name = "Art/Terrain/edging_";
      }
      
      let edging = new PIXI.Sprite(PIXI.Texture.from(root_name + fixed_d + "_" + Math.ceil(Math.random() * dice) + ".png"));

      edging.position.set(x - corner_x, y - corner_y);
      edging.anchor.set(0.5, 0.5);
      edging.angle = angle;
      if (land == "water") {
        edging.angle = angle + 180;
      }
      edging.scale.set(rescale, 1);

      if (land == "grass") {
        edging.tint = grass_color;
      } else if (land == "forest") {
        edging.tint = forest_color;
      } else if (land == "sand") {
        edging.tint = sand_color;
      } else if (land == "water") {
        if (second_land == null || second_land == "water") {
          edging.tint = background_color;
        } else if (second_land == "grass") {
          edging.tint = grass_color;
        } else if (second_land == "forest") {
          edging.tint = forest_color;
        } else if (second_land == "sand") {
          edging.tint = sand_color;
        }
      }

      render_container.addChild(edging);
      //edgings.push(edging);
    }
  }
  // edgings.sort(function(a,b) {
  //     return b.y - a.y;
  // });
  // for (let i = 0; i < edgings.length; i++) {
  //   render_container.addChild(edgings[i]);
  // }
}


Game.prototype.drawFence = function(polygon, corner_x, corner_y) {
  // Make the border fence, split into top and bottom sections,
  // and add these to the list of decorations (the thing that gets
  // sorted and drawn in order so things appear at the right depth).
  // The fence consists of posts whose bottoms appear to be on the polygon points,
  // and rails which are just quads drawn from post to post.
  // We find them all, then sort them by depth, then draw them in order,
  // then store the result to a texture object. All the values are shifted
  // to fit in the texture, then the texture is shifted back to the proper location.
  
  let top_objects = [];
  let bottom_objects = [];
  let highest_top_point = null;
  let lowest_bottom_point = null;

  // let border_polygon = pen.polygon;
  // let top_x = pen.cx - square_width / 2;
  // let top_y = pen.cy - square_width / 2;
  // let bottom_x = pen.cx - square_width / 2;
  // let bottom_y = pen.cy;

  // compute highest and lowest points
  for (let p = 0; p < polygon.length; p++) {
    let border_point = [polygon[p][0], polygon[p][1]];
    if (highest_top_point == null || border_point[1] - corner_y < highest_top_point) highest_top_point = border_point[1] - corner_y;
    if (lowest_bottom_point == null || border_point[1] - corner_y > lowest_bottom_point) lowest_bottom_point = border_point[1] - corner_y;
  }

  // iterate the polygon
  for (let p = 0; p < polygon.length; p++) {
    let point = [polygon[p][0], polygon[p][1]];

    let post = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/fence_post.png"));
    post.anchor.set(0.5, 0.78);
    
    // add a fence post to either top or bottom
    if (point[1] - corner_y < lowest_bottom_point - 70) {
      top_objects.push(post);
      post.position.set(point[0] - corner_x, point[1] - corner_y);
    } else {
      bottom_objects.push(post);
      post.position.set(point[0] - corner_x, point[1] - (corner_y + square_width/2));
    }
    

    // Draw the rails
    let fence = new PIXI.Graphics();
    let next_point = polygon[0];
    if (p < polygon.length - 1) {
      next_point = [polygon[p + 1][0],polygon[p + 1][1]];
    }
    
    // figure out if we're drawing from post A to post B or post B to post A,
    if (next_point[1] < point[1]) {
      // then draw a line
      fence.lineStyle(12, 0x462D16, 1);
      fence.moveTo(-3, -23).lineTo(
        next_point[0] - point[0], next_point[1] - point[1] - 23 - 3);
      fence.lineStyle(8, fence_color, 1);
      fence.moveTo(0, -30).lineTo(
        next_point[0] - point[0], next_point[1] - point[1] - 30);
      // and add it to either top or bottom
      if (point[1] - corner_y < lowest_bottom_point - 70) {
        fence.position.set(point[0] - corner_x, point[1] - 6 - corner_y);
        top_objects.push(fence);
      } else {
        fence.position.set(point[0] - corner_x, point[1] - 6 - (corner_y + square_width/2))
        bottom_objects.push(fence);
      }
    } else {
      fence.lineStyle(12, 0x462D16, 1);
      fence.moveTo(-3, -23).lineTo(
        point[0] - next_point[0], point[1] - next_point[1] - 23 - 3);
      fence.lineStyle(8, fence_color, 1);
      fence.moveTo(0, -30).lineTo(
        point[0] - next_point[0], point[1] - next_point[1] - 30);
      if (next_point[1] - corner_y < lowest_bottom_point - 70) {
        fence.position.set(next_point[0] - corner_x, next_point[1] - 6 - corner_y);
        top_objects.push(fence);
      } else {
        fence.position.set(next_point[0] - corner_x, next_point[1] - 6 - (corner_y + square_width/2));
        bottom_objects.push(fence);
      }
    }
  }

  // sort the top and bottom fences by y depth
  top_objects.sort(function comp(a, b) {
    return (a.y > b.y) ? 1 : -1;
  });
  bottom_objects.sort(function comp(a, b) {
    return (a.y > b.y) ? 1 : -1;
  });

  // make containers
  var top_fence_render_container = new PIXI.Container();
  var bottom_fence_render_container = new PIXI.Container();

  // add everything to the containers
  for (let p = 0; p < top_objects.length; p++) {
    top_fence_render_container.addChild(top_objects[p]);
  }

  for (let p = 0; p < bottom_objects.length; p++) {
    bottom_fence_render_container.addChild(bottom_objects[p]);
  }
  
  // render the stuff in the top container to a texture, and use that
  // texture to make the top fence sprite, and add that to this.decorations.
  var top_texture = this.renderer.generateTexture(top_fence_render_container,
    PIXI.SCALE_MODES.LINEAR,
    1,
    new PIXI.Rectangle(-50, -100, 1024, 1024));

  var top_fence_sprite = new PIXI.Sprite(top_texture);
  top_fence_sprite.anchor.set(0, 0);
  top_fence_sprite.position.set(-50, -100 - highest_top_point);
  top_fence = new PIXI.Container();
  top_fence.type = "fence";
  top_fence.addChild(top_fence_sprite);
  top_fence.position.set(corner_x, corner_y + highest_top_point);
  // pen.land_object.addChild(top_fence_sprite);
  this.decorations.push(top_fence);

  // render the stuff in the bottom container to a texture, and use that
  // texture to make the bottom fence sprite, and add that to this.decorations.
  var bottom_texture = this.renderer.generateTexture(bottom_fence_render_container,
    PIXI.SCALE_MODES.LINEAR,
    1,
    new PIXI.Rectangle(-50, -200, 1024, 1024));

  var bottom_fence_sprite = new PIXI.Sprite(bottom_texture);
  bottom_fence_sprite.anchor.set(0, 0);
  // bottom_fence_sprite.tint = 0x000000;
  bottom_fence_sprite.position.set(-50, -200 - lowest_bottom_point + square_width/2);
  bottom_fence = new PIXI.Container();
  bottom_fence.type = "fence";
  bottom_fence.addChild(bottom_fence_sprite);
  bottom_fence.position.set(corner_x, (corner_y + square_width/2) + lowest_bottom_point - square_width/2);
  // pen.land_object.addChild(bottom_fence_sprite);
  this.decorations.push(bottom_fence);
}


Game.prototype.drawFenceShadow = function(render_container, corner_x, corner_y, polygon) {
  //let shadows = [];
  for (let k = 0; k < polygon.length - 1; k++) {
    let p1 = polygon[k];
    let p2 = polygon[0];
    if (k < polygon.length) p2 = polygon[k+1];

    let d = distance(p1[0], p1[1], p2[0], p2[1]);
    let fixed_d = null;
    for (let l = 50; l <= 300; l += 50) {
      if (fixed_d == null || Math.abs(l - d) < Math.abs(fixed_d - d)) {
        fixed_d = l;
      }
    }

    let rescale = d / fixed_d;

    let angle = 180/Math.PI * Math.atan2(p1[1] - p2[1], p1[0] - p2[0]);
    if (rescale > 0.5 && rescale < 2 && (Math.abs(angle) < 80 || Math.abs(angle) > 100)) {
      let x = (p1[0] + p2[0])/2;
      let y = (p1[1] + p2[1])/2;

      let fence_shadow = new PIXI.Sprite(PIXI.Texture.from("Art/Terrain/fence_shadow.png"));
      fence_shadow.anchor.set(0.5, 0.5);
      fence_shadow.angle = angle;
      fence_shadow.position.set(x - corner_x, y - corner_y);
      fence_shadow.scale.set(d / 300, 1);
      render_container.addChild(fence_shadow);
      //shadows.push(fence_shadow)
    }
  }
  // shadows.sort(function(a,b) {
  //     return b.y - a.y;
  // });
  // for (let i = 0; i < shadows.length; i++) {
  //   render_container.addChild(shadows[i]);
  // }
}


Game.prototype.drawMapPath = function() {
  var self = this;
  var screen = this.screens["zoo"];

  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      let cell = this.zoo_squares[i][j];
      if (cell.e_edge == true) {
        // draw the eastern edge section
        let section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_straight_vertical_v4.png"));
        section.anchor.set(0.5, 0.5);
        section.position.set(square_width * i + square_width, square_width * j + square_width / 2);
        // section.angle = 90;
        this.map.background_layer.addChild(section);
      }

      if (cell.s_edge == true) {
        // draw the southern edge section
        // let shadow = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_straight_horizontal_v3.png"));
        // shadow.anchor.set(0.5, 0.5);
        // shadow.position.set(square_width * i + square_width / 2, square_width * j + square_width);
        // shadow.angle = 0;
        // this.map.background_layer.addChild(shadow);

        let section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_straight_horizontal_v4.png"));
        section.anchor.set(0.5, 0.5);
        section.position.set(square_width * i + square_width / 2, square_width * j + square_width);
        section.angle = 0;
        this.map.background_layer.addChild(section);
      }
    }
  }


  for (let i = 0; i <= this.zoo_size; i++) {
    for (let j = 0; j <= this.zoo_size; j++) {
      let vertex = this.zoo_vertices[i][j];

      let intersection = null;
      if (vertex.s_path && vertex.e_path && vertex.n_path && vertex.w_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_cross_v4.png"));
      }
      else if (vertex.s_path && vertex.e_path && !vertex.n_path && !vertex.w_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_arc_south_to_east_v4.png"));
      }
      else if (vertex.s_path && vertex.w_path && !vertex.n_path && !vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_arc_south_to_west_v4.png"));
        // intersection.scale.set(-1,1);
      }
      else if (!vertex.s_path && !vertex.e_path && vertex.n_path && vertex.w_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_arc_north_to_west_v4.png"));
        // intersection.angle = 180;
      }
      else if (!vertex.s_path && !vertex.w_path && vertex.n_path && vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_arc_north_to_east_v4.png"));
        // intersection.scale.set(-1,1);
        // intersection.angle = 180;
      }
      else if (vertex.s_path && vertex.w_path && !vertex.n_path && vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_flat_t_down_v4.png"));
        // intersection.angle = 0;
      }
      else if (!vertex.s_path && vertex.w_path && vertex.n_path && vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_flat_t_up_v4.png"));
        // intersection.angle = 180;
      }
      else if (vertex.s_path && !vertex.w_path && vertex.n_path && vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_curve_east_v4.png"));
        intersection.angle = 0;
      }
      else if (vertex.s_path && vertex.w_path && vertex.n_path && !vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_curve_west_v4.png"));
        // intersection.angle = 180;
      }
      else if (!vertex.s_path && vertex.w_path && !vertex.n_path && vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_span_horizontal_v4.png"));
      }
      else if (vertex.s_path && !vertex.w_path && vertex.n_path && !vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_span_vertical_v4.png"));
        // intersection.angle = 90;
      }
      else if (!vertex.s_path && !vertex.w_path && !vertex.n_path && vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_terminus_west_v4.png"));
        // intersection.angle = 180;
      }
      else if (!vertex.s_path && vertex.w_path && !vertex.n_path && !vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_terminus_east_v4.png"));
        // intersection.angle = 0;
      }
      else if (!vertex.s_path && !vertex.w_path && vertex.n_path && !vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_terminus_south_v4.png"));
        // intersection.angle = 90;
      }
      else if (vertex.s_path && !vertex.w_path && !vertex.n_path && !vertex.e_path) {
        intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_terminus_north_v4.png"));
        // intersection.angle = 270;
      }

      if (intersection) {
        intersection.anchor.set(0.5, 0.5);
        intersection.position.set(square_width * i, square_width * j);
        this.map.background_layer.addChild(intersection);
      }

      
    }
  }
}