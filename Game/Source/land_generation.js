

// land_generation.js contains map generation and configuration logic.
//
//
// land.js contains all the code to make land.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

Game.prototype.initializeMap = function() {
  var self = this;
  var screen = this.screens["zoo"];

  let static_background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  static_background.width = 1440;
  static_background.height = 900;
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

  this.map.minimap_layer = new PIXI.Container();
  this.map.addChild(this.map.minimap_layer);
  this.map.minimap_layer.visible = false;

  this.map.build_effect_layer = new PIXI.Container();
  this.map.addChild(this.map.build_effect_layer);

  this.map.terrain_layer = new PIXI.Container();
  this.map.addChild(this.map.terrain_layer);

  this.map.decoration_layer = new PIXI.Container();
  this.map.addChild(this.map.decoration_layer);

  this.map.balloon_layer = new PIXI.Container();
  this.map.addChild(this.map.balloon_layer);

  this.map.train_smoke_layer = new PIXI.Container();
  this.map.addChild(this.map.train_smoke_layer);

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

   // first, choose river tiles. hold these out from the process.
  this.river_tiles = [];
  if (Math.random() < 0.99) {
    this.river_j = this.zoo_size - 2;
    if (Math.random() < 0.5) this.river_j = this.zoo_size - 3;
    for (let i = 0; i < this.zoo_size; i++) {
      this.river_tiles.push([i, this.river_j]);
    }
  }

  bridges = [];
  for (let k = 0; k < 3; k++) {
    bridges.push(Math.ceil(Math.random() * (this.zoo_size - 1)));
  }
  bridges.sort();
  if (this.river_tiles.length > 0) {
    for (let i = 0; i < this.zoo_size; i++) {
      this.zoo_squares[i][this.river_j].group = 5000;
      for (let k = 0; k < bridges.length; k++) {
        if (i >= bridges[k]) this.zoo_squares[i][this.river_j].group += 1;
      }
    }
  }

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


Game.prototype.isGiftShopTile = function(i,j) {
  if (this.special_gift_shop_tile == null) return false;

  if (i == this.special_gift_shop_tile[0] && j == this.special_gift_shop_tile[1]) return true;

  return false;
}


Game.prototype.isMarimbaTile = function(i,j) {
  if (this.special_marimba_tile == null) return false;

  if (i == this.special_marimba_tile[0] && j == this.special_marimba_tile[1]) return true;

  return false;
}


Game.prototype.isRiverTile = function(i,j) {
  for (let k = 0; k < this.river_tiles.length; k++) {
    if (this.river_tiles[k][0] == i && this.river_tiles[k][1] == j) return true;
  }
  return false;
}


Game.prototype.makeMapPens = function() {

  // // first, choose river tiles. hold these out from the process.
  // this.river_tiles = [];
  // if (Math.random() < 0.99) {
  //   this.river_j = this.zoo_size - 2;
  //   if (Math.random() < 0.5) this.river_j = this.zoo_size - 3;
  //   for (let i = 0; i < this.zoo_size; i++) {
  //     this.river_tiles.push([i, this.river_j]);
  //   }
  // }

  // if (this.river_tiles.length > 0) {
  //   for (let i = 0; i < this.zoo_size; i++) {
  //     this.zoo_squares[i][this.river_j + 1].n_edge = true;
  //     this.zoo_squares[i][this.river_j + 1].reachable = true;
  //     this.zoo_vertices[i][this.river_j + 1].e_path = true;
  //     this.zoo_vertices[i+1][this.river_j + 1].w_path = true;

  //     this.zoo_squares[i][this.river_j].s_edge = true;
  //     this.zoo_squares[i][this.river_j].n_edge = true;
  //     this.zoo_squares[i][this.river_j].group = -5000;

  //     this.zoo_squares[i][this.river_j - 1].s_edge = true;
  //     this.zoo_squares[i][this.river_j - 1].reachable = true;
  //     this.zoo_vertices[i][this.river_j - 1].e_path = true;
  //     this.zoo_vertices[i+1][this.river_j - 1].w_path = true;
  //   }
  // }

  // then, choose a special ferris wheel tile pair. hold these out too.
  this.special_ferris_tile = null;
  if (this.zoo_size >= 6) {
    let potential_ferris_tiles = [];
    for (let i = 1; i < this.zoo_size - 2; i++) {
      for (let j = 2; j < this.zoo_size - 1; j++) {
        if (this.zoo_squares[i][j].reachable && !this.isRiverTile(i,j)) {
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
        if (this.zoo_squares[i][j].reachable && !this.isRiverTile(i,j) && !this.isFerrisTile(i,j) && !this.isFerrisTile(i-1,j)
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


  // now, a gift shop tile, same deal.
  this.special_gift_shop_tile = null;
  if (this.zoo_size >= 6) {
    let potential_gift_shop_tiles = [];
    for (let i = 1; i < this.zoo_size - 1; i++) {
      for (let j = 1; j < this.zoo_size - 1; j++) {
        if (this.zoo_squares[i][j].reachable && !this.isRiverTile(i,j) && !this.isCafeTile(i,j) && !this.isFerrisTile(i,j) && !this.isFerrisTile(i-1,j)
          && this.zoo_squares[i][j].s_edge == true) { // put the gift shop somewhere where there's a road below it.
          potential_gift_shop_tiles.push([i,j]);
        }
      }
    }

    if (potential_gift_shop_tiles.length > 0) {
      shuffleArray(potential_gift_shop_tiles);
      this.special_gift_shop_tile = potential_gift_shop_tiles[0];
    } else {
      console.log("ALERT: NO SPACE TO PUT THE GIFT SHOP!");
    }
  }


  // now, a marimba tile, same deal.
  this.special_marimba_tile = null;
  if (this.zoo_size >= 6) {
    let potential_marimba_tiles = [];
    for (let i = 1; i < this.zoo_size - 1; i++) {
      for (let j = 1; j < this.zoo_size - 1; j++) {
        if (this.zoo_squares[i][j].reachable && !this.isRiverTile(i,j) && !this.isCafeTile(i,j) && !this.isGiftShopTile(i,j) && !this.isFerrisTile(i,j) && !this.isFerrisTile(i-1,j)
          && this.zoo_squares[i][j].s_edge == true) { // put the gift shop somewhere where there's a road below it.
          potential_marimba_tiles.push([i,j]);
        }
      }
    }

    if (potential_marimba_tiles.length > 0) {
      shuffleArray(potential_marimba_tiles);
      this.special_marimba_tile = potential_marimba_tiles[0];
    } else {
      console.log("ALERT: NO SPACE TO PUT THE MARIMBA!");
    }
  }

  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {

      if (this.zoo_squares[i][j].reachable && !this.isRiverTile(i,j) && !this.isCafeTile(i,j)
        && !this.isGiftShopTile(i,j) && !this.isMarimbaTile(i,j) && !this.isFerrisTile(i,j) && !this.isFerrisTile(i-1,j)) {

        let polygon = [];

        let no_north_neighbor = (j <= 0 || this.zoo_squares[i][j-1].group != this.zoo_squares[i][j].group || !this.zoo_squares[i][j-1].reachable);
        let no_south_neighbor = (j >= this.zoo_size - 1 || this.zoo_squares[i][j+1].group != this.zoo_squares[i][j].group || !this.zoo_squares[i][j+1].reachable);
        let no_west_neighbor = (i <= 0 || this.zoo_squares[i-1][j].group != this.zoo_squares[i][j].group || !this.zoo_squares[i-1][j].reachable);
        let no_east_neighbor = (i >= this.zoo_size - 1 || this.zoo_squares[i+1][j].group != this.zoo_squares[i][j].group || !this.zoo_squares[i+1][j].reachable);

        // if (j == this.river_j - 1) {
        //   console.log(no_north_neighbor +"," + no_south_neighbor)
        // }
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
        polygon.push([center_x - 300, center_y - 595]); // the top is 595 from the door, with a bit allowed for the player to walk partially out of view behind the building.
        polygon.push([center_x + 300, center_y - 595]);
        polygon.push([center_x + 300, center_y + 50]);

        let grey_polygon = []; // we also define a simpler polygon for when the object is grey.
        grey_polygon.push([center_x + 300, center_y + 50]);
        grey_polygon.push([center_x - 300, center_y + 50]);
        grey_polygon.push([center_x - 300, center_y - 595]);
        grey_polygon.push([center_x + 300, center_y - 595]);
        grey_polygon.push([center_x + 300, center_y + 50]);

        this.zoo_pens.push({
          use: false,
          outer: false,
          polygon: grey_polygon,
          ungrey_polygon: polygon,
          grey_polygon: grey_polygon,
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
      } else if (this.zoo_squares[i][j].reachable && this.isGiftShopTile(i,j)) {
        let polygon = [];
        let center_x = square_width * i + square_width / 2;
        let center_y = square_width * (j + 1) - 186; // 100 pixels of path, 86 pixels of space until the gift shop door.
        polygon.push([center_x + 340, center_y + 50]); // the bottom is 50 pixels from the door
        polygon.push([center_x + 80, center_y + 50]); // the next four vertices define an indentation for the door
        polygon.push([center_x + 80, center_y - 55]);
        polygon.push([center_x - 80, center_y - 55]);
        polygon.push([center_x - 80, center_y + 50]);
        polygon.push([center_x - 340, center_y + 50]); // now we're back to the proper exterior
        polygon.push([center_x - 340, center_y - 540]); // the top is 540 from the door, with a bit allowed for the player to walk partially out of view behind the building.
        polygon.push([center_x + 340, center_y - 540]);
        polygon.push([center_x + 340, center_y + 50]);

        let grey_polygon = []; // we also define a simpler polygon for when the object is grey.
        grey_polygon.push([center_x + 340, center_y + 50]);
        grey_polygon.push([center_x - 340, center_y + 50]);
        grey_polygon.push([center_x - 340, center_y - 540]);
        grey_polygon.push([center_x + 340, center_y - 540]);
        grey_polygon.push([center_x + 340, center_y + 50]);

        this.zoo_pens.push({
          use: false,
          outer: false,
          polygon: grey_polygon,
          ungrey_polygon: polygon,
          grey_polygon: grey_polygon,
          cx: center_x,
          cy: center_y,
          animal: null,
          special: "GIFT_SHOP",
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
      } else if (this.zoo_squares[i][j].reachable && this.isMarimbaTile(i,j)) {
        let polygon = [];
        let center_x = square_width * i + square_width / 2;
        let center_y = square_width * (j + 1) - 200; // 100 pixels of path, 100 pixels of space until the gift shop door.
        polygon.push([center_x + 120, center_y - 210]); 
        polygon.push([center_x - 120, center_y - 170]); // now we're back to the proper exterior
        polygon.push([center_x - 120, center_y - 250]); // the top is 250 from the bottom, with a bit allowed for the player to walk partially out of view behind the marimba.
        polygon.push([center_x + 120, center_y - 250]);
        polygon.push([center_x + 120, center_y - 210]);

        this.zoo_pens.push({
          use: false,
          outer: false,
          polygon: polygon,
          ungrey_polygon: polygon,
          grey_polygon: polygon,
          cx: center_x,
          cy: center_y,
          animal: null,
          special: "MARIMBA",
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

  if (this.river_tiles.length > 0) {
    let y_center = this.river_j * square_width + square_width/2;
    let sine_height = 50;

    this.river_polygon = [];
    this.river_top_path = [];
    this.river_bottom_path = [];

    let river_height = 0;
    let river_width = 140;

    let max_height = 100;
    let min_width = 140;
    let max_width = 320;

    let noise = 50;

    for (let c = -2; c < this.zoo_size + 2; c++) {
      for (let m = 50 + 50 * Math.random(); m < square_width; m += 50 + 50 * Math.random()) {
        let x = c * square_width + m;
        let y = y_center + sine_height * Math.sin(x / 1600 * 2 * Math.PI) + river_height - noise/2 + Math.random() * noise;
        this.river_top_path.push([x, y - river_width / 2]);
        this.river_bottom_path.push([x, y + river_width / 2]);

        river_height += pick([-5, 5, -3,-5, 5,  3]);
        if (river_height > max_height) river_height = 0.95 * max_height;
        if (river_height < -max_height) river_height = 0.95 * -max_height;

        river_width += pick([-5, 5, -3, 3]);
        if (river_width < min_width) river_width += 10;
        if (river_width > max_width) river_width = 0.9 * max_width;
      }

      let x = (c+1) * square_width;
      let y = y_center + sine_height * Math.sin(x / 1600 * 2 * Math.PI) + river_height;
      this.river_top_path.push([x, y - river_width / 2]);
      this.river_bottom_path.push([x, y + river_width / 2]);
    }

    for (let c = 0; c < this.river_top_path.length; c++) {
      this.river_polygon.push(this.river_top_path[c]);
    }
    for (let c = this.river_bottom_path.length - 1; c >= 0; c--) {
      this.river_polygon.push(this.river_bottom_path[c]);
    }

    this.river_polygon = evenPolygon(this.river_polygon, 60, 130);
    this.river_polygon = smoothPolygon(this.river_polygon, 0.5);

    this.river_safety_zone = [];
    for (let c = 0; c < this.river_top_path.length; c++) {
      this.river_safety_zone.push([this.river_top_path[c][0], this.river_top_path[c][1] - 60]);
    }
    for (let c = this.river_bottom_path.length - 1; c >= 0; c--) {
      this.river_safety_zone.push([this.river_bottom_path[c][0], this.river_bottom_path[c][1] + 60]);
    }


  } else {
    this.river_polygon = null;
  }
}


// The map is only valid if there are road connections near each of the four compass edges,
// and the gift shop, ferris wheel, cafe and marimba exist.
Game.prototype.checkMapValidity = function() {

  if (this.special_cafe_tile == null) {
    console.log("No cafe!");
    return false;
  }

  if (this.special_ferris_tile == null) {
    console.log("No ferris wheel!");
    return false;
  }

  if (this.special_gift_shop_tile == null) {
    console.log("No gift shop!");
    return false;
  }

  if (this.special_marimba_tile == null) {
    console.log("No marimba!");
    return false;
  }

  // Hack: this is actually setting up the train station.
  this.east_station = null;
  for (let i = this.zoo_size/2 - 1; i <= this.zoo_size/2 + 1; i++) {
    if (this.zoo_vertices[this.zoo_size][i].w_path) {
      if (this.east_station == null || i < this.zoo_size/2 + 1) {
        this.east_station = i;
      }
    }
  }
  if (this.east_station == null) {
    console.log("No east station!");
    return false;
  }

  this.west_station = null;
  for (let i = this.zoo_size/2 - 1; i <= this.zoo_size/2 + 1; i++) {
    if (this.zoo_vertices[0][i].e_path) {
      if (this.west_station == null || i < this.zoo_size/2 + 1) {
        this.west_station = i;
      }
    }
  }
  if (this.west_station == null) {
    console.log("No west station!");
    return false;
  }

  this.north_station = null;
  for (let i = this.zoo_size/2 - 1; i <= this.zoo_size/2 + 1; i++) {
    if (this.zoo_vertices[i][0].s_path) {
      if (this.north_station == null || i < this.zoo_size/2 + 1) {
        this.north_station = i;
      }
    }
  }
  if (this.north_station == null) {
    console.log("No north station!");
    return false;
  }

  this.south_station = null;
  for (let i = this.zoo_size/2 - 1; i <= this.zoo_size/2 + 1; i++) {
    if (this.zoo_vertices[i][this.zoo_size].n_path) {
      if (this.south_station == null || i < this.zoo_size/2 + 1) {
        this.south_station = i;
      }
    }
  }
  if (this.south_station == null) {
    console.log("No south station!");
    return false;
  }

  console.log("Everything is fine with this map.");
  return true;
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
        // new_animal = "POLAR_BEAR";
        // new_animal = "CHIMPANZEE";
        // new_animal = pick(["RED_PANDA","MEERKAT", "CAT", "WARTHOG", "DOG"]);
        // new_animal = "OTTER";
        // new_animal = "ORANGUTAN";
        // new_animal = "ANTEATER";
        pen.animal = new_animal;
        console.log(new_animal);
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

      // Skip if loaded from save and inner_polygon already exists
      if (this.loaded_from_save && pen.inner_polygon && pen.inner_polygon.length > 0) {
        continue;
      }

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
            if (pen.polygon && pointInsidePolygon([point_x, point_y], pen.polygon)) {
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
              return !pen.polygon || !pointInsidePolygon([t[0], t[1]], pen.polygon)
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
          if (pen.polygon && pointInsidePolygon([t[0], t[1] - 10], new_terrace)
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
              shadow.position.set(0,7);
              decoration.addChild(shadow);
              let tree_sprite = new PIXI.AnimatedSprite(sheet.animations["tree_v4"]);
              tree_sprite.gotoAndStop(decoration.tree_number - 1);
              tree_sprite.anchor.set(0.5, 0.92);
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

            this.addDecorationCulling(decoration);


            this.decorations.push(decoration);
            pen.decoration_objects.push(decoration);
            prior_decorations.push(decoration);
          }
        }
      }
    }

    if (pen.animal != null) {
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

    if (pen.special == "GIFT_SHOP") {
      this.gift_shop = this.makeGiftShopExterior(pen);
      this.gift_shop.position.set(pen.cx, pen.cy);
      this.decorations.push(this.gift_shop);
      pen.special_object = this.gift_shop;
    }

    if (pen.special == "MARIMBA") {
      this.marimba = this.makeMarimba(pen);
      this.marimba.position.set(pen.cx, pen.cy - 200);
      this.decorations.push(this.marimba);
      pen.special_object = this.marimba;
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
        || (i >= 0 && j >= 0 && i < this.zoo_size && j < this.zoo_size 
          && this.zoo_squares[i][j].reachable == false)) {
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
            let tracks = false;
            if (Math.abs(y - ((this.zoo_size + 0.5) * square_width - 200)) < 150) tracks = true;
            if (Math.abs(y - ((-0.5) * square_width + 200)) < 150) tracks = true;
            if (Math.abs(x - ((this.zoo_size + 0.5) * square_width - 200)) < 150) tracks = true;
            if (Math.abs(x - ((-0.5) * square_width + 200)) < 150) tracks = true;
            if (Math.abs(x - 0) < 300 && Math.abs(y - this.north_station * square_width) < 300) tracks = true; // okay, well, northern station. 

            if (this.pointInPen(x, y) == null && !tracks
              && !(this.river_safety_zone != null && pointInsidePolygon([x,y], this.river_safety_zone))
                && distance(x, y, this.player.x, this.player.y) > 250) { // && distance(x, y, blobs)
              this.ent_positions.push([x,y, Math.ceil(Math.random() * 3)]);
            } else {
              // console.log("cancelled a tree, too close to player");
            }
          }
        }
      }
    }
  }

  // Add trees around the river, but not on the path spots.
  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      if (this.isRiverTile(i,j)) {
        for (let t = 0; t < 50; t++) {
          if (Math.random() > 0.4) {
            let x = square_width * i + 100 + (square_width - 200) * Math.random();
            let y = square_width * j + 100 + (square_width - 200) * Math.random();
            if (!(this.river_safety_zone != null && pointInsidePolygon([x,y], this.river_safety_zone))) {
              this.ent_positions.push([x,y, Math.ceil(Math.random() * 3)]);
            }
          }
        }
      }
    }
  }

  // Add a few trees around the edges of the pens
  let tree_lining_points = [];
  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].w_edge
        && !this.isCafeTile(i,j) && !this.isGiftShopTile(i,j)) {
        for (let t = 0; t < 4; t++) {
          if (Math.random() > 0.4) {
            let x = square_width * i + 120 + 20 * Math.random();
            let y = square_width * j + 200 + (square_width - 400) * Math.random();
            if (this.pointInPen(x, y) == null
              && !(this.river_safety_zone != null && pointInsidePolygon([x,y], this.river_safety_zone))) {
              // tree_lining_points.push([x, y])
              this.ent_positions.push([x,y, Math.ceil(Math.random() * 3)]);
            }
          }
        }
      }
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].e_edge
        && !this.isCafeTile(i,j) && !this.isGiftShopTile(i,j)) {
        for (let t = 0; t < 4; t++) {
          if (Math.random() > 0.4) {
            let x = square_width * i + square_width - 120 - 20 * Math.random();
            let y = square_width * j + 200 + (square_width - 400) * Math.random();
            if (this.pointInPen(x, y) == null
              && !(this.river_safety_zone != null && pointInsidePolygon([x,y], this.river_safety_zone))) {
              // tree_lining_points.push([x, y]);
              this.ent_positions.push([x,y, Math.ceil(Math.random() * 3)]);
            }
          }
        }
      }
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].n_edge) {
        for (let t = 0; t < 3; t++) {
          if (Math.random() > 0.3) {
            let x = square_width * i + 200 + (square_width - 400) * Math.random();
            let y = square_width * j + 120 + 20 * Math.random();
            if (this.pointInPen(x, y) == null
              && !(this.river_safety_zone != null && pointInsidePolygon([x,y], this.river_safety_zone))) {
              // tree_lining_points.push([x, y]);
              this.ent_positions.push([x,y, Math.ceil(Math.random() * 3)]);
            }
          }
        }
      }
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].s_edge
        && !this.isCafeTile(i,j) && !this.isGiftShopTile(i,j)) {
        for (let t = 0; t < 3; t++) {
          if (Math.random() > 0.2) {
            let x = square_width * i + 200 + (square_width - 400) * Math.random();
            let y = square_width * j + square_width - 120 - 20 * Math.random();
            if (this.pointInPen(x, y) == null
              && !(this.river_safety_zone != null && pointInsidePolygon([x,y], this.river_safety_zone))) {
              // tree_lining_points.push([x, y]);
              this.ent_positions.push([x,y, Math.ceil(Math.random() * 3)]);
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
    shadow.position.set(0,7);
    ent.addChild(shadow);
    let tree = new PIXI.AnimatedSprite(sheet.animations["tree_v4"]);
    tree.gotoAndStop(0);
    tree.anchor.set(0.5, 0.92); // was 85
    ent.addChild(tree);
    ent.tree = tree;

    // let ent = new PIXI.AnimatedSprite(sheet.animations["tree_v4"]);
    ent.position.set(0, 0);
    // ent.gotoAndStop(0);
    ent.visible = false;
    this.ents.push(ent);
    this.decorations.push(ent);
  }



  // for (let i = 0; i < tree_lining_points.length; i++) {
  //   let x = tree_lining_points[i][0];
  //   let y = tree_lining_points[i][1];

  //   let decoration = new PIXI.Container();
  //   decoration.type = "tree";
  //   decoration.tree_number = Math.ceil(Math.random() * 3)
  //   let shadow = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/tree_shadow.png"));
  //   shadow.anchor.set(0.5, 0.5);
  //   shadow.position.set(0,7);
  //   decoration.addChild(shadow);
  //   let tree = new PIXI.AnimatedSprite(sheet.animations["tree_v4"]);
  //   tree.gotoAndStop(decoration.tree_number - 1);
  //   tree.anchor.set(0.5, 0.92);
  //   decoration.addChild(tree);
  //   decoration.position.set(x, y);
  //   this.decorations.push(decoration);
  // }

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
