
Game.prototype.initializeZoo = function() {
  var self = this;
  var screen = this.screens["zoo"];
  this.clearScreen(screen);

  this.freefalling = [];
  this.shakers = [];
  this.drops = [];
  this.foods = [];

  this.terrain = [];
  this.decorations = [];
  this.animals = [];

  this.keymap = {};

  this.resetZooScreen();
}

let zoo_size = 40;

let voronoi_size = 200;
let relaxation_number = 10;
let ellipse_size = 100;
let pen_scale = 30;
let ellipse_eccentricity = 1.7;
let shrink_factor = 0.7;
let shrink_distance = 20;
let tree_frequency = 0.35;

let background_color = 0x318115;
let path_color = 0xf9e6bb;
let grass_color = 0xb1d571;
let ice_color = 0xFAFAFF;
let sand_color = 0xf3cca0;
let water_color = 0x42b2d2;
let sign_color = 0xc09f57;
let pen_color = 0x754c25;
let pen_shadow_color = 0x4d321a;

let steak_color = 0x954a4a;
let greens_color = 0x3c713a;
let fruit_color = 0x70527d;

let greyscale_pen_color = 0x8a8a8a;
let greyscale_pen_shadow_color = 0x5b5b5b;

let poop_color = 0x644b38;

// this should be 6. it looks good at 6.
// let map_scale = 6;

Game.prototype.resetZooScreen = function() {
  var self = this;
  var screen = this.screens["zoo"];

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.width = this.width;
  background.height = this.height;
  background.tint = background_color;
  screen.addChild(background);

  this.dot_filter = new PIXI.filters.DotFilter();
  this.dot_filter.scale  = 1;
  this.dot_filter.angle   = 5;

  this.sepia_filter = new PIXI.filters.ColorMatrixFilter();
  this.sepia_filter.sepia(true);

  this.greyscale_filter = new PIXI.filters.ColorMatrixFilter();
  this.greyscale_filter.greyscale(0.6, true);

  this.dropshadow_filter = new PIXI.filters.DropShadowFilter();
  this.dropshadow_filter.blur  = 2;
  this.dropshadow_filter.quality = 3;
  this.dropshadow_filter.alpha = 0.55;
  this.dropshadow_filter.distance = 8;
  this.dropshadow_filter.rotation = 45;

  this.map = new PIXI.Container();
  this.map.position.set(640,480)
  // this.map.scale.set(map_scale, map_scale);
  screen.addChild(this.map);

  this.map.background_layer = new PIXI.Container();
  this.map.addChild(this.map.background_layer);

  this.map.build_effect_layer = new PIXI.Container();
  this.map.addChild(this.map.build_effect_layer);

  this.map.terrain_layer = new PIXI.Container();
  this.map.addChild(this.map.terrain_layer);

  this.map.decoration_layer = new PIXI.Container();
  this.map.addChild(this.map.decoration_layer);

  this.title_image = new PIXI.Sprite(PIXI.Texture.from("Art/alpha_zoo_title.png"));
  this.title_image.width = this.width;
  this.title_image.height = this.height;
  screen.addChild(this.title_image);

  // Make the ui layer
  this.makeUI();

  // Make the map
  this.makeVoronoiDiagram(zoo_size);
  this.makeInnerGroups();
  this.scaleGroups();
  this.deleteOverlaps();
  this.smoothCells();
  this.smoothCells();
  this.computeBounds();

  this.designatePens();

  this.drawMap();

  this.player = this.makeCharacter();

  this.populateZoo();
  this.sortLayer(this.map.decoration_layer, this.decorations);
  this.greyAnimalPens();

  this.start_time = this.markTime();

  this.setMusic("background_music");
}


Game.prototype.makeUI = function() {
  var self = this;
  var screen = this.screens["zoo"];
  
  this.ui_layer = new PIXI.Container();
  screen.addChild(this.ui_layer);

  this.typing_ui = new PIXI.Container();
  this.ui_layer.addChild(this.typing_ui);

  this.grey_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 140, fill: 0xDDDDDD, letterSpacing: 8, align: "left"});
  this.grey_text.anchor.set(0,0.5);
  this.grey_text.position.set(25, 93);
  this.typing_ui.addChild(this.grey_text);

  this.typing_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 140, fill: 0xFFFFFF, letterSpacing: 8, align: "left"});
  this.typing_text.tint = 0x000000;
  this.typing_text.anchor.set(0,0.5);
  this.typing_text.position.set(25, 93);
  this.typing_ui.addChild(this.typing_text);

  this.typing_backing = null;

  this.typing_ui.visible = false;
  this.typing_allowed = false;
  this.display_typing_allowed = false;


  this.display_ui = new PIXI.Container();
  this.ui_layer.addChild(this.display_ui);

  // this.display_action_backing = new PIXI.Sprite(PIXI.Texture.from("Art/wood.png"));
  // this.display_action_backing.anchor.set(0, 0);
  // this.display_action_backing.scale.set(0.5, 0.5);
  // this.display_action_backing.position.set(-200, 810);
  // this.display_action_backing.filters = [this.dropshadow_filter];
  // this.display_ui.addChild(this.display_action_backing);

  // this.display_food_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/Food/food.png"));
  // this.display_food_glyph.anchor.set(0.5,0.75);
  // this.display_food_glyph.position.set(70, 855);
  // this.display_food_glyph.scale.set(0.75, 0.75)
  // this.display_ui.addChild(this.display_food_glyph);

  // this.display_food_grey_text = new PIXI.Text("FEED", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0xDDDDDD, letterSpacing: 8, align: "left"});
  // this.display_food_grey_text.anchor.set(0,1);
  // this.display_food_grey_text.position.set(130, 900);
  // this.display_ui.addChild(this.display_food_grey_text);

  // this.display_food_typing_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0xFFFFFF, letterSpacing: 8, align: "left"});
  // this.display_food_typing_text.tint = 0x000000;
  // this.display_food_typing_text.anchor.set(0,1);
  // this.display_food_typing_text.position.set(130, 900);
  // this.display_ui.addChild(this.display_food_typing_text);


  this.display_action_backing = new PIXI.Sprite(PIXI.Texture.from("Art/wood.png"));
  this.display_action_backing.anchor.set(0, 1);
  this.display_action_backing.scale.set(0.5, 1);
  this.display_action_backing.position.set(-200, 960 - 16);
  this.display_action_backing.filters = [this.dropshadow_filter];
  this.display_ui.addChild(this.display_action_backing);

  this.display_food_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/Food/food.png"));
  this.display_food_glyph.anchor.set(0.5,0.75);
  this.display_food_glyph.position.set(70, 815);
  this.display_food_glyph.scale.set(0.75, 0.75)
  this.display_ui.addChild(this.display_food_glyph);

  this.display_food_grey_text = new PIXI.Text("FEED", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0xDDDDDD, letterSpacing: 8, align: "left"});
  this.display_food_grey_text.anchor.set(0,1);
  this.display_food_grey_text.position.set(130, 855);
  this.display_ui.addChild(this.display_food_grey_text);

  this.display_food_typing_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0xFFFFFF, letterSpacing: 8, align: "left"});
  this.display_food_typing_text.tint = 0x000000;
  this.display_food_typing_text.anchor.set(0,1);
  this.display_food_typing_text.position.set(130, 855);
  this.display_ui.addChild(this.display_food_typing_text);

  this.display_food_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/poop.png"));
  this.display_food_glyph.anchor.set(0.5,0.75);
  this.display_food_glyph.position.set(70, 905);
  this.display_food_glyph.scale.set(0.75, 0.75)
  this.display_ui.addChild(this.display_food_glyph);

  this.display_poop_grey_text = new PIXI.Text("POOP", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0xDDDDDD, letterSpacing: 8, align: "left"});
  this.display_poop_grey_text.anchor.set(0,1);
  this.display_poop_grey_text.position.set(130, 945);
  this.display_ui.addChild(this.display_poop_grey_text);

  this.display_poop_typing_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0xFFFFFF, letterSpacing: 8, align: "left"});
  this.display_poop_typing_text.tint = 0x000000;
  this.display_poop_typing_text.anchor.set(0,1);
  this.display_poop_typing_text.position.set(130, 945);
  this.display_ui.addChild(this.display_poop_typing_text);

  this.display_backing = new PIXI.Sprite(PIXI.Texture.from("Art/wood.png"));
  this.display_backing.anchor.set(0, 1);
  this.display_backing.scale.set(0.8, 0.8);
  this.display_backing.position.set(1280 - 400, 960 - 30);
  this.display_backing.filters = [this.dropshadow_filter];
  this.display_ui.addChild(this.display_backing);

  this.display_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 140, fill: 0xFFFFFF, letterSpacing: 8, align: "right"});
  this.display_text.tint = 0x000000;
  this.display_text.anchor.set(1,0.5);
  this.display_text.position.set(1280 - 25, 960 - 90);
  this.display_ui.addChild(this.display_text);

  this.display_ui.visible = false;
}

Game.prototype.makeVoronoiDiagram = function(number_of_pens) {
  var self = this;

  this.voronoi_points = [];
  this.voronoi_metadata = [];

  for (let i = 0; i < voronoi_size; i++) {
    this.voronoi_points.push([Math.floor(Math.random() * 320), Math.floor(Math.random() * 240)]);
  }
  for (let i = 0; i < voronoi_size; i++) {
    this.voronoi_metadata.push({
      use: false,
      outer: false,
      group: null,
      polygon: null,
      group_center: null,
      neighbors: [],
      cx: null,
      cy: null,
      animal: null,
      land: "grass",
      decorations: ["grass", "tree", "bush", "rock"],
      decoration_objects: [],
      land_object: null,
      animal_objects: null,
      sign: null,
      state: "ungrey",
      cell_number: i,
    });
  }

  for (let r = 0; r < relaxation_number; r++) {
    lloydRelaxation(this.voronoi_points, 320, 240);
  }

  for (let i = 0; i < voronoi_size; i++) {
    // this.voronoi_points[i][0] *= 4;
    // this.voronoi_points[i][1] *= 4;
    this.voronoi_points[i][0] *= pen_scale;
    this.voronoi_points[i][1] *= pen_scale;
  }

  this.delaunay = d3.Delaunay.from(this.voronoi_points);
  // this.voronoi_vertices = this.delaunay.voronoi([0, 0, 1280, 960]);
  this.voronoi_vertices = this.delaunay.voronoi([0, 0, 320*pen_scale, 240*pen_scale]);

  for (let i = 0; i < voronoi_size; i++) {
    let neighbors = this.voronoi_vertices.neighbors(i);
    let neighbor = neighbors.next()
    while(!neighbor.done) {
      this.voronoi_metadata[i].neighbors.push(neighbor.value);
      neighbor = neighbors.next();
    }

    this.voronoi_metadata[i].neighbors.sort(function(a,b) {
      let v = self.voronoi_points;
      let d1 = distance(v[i][0], v[i][1], v[a][0], v[a][1]);
      let d2 = distance(v[i][0], v[i][1], v[b][0], v[b][1]);
      return d1 - d2;
    })
  }

  let cell_count = 0;

  while(cell_count < Math.min(number_of_pens, voronoi_size)) {
    cell_count = 0;

    for (let i = 0; i < voronoi_size; i++) {
      let p = this.voronoi_points[i];
      let px = p[0] - (320 * pen_scale / 2);
      let py = p[1] - (240 * pen_scale / 2);
      if (px*px/(ellipse_eccentricity*ellipse_eccentricity) + py*py < ellipse_size*ellipse_size) {
        cell_count += 1;
        this.voronoi_metadata[i].use = true;
      } else {
        this.voronoi_metadata[i].use = false;
      }
    }

    ellipse_size *= 1.1;
  }

  for (let i = 0; i < voronoi_size; i++) {
    //if (this.voronoi_metadata[i].use == true) {
      this.voronoi_metadata[i].polygon = [];
      for (let p = 0; p < this.voronoi_vertices.cellPolygon(i).length; p++) {
        let point = this.voronoi_vertices.cellPolygon(i)[p];

        this.voronoi_metadata[i].polygon.push([point[0],point[1]]);
      }

      let neighbors = this.voronoi_vertices.neighbors(i);
      let neighbor = neighbors.next()
      while(!neighbor.done) {
        if (this.voronoi_metadata[neighbor.value].use == false) {
          this.voronoi_metadata[i].outer = true;
          this.voronoi_metadata[i].group = 0;
        }
        neighbor = neighbors.next();
      }
    //}
  }
}


Game.prototype.makeInnerGroups = function() {
  let group_num = 1;
  let group_count = 0;

  //walk and recursively mark groups until they reach a certain size (typically 3)
  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group == null) {
      this.markGroup(i, group_num, group_count);
      group_num += 1;
      group_count = 0;
    }
  }

  // compute centers of each group
  group_centers = {};

  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != null) {
      group_centers[this.voronoi_metadata[i].group] = [0, 0, 0];
    }
  }

  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != null) {
      // for (let j = 0; j < this.voronoi_metadata[i].polygon.length; j++) {
      //   group_centers[this.voronoi_metadata[i].group][0] += this.voronoi_metadata[i].polygon[j][0];
      //   group_centers[this.voronoi_metadata[i].group][1] += this.voronoi_metadata[i].polygon[j][1];
      //   group_centers[this.voronoi_metadata[i].group][2] += 1;
      // }
      group_centers[this.voronoi_metadata[i].group][0] += this.voronoi_points[i][0];
      group_centers[this.voronoi_metadata[i].group][1] += this.voronoi_points[i][1];
      group_centers[this.voronoi_metadata[i].group][2] += 1;
    }
  }

  for (const [key, value] of Object.entries(group_centers)) {
    if(value[2] != 0) {
      value[0] /= value[2];
      value[1] /= value[2];
    }
  }

  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != null) {
      let gp = group_centers[this.voronoi_metadata[i].group];
      this.voronoi_metadata[i].group_center = [gp[0], gp[1]];
    }
  }

  this.zoo_center = group_centers[0];
}


Game.prototype.markGroup = function(number, group_num, group_count) {
  if (group_count >= 3) return group_count;

  this.voronoi_metadata[number].group = group_num;
  group_count += 1;

  let neighbors = this.voronoi_vertices.neighbors(number);
  let neighbor = neighbors.next()
  while(!neighbor.done) {
    if (this.voronoi_metadata[neighbor.value].use == true && this.voronoi_metadata[neighbor.value].group == null) {
      group_count = this.markGroup(neighbor.value, group_num, group_count);
    }
    neighbor = neighbors.next();
  }

  return group_count;
}


Game.prototype.scaleGroups = function() {
  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != null) {
      let gcx = this.voronoi_metadata[i].group_center[0];
      let gcy = this.voronoi_metadata[i].group_center[1];

      // if (this.voronoi_metadata[i].group == 0) {
      //   // precompute group so we can use it to check inner and outer points on the outer groups
      //   let cx = 0;
      //   let cy = 0;
      //   let count = 0;
      //   for (let j = 0; j < this.voronoi_metadata[i].polygon.length; j++) {
      //     let point = this.voronoi_metadata[i].polygon[j];
      //     cx += point[0];
      //     cy += point[1];
      //     count += 1;
      //   }
      //   this.voronoi_metadata[i].cx = cx / count;
      //   this.voronoi_metadata[i].cy = cy / count;
      // }

      // this.voronoi_metadata[i].grass_polygon = [];

      for (let j = 0; j < this.voronoi_metadata[i].polygon.length; j++) {
        let point = this.voronoi_metadata[i].polygon[j];

        // percentage scale version
        if (this.voronoi_metadata[i].group == 0) {
          // // scale inner and outer points differently
          if (distance(point[0], point[1], this.zoo_center[0], this.zoo_center[1]) <= distance(this.voronoi_metadata[i].cx, this.voronoi_metadata[i].cy, this.zoo_center[0], this.zoo_center[1])) {
            point[0] = 1.1 * point[0] + (1 - 1.1) * gcx;
            point[1] = 1.1 * point[1] + (1 - 1.1) * gcy;
          } else {
            point[0] = 1.05 * point[0] + (1 - 1.05) * gcx;
            point[1] = 1.05 * point[1] + (1 - 1.05) * gcy;
          }

          
        } else {
          point[0] = shrink_factor * point[0] + (1 - shrink_factor) * gcx;
          point[1] = shrink_factor * point[1] + (1 - shrink_factor) * gcy;
        }


        // this.voronoi_metadata[i].grass_polygon.push(
        //   [1.05 * point[0] + (1 - 1.05) * gcx - (320 * pen_scale / 2),
        //   1.05 * point[1] + (1 - 1.05) * gcy - (240 * pen_scale / 2)
        // ]);
        

        point[0] -= (320 * pen_scale / 2);
        point[1] -= (240 * pen_scale / 2);



        // fixed distance shrink version
        // bring the point closer to the center by a fixed shrink_distance.
        // let d = distance(point[0], point[1], cx, cy);

        // let factor = (d - shrink_distance) / d;
        // if (this.voronoi_metadata[i].group == 0) factor = (d + 4 * shrink_distance) / d;
        // point[0] = factor * point[0] + (1 - factor) * cx;
        // point[1] = factor * point[1] + (1 - factor) * cy;
      }
      
      let cx = 0;
      let cy = 0;
      let count = 0;
      for (let j = 0; j < this.voronoi_metadata[i].polygon.length; j++) {
        let point = this.voronoi_metadata[i].polygon[j];
        cx += point[0];
        cy += point[1];
        count += 1;
      }
      this.voronoi_metadata[i].cx = cx / count;
      this.voronoi_metadata[i].cy = cy / count;
    } else {
      for (let j = 0; j < this.voronoi_metadata[i].polygon.length; j++) {
        let point = this.voronoi_metadata[i].polygon[j];

        point[0] = 1.05 * point[0] + (1 - 1.05) * this.zoo_center[0];
        point[1] = 1.05 * point[1] + (1 - 1.05) * this.zoo_center[1];

        point[0] -= (320 * pen_scale / 2);
        point[1] -= (240 * pen_scale / 2);
      }

      let cx = 0;
      let cy = 0;
      let count = 0;
      for (let j = 0; j < this.voronoi_metadata[i].polygon.length; j++) {
        let point = this.voronoi_metadata[i].polygon[j];
        cx += point[0];
        cy += point[1];
        count += 1;
      }
      this.voronoi_metadata[i].cx = cx / count;
      this.voronoi_metadata[i].cy = cy / count;
    }
  }

  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == false) {
      for (let j = 0; j < this.voronoi_metadata[i].neighbors.length; j++) {
        let n = this.voronoi_metadata[i].neighbors[j];
        if (this.voronoi_metadata[n].use == true && this.voronoi_metadata[n].group == 0) {
          this.voronoi_metadata[i].group = 5001;
        }
      }
    }
  }
}


Game.prototype.deleteOverlaps = function() {
  // Delete any outer cell that doesn't have inner cell neighbors, to prevent lockout.
   for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group == 0) {
      has_nonzero_neighbor = false;

      for (let j = 0; j < this.voronoi_metadata[i].neighbors.length; j++) {
        let cell = this.voronoi_metadata[this.voronoi_metadata[i].neighbors[j]];
        if (cell.use == true && cell.group != 5000 && cell.group > 0) {
          has_nonzero_neighbor = true;
        }
      }

      if (!has_nonzero_neighbor) {
        // console.log("Deleting outer cell because it has no inner neighbors");
        this.voronoi_metadata[i].use = false;
        this.voronoi_metadata[i].group = null;
      }
    }
  }

  // Delete any cell that overlaps a cell from a lower numbered group
  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != null) {
      for (let j = 0; j < voronoi_size; j++) {
        if (this.voronoi_metadata[j].use == true && this.voronoi_metadata[j].group != null) {
          if (this.voronoi_metadata[j].group > this.voronoi_metadata[i].group) {
            for (let k = 0; k < this.voronoi_metadata[j].polygon.length; k++) {
              let point = this.voronoi_metadata[j].polygon[k];
              if (pointInsidePolygon(point, this.voronoi_metadata[i].polygon) == true) {
                // console.log("deleting an overlap cell");
                this.voronoi_metadata[j].use = false;
                this.voronoi_metadata[j].group = null;
              }
            }
          }
        }
      }
    }
  }
}


smoothing_factor = 0.9;
Game.prototype.smoothCells = function() {
  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != null) {
      let new_polygon = [];
      let l = this.voronoi_metadata[i].polygon.length;
      // could be to l - 1
      for (let j = 0; j < l - 1; j++) {
        
        // pre could go to l - 2 and post could go to 0 instead.
        let pre_point = j > 0 ? this.voronoi_metadata[i].polygon[j - 1] : this.voronoi_metadata[i].polygon[l - 2];
        let point = this.voronoi_metadata[i].polygon[j];
        let post_point = j < l - 1 ? this.voronoi_metadata[i].polygon[j + 1] : this.voronoi_metadata[i].polygon[1];

        let new_pre = [
          smoothing_factor * point[0] + (1 - smoothing_factor) * pre_point[0],
          smoothing_factor * point[1] + (1 - smoothing_factor) * pre_point[1]
        ];

        let new_post = [
          smoothing_factor * point[0] + (1 - smoothing_factor) * post_point[0],
          smoothing_factor * point[1] + (1 - smoothing_factor) * post_point[1]
        ];

        new_polygon.push(new_pre);
        new_polygon.push(new_post);
      }
      let last = [new_polygon[0][0], new_polygon[0][1]];
      new_polygon.push(last);
      this.voronoi_metadata[i].polygon = new_polygon;
    }
  }
}


Game.prototype.computeBounds = function() {
  
  this.upper_bound = 0;
  this.lower_bound = 0;
  this.left_bound = 0;
  this.right_bound = 0;

  center_most_lower = -1;
  center_x = 9000000;
  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group == 0) {
      if (Math.abs(this.voronoi_metadata[i].cx) < center_x && this.voronoi_metadata[i].cy > 0) {
        center_x = Math.abs(this.voronoi_metadata[i].cx);
        center_most_lower = i;
      }
    }

    if (this.voronoi_metadata[i].use == true) {
      for(let j = 0; j < this.voronoi_metadata[i].polygon.length; j++) {
        let point = this.voronoi_metadata[i].polygon[j];
        if (point[0] < this.left_bound) this.left_bound = point[0];
        if (point[0] > this.right_bound) this.right_bound = point[0];
        if (point[1] < this.upper_bound) this.upper_bound = point[1];
        if (point[1] > this.lower_bound) this.lower_bound = point[1];
      }
    }
  }

  this.left_bound -= 300;
  this.right_bound += 300;
  this.upper_bound -= 300;
  this.lower_bound += 300;

  if (center_most_lower == -1) {
    console.log("failed to find the bottom of the zoo!");
  } else {
    this.voronoi_metadata[center_most_lower].use = false;
    this.voronoi_metadata[center_most_lower].group = 5000;

    this.entrance = this.voronoi_metadata[center_most_lower];
  }
}


Game.prototype.designatePens = function() {
  this.number_of_pens = 0;
  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != null && this.voronoi_metadata[i].group != 5000) {
      this.number_of_pens += 1;
    }
  }
  console.log("There are " + this.number_of_pens + " pens.");

  ams = Object.keys(animals);
  shuffleArray(ams);
  
  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != null && this.voronoi_metadata[i].group != 5000) {
      if (ams.length > 0) {
        new_animal = ams.pop();
        this.voronoi_metadata[i].animal = new_animal;
        this.voronoi_metadata[i].land = animals[new_animal].land;
        this.voronoi_metadata[i].decorations = animals[new_animal].decorations;
      }
    }
  }
}


Game.prototype.drawMap = function() {
  var self = this;
  var screen = this.screens["zoo"];

  // Draw the path background
  let path_background = new PIXI.Graphics();
  path_background.beginFill(path_color);
  path_background.drawEllipse(0, 0, ellipse_size * ellipse_eccentricity, ellipse_size);
  path_background.endFill();
  this.map.background_layer.addChild(path_background);

  let new_path_background = new PIXI.TilingSprite(PIXI.Texture.from("Art/path_art_2.png"));
  new_path_background.position.set(0, 0);
  this.map.background_layer.addChild(new_path_background);

  // Draw the land background, using the unused voronoi cells to partially cover
  // the elliptical edges of the path background.
  let land_background = new PIXI.Graphics();
  land_background.lineStyle(0, 0x000000, 0);
  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == false && this.voronoi_metadata[i].group != 5000) {
      land_background.beginFill(background_color);
      let polygon = this.voronoi_metadata[i].polygon.flat();
      land_background.drawPolygon(polygon);
      land_background.endFill();
    }
  }
  this.map.background_layer.addChild(land_background);

  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != 5000) {
      this.voronoi_metadata[i].land_object = new PIXI.Container();
      this.voronoi_metadata[i].land_object.cx = this.voronoi_metadata[i].cx;
      this.voronoi_metadata[i].land_object.cy = this.voronoi_metadata[i].cy;

      // let grass_polygon = this.voronoi_metadata[i].grass_polygon.flat();

      // let grass = new PIXI.Graphics();
      // grass.beginFill(grass_color);
      // grass.drawPolygon(grass_polygon);
      // grass.endFill();
      // grass.true_color = grass_color;
      // grass.grey_color = grass_color;
      // this.voronoi_metadata[i].land_object.addChild(grass);

      let polygon = this.voronoi_metadata[i].polygon.flat();

      let ground = new PIXI.Graphics();
      ground.beginFill(0xFFFFFF);
      ground.drawPolygon(polygon);
      ground.endFill();

      ground.grey_color = 0xFFFFFF;

      if (this.voronoi_metadata[i].land == null || this.voronoi_metadata[i].land == "grass") {
        ground.true_color = grass_color;
      } else if (this.voronoi_metadata[i].land == "water") {
        ground.true_color = water_color;
      } else if (this.voronoi_metadata[i].land == "sand") {
        ground.true_color = sand_color;
      } else if (this.voronoi_metadata[i].land == "watergrass") {
        ground.true_color = water_color;
      } else if (this.voronoi_metadata[i].land == "waterice") {
        ground.true_color = water_color;
      }

      ground.tint = ground.true_color;
      this.voronoi_metadata[i].land_object.addChild(ground);

      if (this.voronoi_metadata[i].land == "watergrass" || this.voronoi_metadata[i].land == "waterice") {
        let super_ground = new PIXI.Graphics();
        super_ground.beginFill(0xFFFFFF);

        let polygon_left = [];
        for (let k = 0; k < this.voronoi_metadata[i].polygon.length; k++) {
          if (this.voronoi_metadata[i].polygon[k][0] <= this.voronoi_metadata[i].cx) {
            polygon_left.push(this.voronoi_metadata[i].polygon[k][0])
            polygon_left.push(this.voronoi_metadata[i].polygon[k][1]);
          }
        }
        polygon_left.push(polygon_left[0])
        polygon_left.push(polygon_left[1]);
        super_ground.drawPolygon(polygon_left);
        super_ground.endFill();

        super_ground.grey_color = 0xFEFEFE;
        if (this.voronoi_metadata[i].land == "watergrass") {
          super_ground.true_color = grass_color;
        } else if (this.voronoi_metadata[i].land == "waterice") {
          super_ground.true_color = ice_color;
        }

        super_ground.tint = super_ground.true_color;
        this.voronoi_metadata[i].land_object.addChild(super_ground);
      }


      // let filled = false;
      // if (this.voronoi_metadata[i].land == null || this.voronoi_metadata[i].land == "grass") {
      //   ground.beginFill(grass_color);
      // } else if (this.voronoi_metadata[i].land == "water") {
      //   ground.beginFill(water_color);
      // } else if (this.voronoi_metadata[i].land == "sand") {
      //   ground.beginFill(sand_color);
      // } else if (this.voronoi_metadata[i].land == "watergrass" || this.voronoi_metadata[i].land == "waterice") {
      //   ground.beginFill(water_color);
      //   let polygon_right = this.voronoi_metadata[i].polygon.flat();
      //   ground.drawPolygon(polygon_right);
      //   if (this.voronoi_metadata[i].land == "watergrass") {
      //     ground.beginFill(grass_color);
      //   } else if (this.voronoi_metadata[i].land == "waterice") {
      //     ground.beginFill(ice_color);
      //   }
      //   let polygon_left = [];
      //   for (let k = 0; k < this.voronoi_metadata[i].polygon.length; k++) {
      //     if (this.voronoi_metadata[i].polygon[k][0] <= this.voronoi_metadata[i].cx) {
      //       polygon_left.push(this.voronoi_metadata[i].polygon[k][0])
      //       polygon_left.push(this.voronoi_metadata[i].polygon[k][1]);
      //       //ground.beginFill(PIXI.utils.rgb2hex([k / 10, k / 10, k / 10]));
      //       //ground.drawCircle(this.voronoi_metadata[i].polygon[k][0], this.voronoi_metadata[i].polygon[k][1], 10);
      //     }
      //   }
      //   polygon_left.push(polygon_left[0])
      //   polygon_left.push(polygon_left[1]);
      //   ground.drawPolygon(polygon_left);
      //   filled = true;
      // }

      // let polygon = this.voronoi_metadata[i].polygon.flat();
      // if (!filled) {
      //   // console.log(polygon);
      //   ground.drawPolygon(polygon);
      // }
      // ground.endFill();

      // this.voronoi_metadata[i].land_object.addChild(ground);

      let border = new PIXI.Graphics();
      border.lineStyle(12, 0xFFFFFF, 1); //width, color, alpha
      let border_polygon = this.voronoi_metadata[i].polygon.flat();
      border.drawPolygon(border_polygon);
      let border_depth_1 = border.clone();
      border_depth_1.position.set(0,12);
      let border_depth_2 = border.clone();
      border_depth_2.position.set(0,24);

      border.true_color = pen_color;
      border_depth_1.true_color = pen_shadow_color;
      border_depth_2.true_color = pen_shadow_color;

      border.grey_color = greyscale_pen_color;
      border_depth_1.grey_color = greyscale_pen_shadow_color;
      border_depth_2.grey_color = greyscale_pen_shadow_color;

      border.tint = border.true_color;
      border_depth_1.tint = border_depth_1.true_color;
      border_depth_2.tint = border_depth_2.true_color;

      this.voronoi_metadata[i].land_object.addChild(border_depth_1);
      this.voronoi_metadata[i].land_object.addChild(border_depth_2);
      this.voronoi_metadata[i].land_object.addChild(border);


      this.terrain.push(this.voronoi_metadata[i].land_object)
    }
  }

  this.sortLayer(this.map.terrain_layer, this.terrain, true);
}


Game.prototype.populateZoo = function() {

  this.decorations = [];
  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != null && this.voronoi_metadata[i].group != 5000) {
      if (this.voronoi_metadata[i].decorations != null) {
        decoration_number = Math.random();
        for (let t = 0; t < 5; t++) {
          if (Math.random() > 0.3) {
            let decoration_type = pick(this.voronoi_metadata[i].decorations);
            let decoration = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/" + decoration_type + ".png"));
            let edge = pick(this.voronoi_metadata[i].polygon);
            let fraction = 0.3 + 0.5 * Math.random();
            decoration.position.set(
              (1-fraction) * this.voronoi_metadata[i].cx + (fraction) * edge[0],
              (1-fraction) * this.voronoi_metadata[i].cy + (fraction) * edge[1]);
            decoration.scale.set(1.2, 1.2);
            decoration.anchor.set(0.5,0.9);
            this.decorations.push(decoration);
            this.voronoi_metadata[i].decoration_objects.push(decoration);
          }
        }

        if (this.voronoi_metadata[i].animal != null) {
          this.voronoi_metadata[i].animal_objects = [];
          let animal_name = this.voronoi_metadata[i].animal;
          let num_animals_here = Math.ceil(2 * Math.random());
          if (animal_name == "OTTER") num_animals_here = 2;
          for (let n = 0; n < num_animals_here; n++) {
            let animal = this.makeAnimal(animal_name, this.voronoi_metadata[i]);
            animal.position.set(this.voronoi_metadata[i].cx - 36 + 72 * n, this.voronoi_metadata[i].cy - 36 + 72 * Math.random());
            // animal.position.set(this.voronoi_metadata[i].cx, this.voronoi_metadata[i].cy);
            this.decorations.push(animal);
            this.voronoi_metadata[i].animal_objects.push(animal);
            this.animals.push(animal);
            this.shakers.push(animal);
            this.shakers.push(this.voronoi_metadata[i].land_object);
          }
          
          // if (animal_name != "LION") animal_name = "RHINO";
          
        }

      }
    } else if (this.voronoi_metadata[i].use == false && this.voronoi_metadata[i].group == 5001) {
      // Add lots of trees just outside the perimeter
      for (let t = 0; t < 12; t++) {
        if (Math.random() > 0.4) {
          let decoration = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/tree.png"));
          let x = this.voronoi_metadata[i].cx - 300 + 600 * Math.random();
          let y = this.voronoi_metadata[i].cy - 300 + 600 * Math.random();
          if (this.testMove(x, y, false, "blah") == true) {
            decoration.position.set(x, y);
            decoration.scale.set(1.2, 1.2);
            decoration.anchor.set(0.5,0.9);
            this.decorations.push(decoration);
          }
        }
      }
    }
  }

  // Add zoo sign
  for (let i = 0; i < voronoi_size; i++) {
    if(this.voronoi_metadata[i].group == 5000) {
      let zoo = new PIXI.Sprite(PIXI.Texture.from("Art/alpha_zoo.png"));
      zoo.scale.set(1.2, 1.2);
      zoo.anchor.set(0.5, 0.8);
      zoo.position.set(this.voronoi_metadata[i].cx, this.voronoi_metadata[i].cy);
      this.decorations.push(zoo);
      // this.map.addChild(zoo);

      this.player.position.set(this.voronoi_metadata[i].cx, this.voronoi_metadata[i].cy);
      this.decorations.push(this.player);
    }
  }
}


Game.prototype.handleKeyUp = function(ev) {
  ev.preventDefault();

  this.keymap[ev.key] = null;
}


Game.prototype.handleKeyDown = function(ev) {
  var self = this;
  var screen = this.screens["zoo"];

  if (ev.key === "Tab") {
    ev.preventDefault();
  }

  let key = ev.key;

  this.keymap[key] = true;

  // if (key === "Escape") {
  //   this.player.position.set(this.entrance.cx, this.entrance.cy);
  // }

  if (this.typing_allowed && this.typing_ui.visible) {
    for (i in lower_array) {
      if (key === lower_array[i] || key === letter_array[i]) {
        this.addType(letter_array[i]);
      }
    }

    if (key === "Backspace" || key === "Delete") {
      this.deleteType();
    }
  } else if (this.display_typing_allowed && this.display_ui.visible) {
    for (i in lower_array) {
      if (key === lower_array[i] || key === letter_array[i]) {
        this.addDisplayType(letter_array[i]);
      }
    }

    if (key === "Backspace" || key === "Delete") {
      this.deleteDisplayType();
    }
  }
}


Game.prototype.addType = function(letter) {
  var self = this;
  var screen = this.screens["typing"];

  if (this.typing_text.text.length < this.animal_to_type.length) {
    if (this.animal_to_type[this.typing_text.text.length] == "_") {
      this.typing_text.text += " ";
    }
    this.typing_text.text += letter;
  }

  if (this.typing_text.text == this.animal_to_type.replace("_", " ")) {
    this.soundEffect("success");
    flicker(this.typing_text, 300, 0x000000, 0xFFFFFF);
    this.typing_allowed = false;

    let animal_to_type = this.animal_to_type;
    let animal_pen_to_fix = this.animal_pen_to_fix;

    delay(function() {
      self.ungrey(animal_pen_to_fix.cell_number);
      self.soundEffect("build");
      animal_pen_to_fix.land_object.shake = self.markTime();

      for (let i = 0; i < self.animal_pen_to_fix.polygon.length; i++) {
        let x = animal_pen_to_fix.polygon[i][0];
        let y = animal_pen_to_fix.polygon[i][1];
        self.makeSmoke(self.map.build_effect_layer, x, y, 1.8, 1.8);
      }

      self.hideTypingText();

      self.checkPenProximity(self.player.x, self.player.y, self.player.direction);

    }, 200);


    delay(function() {
      self.changeDisplayText(animal_to_type, animal_pen_to_fix);
      self.hideTypingText();
    }, 300);
  }
}


Game.prototype.deleteType = function() {
  var self = this;
  var screen = this.screens["zoo"];

  if (this.typing_text.text.length > 0) {
    if (this.typing_text.text[this.typing_text.text.length - 1] === " ") { 
      console.log("yes it does");
      this.typing_text.text = this.typing_text.text.slice(0,-1);
    }
    let l = this.typing_text.text.slice(-1,this.typing_text.text.length);
    let t = new PIXI.Text(l, {fontFamily: "Bebas Neue", fontSize: 140, fill: 0x000000, letterSpacing: 3, align: "left"});
    t.anchor.set(0,0.5);
    t.position.set(25 + 50 * (this.typing_text.text.length - 1), 93);
    t.vx = -20 + 40 * Math.random();
    t.vy = -5 + -20 * Math.random();
    t.floor = 1200;
    screen.addChild(t);
    this.freefalling.push(t);

    this.typing_text.text = this.typing_text.text.slice(0,-1);
    this.soundEffect("swipe");
  }
}


Game.prototype.addDisplayType = function(letter) {
  var self = this;
  var screen = this.screens["typing"];

  if (this.display_food_typing_text.text.length == 0 && this.display_poop_typing_text.text.length == 0) {
    if (letter === "P") {
      this.display_poop_typing_text.text += letter;
    } else {
      this.display_food_typing_text.text += letter;
    }
  } else if (this.display_poop_typing_text.text.length == 0 && this.display_food_typing_text.text.length < 4) {
    this.display_food_typing_text.text += letter;
  } else if (this.display_food_typing_text.text.length == 0 && this.display_poop_typing_text.text.length < 4) {
    this.display_poop_typing_text.text += letter;
  }

  if (this.display_food_typing_text.text == "FEED" || this.display_poop_typing_text.text == "POOP") {
    this.soundEffect("success");
  
    this.display_typing_allowed = false;

    delay(function() {
      self.display_food_typing_text.text = "";
      self.display_poop_typing_text.text = "";
      self.display_typing_allowed = true;
    }, 300);
  }

  if (this.display_food_typing_text.text == "FEED") {
    flicker(this.display_food_typing_text, 300, 0x000000, 0xFFFFFF);

    let food_types = ["greens"]
    if (carnivores.includes(this.animal_to_display)) {
      food_types = ["steak"];
    } else if (omnivores.includes(this.animal_to_display)) {
      food_types = ["greens", "steak", "fruit"];
    }
    let food_type = pick(food_types);

    let sheet = PIXI.Loader.shared.resources["Art/Food/" + food_type + ".json"].spritesheet
    let food = new PIXI.AnimatedSprite(sheet.animations[food_type]);
    food.scale.set(0.75, 0.75);
    food.type = food_type;
    food.start_x = this.player.x;
    food.start_y = this.player.y + 1;
    food.end_x = this.animal_pen_to_display.cx - 32 + 64 * Math.random();
    food.end_y = this.animal_pen_to_display.cy - 32 + 64 * Math.random();
    food.anchor.set(0.5,0.75)
    food.position.set(food.start_x, food.start_y);
    food.interpolation = 0;
    food.state = "flying";
    food.parent = this.map.decoration_layer;
    food.animal_target = this.animal_to_display;
    // this.map.decoration_layer.addChild(food);
    this.decorations.push(food);
    this.foods.push(food);
    console.log(food);
  } else if (this.display_poop_typing_text.text == "POOP") {
    flicker(this.display_poop_typing_text, 300, 0x000000, 0xFFFFFF);

    console.log(this.animal_pen_to_display)
    let current_animal = pick(this.animal_pen_to_display.animal_objects);
    self.soundEffect("poop_" + Math.ceil(Math.random() * 3));
    for(let i = 0; i <= 600; i+= 300) {
      delay(function() {
        let b = current_animal.global_butt_coords();
      
        let poop_shard = new PIXI.Graphics();
        poop_shard.beginFill(poop_color);
        poop_shard.drawPolygon([
          -4, -6,
          2 + 4 * Math.random(), -4 - 4 * Math.random(),
          6 + 5 * Math.random(), 4 + 4 * Math.random(),
          -6 - 5 * Math.random(), 4 + 4 * Math.random(),
          -4, -6,
        ]);
        poop_shard.position.set(b[0], b[1]);
        poop_shard.endFill();
        // let poop_shard = new PIXI.Sprite(PIXI.Texture.from("Art/poop.png"));
        // poop_shard.anchor.set(0.5, 0.5);
        // poop_shard.position.set(x, y);
        poop_shard.vx = -1 - 1.5 * Math.random();
        if (current_animal.direction < 0) poop_shard.vx *= -1;
        poop_shard.vy = 0;
        poop_shard.gravity = 1;
        poop_shard.floor = b[1] + 50;
        poop_shard.parent = self.map.decoration_layer;
        self.map.decoration_layer.addChild(poop_shard);
        self.decorations.push(poop_shard);

        console.log(poop_shard);
        self.drops.push(poop_shard);

        delay(function() {
          poop_shard.parent.removeChild(poop_shard);
          poop_shard.status = "dead";
        }, 2000 + Math.random() * 2000);

      }, i);
    }
  }
}


Game.prototype.deleteDisplayType = function() {
  var self = this;
  var screen = this.screens["zoo"];

  if (this.display_food_typing_text.text.length > 0) {
    let l = this.display_food_typing_text.text.slice(-1,this.display_food_typing_text.text.length);
    let t = new PIXI.Text(l, {fontFamily: "Bebas Neue", fontSize: 80, fill: 0x000000, letterSpacing: 3, align: "left"});
    t.anchor.set(0,1);
    t.position.set(130 + 28 * (this.display_food_typing_text.text.length - 1), 855);
    t.vx = -20 + 40 * Math.random();
    t.vy = -5 + -20 * Math.random();
    t.floor = 1200;
    screen.addChild(t);
    this.freefalling.push(t);

    this.display_food_typing_text.text = this.display_food_typing_text.text.slice(0,-1);
    this.soundEffect("swipe");
  } else if (this.display_poop_typing_text.text.length > 0) {
    let l = this.display_poop_typing_text.text.slice(-1,this.display_poop_typing_text.text.length);
    let t = new PIXI.Text(l, {fontFamily: "Bebas Neue", fontSize: 80, fill: 0x000000, letterSpacing: 3, align: "left"});
    t.anchor.set(0,1);
    t.position.set(130 + 28 * (this.display_poop_typing_text.text.length - 1), 945);
    t.vx = -20 + 40 * Math.random();
    t.vy = -5 + -20 * Math.random();
    t.floor = 1200;
    screen.addChild(t);
    this.freefalling.push(t);

    this.display_poop_typing_text.text = this.display_poop_typing_text.text.slice(0,-1);
    this.soundEffect("swipe");
  }
}


Game.prototype.changeTypingText = function(new_word, found_pen) {
  var self = this;
  var screen = this.screens["zoo"];

  this.animal_to_type = new_word;
  this.animal_pen_to_fix = found_pen;
  
  if (this.typing_backing != null) {
    this.typing_ui.removeChild(this.typing_backing);
    this.typing_backing.destroy();
  }

  if (this.typing_picture != null) {
    this.typing_ui.removeChild(this.typing_picture);
    this.typing_picture.destroy();
  }

  let measure = new PIXI.TextMetrics.measureText(new_word, this.typing_text.style);
  // sign_backing.width = measure.width + 6;
  // sign_backing.height = measure.height + 6;

  if (!(this.animal_to_type in animated_animals)) {
    this.typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Animals/" + this.animal_to_type.toLowerCase() + ".png"));
  } else {
    console.log(this.animal_to_type);
    var sheet = PIXI.Loader.shared.resources["Art/Animals/" + this.animal_to_type.toLowerCase() + ".json"].spritesheet;
    this.typing_picture = new PIXI.AnimatedSprite(sheet.animations[this.animal_to_type.toLowerCase()]);
  }
  
  this.typing_picture.anchor.set(0.5, 0.77);
  this.typing_picture.scale.set(0.7, 0.7);
  this.typing_picture.position.set(110 + measure.width, 133);

  this.typing_backing = new PIXI.Graphics();
  this.typing_backing.beginFill(0xFFFFFF, 1);
  this.typing_backing.drawRoundedRect(-20, -20, measure.width + 180, 120, 20);
  for (let i = 0; i < measure.width + 200; i += 40 + Math.floor(Math.random() * 20)) {
    //this.typing_backing.drawRoundedRect(-20, -20, 500, 180, 20);
    this.typing_backing.drawCircle(i, 120 + 40 * Math.random() - 40 * (i / (measure.width + 200)), 50 + 30 * Math.random());
  }
  this.typing_backing.drawCircle(measure.width + 200, 10 + 30 * Math.random(), 50 + 30 * Math.random());
  this.typing_backing.endFill();
  this.typing_backing.filters = [this.dropshadow_filter];

  this.grey_text.text = new_word.replace("_", " ");
  this.typing_text.text = "";

  this.typing_ui.addChild(this.typing_backing);
  this.typing_ui.addChild(this.typing_picture);
  this.typing_ui.addChild(this.grey_text);
  this.typing_ui.addChild(this.typing_text);

  if (!this.typing_ui.visible) {
    this.typing_ui.visible = true;
    this.typing_ui.position.set(0, -300);
  }
  new TWEEN.Tween(this.typing_ui)
    .to({y: 0})
    .duration(250)
    .start()
    .onUpdate(function() {
      self.typing_ui.visible = true;
    })
    .onComplete(function() {
      self.typing_allowed = true;
      self.typing_ui.visible = true;
    });
}


Game.prototype.changeDisplayText = function(new_word, found_pen) {
  var self = this;
  var screen = this.screens["zoo"];

  this.animal_to_display = new_word;
  this.animal_pen_to_display = found_pen;

  this.display_food_typing_text.text = "";

  // if (Math.random() > 0.65) {
  //   this.soundEffect(this.animal_to_display.toLowerCase());
  // }

  let measure = new PIXI.TextMetrics.measureText(new_word, this.display_text.style);

  this.display_backing.position.set(1280 - (measure.width + 50), 960 - 30)

  this.display_text.text = new_word.replace("_", " ");

  if (!this.display_ui.visible) {
    this.display_ui.visible = true;
    this.display_ui.position.set(0, 300);
  }
  new TWEEN.Tween(this.display_ui)
    .to({y: 0})
    .duration(250)
    .start()
    .onUpdate(function() {
      self.display_ui.visible = true;
    })
    .onComplete(function() {
      self.display_typing_allowed = true;
      self.display_ui.visible = true;
    });
}


Game.prototype.hideTypingText = function() {
  var self = this;
  var screen = this.screens["zoo"];

  this.typing_allowed = false;
  this.animal_pen_to_fix = null;
  this.animal_to_type = "";
  new TWEEN.Tween(this.typing_ui)
    .to({y: -300})
    .duration(250)
    .start()
    .onComplete(function() {
      self.typing_ui.visible = false;
    });
}


Game.prototype.hideDisplayText = function() {
  var self = this;
  var screen = this.screens["zoo"];

  this.display_typing_allowed = false;
  this.animal_pen_to_display = null;

  this.animal_to_display = "";
  new TWEEN.Tween(this.display_ui)
    .to({y: 300})
    .duration(250)
    .start()
    .onComplete(function() {
      self.display_ui.visible = false;
    });
}


Game.prototype.grey = function(cell_number) {
  this.voronoi_metadata[cell_number].state = "grey";
  if (this.voronoi_metadata[cell_number].animal_objects != null) {
    for (let j = 0; j < this.voronoi_metadata[cell_number].animal_objects.length; j++) {
      this.voronoi_metadata[cell_number].animal_objects[j].alpha = 0.4;
      if (j > 0) this.voronoi_metadata[cell_number].animal_objects[j].visible = false;
    }
    for (let j = 0; j < this.voronoi_metadata[cell_number].land_object.children.length; j++) {
      let land = this.voronoi_metadata[cell_number].land_object.children[j];
      land.tint = land.grey_color;
    }
  }
  for (let j = 0; j < this.voronoi_metadata[cell_number].decoration_objects.length; j++) {
    this.voronoi_metadata[cell_number].decoration_objects[j].visible = false;
  }
}


Game.prototype.ungrey = function(cell_number) {

  this.voronoi_metadata[cell_number].land_object.filters  = [];

  this.voronoi_metadata[cell_number].state = "ungrey";
  if (this.voronoi_metadata[cell_number].animal_objects != null) {
    for (let j = 0; j < this.voronoi_metadata[cell_number].animal_objects.length; j++) {
      this.voronoi_metadata[cell_number].animal_objects[j].alpha  = 1;
      this.voronoi_metadata[cell_number].animal_objects[j].visible = true;
    }
    for (let j = 0; j < this.voronoi_metadata[cell_number].land_object.children.length; j++) {
      let land = this.voronoi_metadata[cell_number].land_object.children[j];
      land.tint = land.true_color;
    }
  }
  for (let j = 0; j < this.voronoi_metadata[cell_number].decoration_objects.length; j++) {
    this.voronoi_metadata[cell_number].decoration_objects[j].visible = true;
  }
}


Game.prototype.greyAll = function() {
  for (let i = 0; i < voronoi_size; i++) {
    if(this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != 5000) {
      this.grey(i);
    }
  }
}


Game.prototype.ungreyAll = function() {
  for (let i = 0; i < voronoi_size; i++) {
    if(this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != 5000) {
      this.ungrey(i);
    }
  }
}


Game.prototype.greyAnimalPens = function() {
  for (let i = 0; i < voronoi_size; i++) {
    if(this.voronoi_metadata[i].use == true 
      && this.voronoi_metadata[i].group != 5000
      && this.voronoi_metadata[i].animal != null) {
      this.grey(i);
    }
  }
}


Game.prototype.sortLayer = function(layer_name, layer_object_list, artificial_y = false) {
  if (layer_object_list == null || layer_object_list.length == 0) return;

  if (artificial_y) {
    layer_object_list.sort(function(a,b) {
      return a.cy - b.cy;
    })
  } else {
    layer_object_list.sort(function(a,b) {
      return a.y - b.y;
    })
  }

  while(layer_name.children[0]) {
    let x = layer_name.removeChild(layer_name.children[0]);
  }

  for (let i = 0; i < layer_object_list.length; i++) {
    if (!(layer_object_list[i].status == "dead")) {
      layer_name.addChild(layer_object_list[i]);
    }
  }
}



Game.prototype.shakeDamage = function() {
  var self = this;
  var screen = this.screens["zoo"];

  // for (let item of [screen, this.player_area, this.enemy_area]) {
  for (let item of this.shakers) {
    if (item.shake != null) {
      if (item.permanent_x == null) item.permanent_x = item.position.x;
      if (item.permanent_y == null) item.permanent_y = item.position.y;
      item.position.set(item.permanent_x - 3 + Math.random() * 6, item.permanent_y - 3 + Math.random() * 6)
      if (this.timeSince(item.shake) >= 150) {
        item.shake = null;
        item.position.set(item.permanent_x, item.permanent_y)
      }
    }
  }
}


Game.prototype.poopsAndFoods = function(fractional) {
  var self = this;
  var screen = this.screens[this.current_screen];

  for (let i = 0; i < this.foods.length; i++) {
    let food = this.foods[i];
    if (food.interpolation < 1) {
      food.interpolation += 0.05;
      food.position.set(
        (1 - food.interpolation) * food.start_x + food.interpolation * food.end_x,
        (1 - food.interpolation) * food.start_y + food.interpolation * food.end_y - 50 * Math.sin(food.interpolation * Math.PI),
      )
      if (food.interpolation >= 1) {
        food.interpolation = 1;
        food.status = "ground";
        food.position.set(food.end_x, food.end_y);
      }
    }
  }

  for (let i = 0; i < this.drops.length; i++) {
    let item = this.drops[i];
    if (item.position.y < item.floor) {
      item.position.x += item.vx * fractional;
      item.position.y += item.vy * fractional;
      item.vy += item.gravity * fractional;
    } else {
      item.position.y = item.floor;
    }
  }

  let new_drops = [];
  for (let i = 0; i < this.drops.length; i++) {
    let item = this.drops[i];
    if (item.status != "dead") {
      new_drops.push(item);
    }
  }
  this.drops = new_drops;
}


Game.prototype.freeeeeFreeeeeFalling = function(fractional) {
  var self = this;
  var screen = this.screens[this.current_screen];

  for (let i = 0; i < this.freefalling.length; i++) {
    let item = this.freefalling[i];
    item.position.x += item.vx * fractional;
    item.position.y += item.vy * fractional;
    if (item.gravity != null) {
      item.vy += item.gravity * fractional;
    } else {
      item.vy += this.gravity * fractional;
    }
    
    if (item.floor != null && item.position.y > item.floor) {
      if (item.parent != null) {
        item.parent.removeChild(item);
      }
      item.status = "dead";
    }
  }

  let new_freefalling = [];
  for (let i = 0; i < this.freefalling.length; i++) {
    let item = this.freefalling[i];
    if (item.status != "dead") {
      new_freefalling.push(item);
    }
  }
  this.freefalling = new_freefalling;
}


Game.prototype.updatePlayer = function() {
  var self = this;
  var keymap = this.keymap;
  var player = this.player;

  if (keymap["ArrowUp"] && keymap["ArrowRight"]) {
    player.direction = "upright";
  } else if (keymap["ArrowUp"] && keymap["ArrowLeft"]) {
    player.direction = "upleft";
  } else if (keymap["ArrowDown"] && keymap["ArrowRight"]) {
    player.direction = "downright";
  } else if (keymap["ArrowDown"] && keymap["ArrowLeft"]) {
    player.direction = "downleft";
  } else if (keymap["ArrowDown"]) {
    player.direction = "down";
  } else if (keymap["ArrowUp"]) {
    player.direction = "up";
  } else if (keymap["ArrowLeft"]) {
    player.direction = "left";
  } else if (keymap["ArrowRight"]) {
    player.direction = "right";
  } else {
    player.direction = null;
  }

  if (this.testMove(player.x, player.y, true, player.direction)) {
    if (player.direction != null && this.title_image.visible == true && this.title_image.alpha == 1) {
      new TWEEN.Tween(this.title_image)
        .to({alpha: 0})
        .duration(1000)
        .start()
        .onUpdate(function() {
        })
        .onComplete(function() {
          self.title_image.visible = false;
        });
    }

    player.move();

    if (player.direction != null) {
      this.checkPenProximity(player.x, player.y, player.direction);
    }
  } else if (player.direction != null) {
    player.updateDirection();
  }
}


Game.prototype.testMove = function(x, y, use_bounds, direction) {
  let tx = x;
  let ty = y;

  if (direction == "right") tx += 30;
  if (direction == "left") tx -= 30;
  if (direction == "up") ty -= 30;
  if (direction == "down") ty += 48;
  if (direction == "downright") {
    tx += 30;
    ty += 48;
  }
  if (direction == "downleft") {
    tx -= 30;
    ty += 48;
  }
  if (direction == "upright") {
    tx += 30;
    ty -= 30;
  }
  if (direction == "upleft") {
    tx -= 30;
    ty -= 30;
  }

  if (use_bounds) {
    if (tx >= this.right_bound
      || tx <= this.left_bound
      || ty <= this.upper_bound
      || ty >= this.lower_bound) return false;
  }

  // if (direction == "up")
  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != null) {
      if (pointInsidePolygon([tx, ty], this.voronoi_metadata[i].polygon)) {
        return false;
      }
    }
  }

  return true;
}


Game.prototype.checkPenProximity = function(x, y, direction) {
  // Check proximity to any animal pens, first by casting a ray,
  // Then falling back on a small radius.

  let found_pen = null;
  for (let r = 1; r < 5; r++) {
    let tx = x;
    let ty = y;
    if (direction == "right") tx += 60*r;
    if (direction == "left") tx -= 60*r;
    if (direction == "up") ty -= 60*r;
    if (direction == "down") ty += 60*r;
    if (direction == "downright") {
      tx += 42*r;
      ty += 42*r;
    }
    if (direction == "downleft") {
      tx -= 42*r;
      ty += 42*r;
    }
    if (direction == "upright") {
      tx += 42*r;
      ty -= 42*r;
    }
    if (direction == "upleft") {
      tx -= 42*r;
      ty -= 42*r;
    }

    for (let i = 0; i < voronoi_size; i++) {
      if (this.voronoi_metadata[i].use == true
        && this.voronoi_metadata[i].group != null
        && this.voronoi_metadata[i].animal_objects != null) {
        if (pointInsidePolygon([tx, ty], this.voronoi_metadata[i].polygon)) {
          found_pen = this.voronoi_metadata[i];

          break;
        }
      }
    }
    if (found_pen != null) break;
  }

  if (found_pen == null) {
    for (let a = 0; a < 360; a += 45) {
      let tx = x + 120 * Math.cos(Math.PI / 180 * a);
      let ty = y + 120 * Math.sin(Math.PI / 180 * a);

      for (let i = 0; i < voronoi_size; i++) {
        if (this.voronoi_metadata[i].use == true
          && this.voronoi_metadata[i].group != null
          && this.voronoi_metadata[i].animal_objects != null) {
          if (pointInsidePolygon([tx, ty], this.voronoi_metadata[i].polygon)) {
            found_pen = this.voronoi_metadata[i];
            break;
          }
        }
      }
    }
  }

  if (found_pen != null) {
    if (found_pen.animal != this.animal_to_type && found_pen.state == "grey") {
      // console.log("typing");
      this.changeTypingText(found_pen.animal, found_pen);
      if (this.display_ui.visible == true) {
        this.hideDisplayText();
      }
    } else if (found_pen.animal != this.animal_to_display && found_pen.state == "ungrey") {
      // console.log("display");
      this.changeDisplayText(found_pen.animal, found_pen);
      if (this.typing_ui.visible == true) {
        this.hideTypingText();
      }
    }
  }

  if (found_pen == null) {
    if (this.typing_allowed) this.hideTypingText();
    this.hideDisplayText();
  }
}


Game.prototype.updateZoo = function(diff) {
  var self = this;
  var screen = this.screens["zoo"];

  if(this.player == null) return;

  this.updatePlayer();

  if(true) {
    if (this.timeSince(this.start_time) < 2000) {
      this.map.position.set(640 - this.player.x, 500 * ((2000 - this.timeSince(this.start_time)) / 2000) + 580 - this.player.y);
    } else {
      this.map.position.set(640 - this.player.x, 580 - this.player.y);  
    }
  } else {
    this.map.scale.set(0.1, 0.1);
  }

  
  

  for (let i = 0; i < this.animals.length; i++) {
    if (this.animals[i].pen.state == "ungrey") {
      this.animals[i].update();
    }
  }

  this.sortLayer(this.map.decoration_layer, this.decorations);

  let fractional = diff / (1000/30.0);

  this.shakeDamage();
  this.freeeeeFreeeeeFalling(fractional);
  this.poopsAndFoods(fractional);

}