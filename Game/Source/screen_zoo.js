
Game.prototype.initializeZoo = function() {
  var self = this;
  var screen = this.screens["zoo"];
  this.clearScreen(screen);

  this.freefalling = [];
  this.shakers = [];

  this.terrain = [];
  this.decorations = [];
  this.animals = [];

  this.keymap = {};

  this.game_phase = "typing";

  this.resetZooScreen();
}

let zoo_size = 30;

let voronoi_size = 200;
let relaxation_number = 10;
let ellipse_size = 100;
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

// this should be 6. it looks good at 6.
let map_scale = 6;

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
  this.map.scale.set(map_scale, map_scale);
  screen.addChild(this.map);

  this.map.background_layer = new PIXI.Container();
  this.map.addChild(this.map.background_layer);

  this.map.build_effect_layer = new PIXI.Container();
  this.map.addChild(this.map.build_effect_layer);

  this.map.terrain_layer = new PIXI.Container();
  this.map.addChild(this.map.terrain_layer);

  this.map.decoration_layer = new PIXI.Container();
  this.map.addChild(this.map.decoration_layer);

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


  this.display_ui = new PIXI.Container();
  this.ui_layer.addChild(this.display_ui);

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
      animal_object: null,
      sign: null,
      state: "ungrey",
      cell_number: i,
    });
  }

  for (let r = 0; r < relaxation_number; r++) {
    lloydRelaxation(this.voronoi_points, 320, 240);
  }

  for (let i = 0; i < voronoi_size; i++) {
    this.voronoi_points[i][0] *= 4;
    this.voronoi_points[i][1] *= 4;
  }

  this.delaunay = d3.Delaunay.from(this.voronoi_points);
  this.voronoi_vertices = this.delaunay.voronoi([0, 0, 1280, 960]);

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
    console.log("Iteration " + ellipse_size);
    cell_count = 0;

    for (let i = 0; i < voronoi_size; i++) {
      let p = this.voronoi_points[i];
      let px = p[0] - 640;
      let py = p[1] - 480;
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
  for (let i = 0; i < voronoi_size; i++) {
    if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group == null) {
      this.markGroup(i, group_num, group_count);
      group_num += 1;
      group_count = 0;
    }
  }

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

      for (let j = 0; j < this.voronoi_metadata[i].polygon.length; j++) {
        let point = this.voronoi_metadata[i].polygon[j];

        // percentage shrink version
        if (this.voronoi_metadata[i].group == 0) {
          point[0] = 1.1 * point[0] + (1 - 1.1) * gcx;
          point[1] = 1.1 * point[1] + (1 - 1.1) * gcy;
        } else {
          point[0] = shrink_factor * point[0] + (1 - shrink_factor) * gcx;
          point[1] = shrink_factor * point[1] + (1 - shrink_factor) * gcy;
        }

        point[0] -= 640;
        point[1] -= 480;
        

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

        point[0] -= 640;
        point[1] -= 480;
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

  this.left_bound -= 50;
  this.right_bound += 50;
  this.upper_bound -= 50;
  this.lower_bound += 50;

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

      let ground = new PIXI.Graphics();

      let filled = false;
      if (this.voronoi_metadata[i].land == null || this.voronoi_metadata[i].land == "grass") {
        ground.beginFill(grass_color);
      } else if (this.voronoi_metadata[i].land == "water") {
        ground.beginFill(water_color);
      } else if (this.voronoi_metadata[i].land == "sand") {
        ground.beginFill(sand_color);
      } else if (this.voronoi_metadata[i].land == "watergrass" || this.voronoi_metadata[i].land == "waterice") {
        ground.beginFill(water_color);
        let polygon_right = this.voronoi_metadata[i].polygon.flat();
        ground.drawPolygon(polygon_right);
        if (this.voronoi_metadata[i].land == "watergrass") {
          ground.beginFill(grass_color);
        } else if (this.voronoi_metadata[i].land == "waterice") {
          ground.beginFill(ice_color);
        }
        let polygon_left = [];
        for (let k = 0; k < this.voronoi_metadata[i].polygon.length; k++) {
          if (this.voronoi_metadata[i].polygon[k][0] <= this.voronoi_metadata[i].cx) {
            polygon_left.push(this.voronoi_metadata[i].polygon[k][0])
            polygon_left.push(this.voronoi_metadata[i].polygon[k][1]);
            //ground.beginFill(PIXI.utils.rgb2hex([k / 10, k / 10, k / 10]));
            //ground.drawCircle(this.voronoi_metadata[i].polygon[k][0], this.voronoi_metadata[i].polygon[k][1], 10);
          }
        }
        polygon_left.push(polygon_left[0])
        polygon_left.push(polygon_left[1]);
        ground.drawPolygon(polygon_left);
        console.log(polygon_left);
        filled = true;
      }

      let polygon = this.voronoi_metadata[i].polygon.flat();
      if (!filled) {
        // console.log(polygon);
        ground.drawPolygon(polygon);
      }
      ground.endFill();

      this.voronoi_metadata[i].land_object.addChild(ground);

      let border = new PIXI.Graphics();
      border.lineStyle(2, 0x754c25, 1); //width, color, alpha
      let border_polygon = this.voronoi_metadata[i].polygon.flat();
      border.drawPolygon(border_polygon);
      let border_depth_1 = border.clone();
      border_depth_1.position.set(0,2);
      border_depth_1.tint = 0xAAAAAA;
      let border_depth_2 = border.clone();
      border_depth_2.position.set(0,4);
      border_depth_2.tint = 0xAAAAAA;
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
            let decoration_type = this.voronoi_metadata[i].decorations[Math.floor(Math.random() * this.voronoi_metadata[i].decorations.length)];
            let decoration = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/" + decoration_type + ".png"));
            let edge = this.voronoi_metadata[i].polygon[Math.floor(Math.random() * this.voronoi_metadata[i].polygon.length)];
            let fraction = 0.3 + 0.5 * Math.random();
            decoration.position.set(
              (1-fraction) * this.voronoi_metadata[i].cx + (fraction) * edge[0],
              (1-fraction) * this.voronoi_metadata[i].cy + (fraction) * edge[1]);
            decoration.scale.set(0.2, 0.2);
            decoration.anchor.set(0.5,0.9);
            this.decorations.push(decoration);
            this.voronoi_metadata[i].decoration_objects.push(decoration);
          }
        }

        if (this.voronoi_metadata[i].animal != null) {
          this.voronoi_metadata[i].animal_object = [];
          let animal_name = this.voronoi_metadata[i].animal;
          let num_animals_here = Math.ceil(2 * Math.random());
          if (animal_name == "OTTER") num_animals_here = 2;
          for (let n = 0; n < num_animals_here; n++) {
            let animal = this.makeAnimal(animal_name, this.voronoi_metadata[i]);
            animal.position.set(this.voronoi_metadata[i].cx - 6 + 12 * n, this.voronoi_metadata[i].cy - 6 + 12 * Math.random());
            // animal.position.set(this.voronoi_metadata[i].cx, this.voronoi_metadata[i].cy);
            this.decorations.push(animal);
            this.voronoi_metadata[i].animal_object.push(animal);
            this.animals.push(animal);
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
          let x = this.voronoi_metadata[i].cx - 50 + 100 * Math.random();
          let y = this.voronoi_metadata[i].cy - 50 + 100 * Math.random();
          if (this.testMove(x, y, false, "blah") == true) {
            decoration.position.set(x, y);
            decoration.scale.set(0.2, 0.2);
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
      zoo.scale.set(0.2, 0.2);
      zoo.anchor.set(0.5, 0.8);
      zoo.position.set(this.voronoi_metadata[i].cx, this.voronoi_metadata[i].cy);
      this.decorations.push(zoo);
      // this.map.addChild(zoo);

      this.player.position.set(this.voronoi_metadata[i].cx, this.voronoi_metadata[i].cy);
      this.decorations.push(this.player);
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

    delay(function() {
      self.ungrey(self.animal_pen_to_fix.cell_number);
      self.soundEffect("build");
      self.animal_pen_to_fix.land_object.shake = self.markTime();

      for (let i = 0; i < self.animal_pen_to_fix.polygon.length; i++) {
        let x = self.animal_pen_to_fix.polygon[i][0];
        let y = self.animal_pen_to_fix.polygon[i][1];
        self.makeSmoke(self.map.build_effect_layer, x, y, 0.3, 0.3);
      }

      self.hideTypingText();

      self.checkPenProximity(self.player.x, self.player.y, self.player.direction);

    }, 200)

    delay(function() {
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
    screen.addChild(t);
    this.freefalling.push(t);

    this.typing_text.text = this.typing_text.text.slice(0,-1);
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


Game.prototype.changeDisplayText = function(new_word) {
  var self = this;
  var screen = this.screens["zoo"];

  this.animal_to_display = new_word;

  if (Math.random() > 0.65) {
    this.soundEffect(this.animal_to_display.toLowerCase());
  }

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
  // this.voronoi_metadata[cell_number].land_object.alpha = 0.35;
  this.voronoi_metadata[cell_number].land_object.filters  = [this.greyscale_filter];
  if (this.voronoi_metadata[cell_number].animal_object != null) {
    //this.voronoi_metadata[cell_number].animal_object.alpha = 0.35;
    for (let j = 0; j < this.voronoi_metadata[cell_number].animal_object.length; j++) {
      this.voronoi_metadata[cell_number].animal_object[j].filters = [this.greyscale_filter];
    }
  }
  for (let j = 0; j < this.voronoi_metadata[cell_number].decoration_objects.length; j++) {
    // this.voronoi_metadata[cell_number].decoration_objects[j].alpha = 0.35;
    this.voronoi_metadata[cell_number].decoration_objects[j].filters = [this.greyscale_filter];
  }
}


Game.prototype.ungrey = function(cell_number) {

  this.voronoi_metadata[cell_number].land_object.filters  = [];

  this.voronoi_metadata[cell_number].state = "ungrey";
  this.voronoi_metadata[cell_number].land_object.alpha = 1;
  if (this.voronoi_metadata[cell_number].animal_object != null) {
    for (let j = 0; j < this.voronoi_metadata[cell_number].animal_object.length; j++) {
      this.voronoi_metadata[cell_number].animal_object[j].alpha  = 1;
      this.voronoi_metadata[cell_number].animal_object[j].filters  = [];
    }
  }
  for (let j = 0; j < this.voronoi_metadata[cell_number].decoration_objects.length; j++) {
    this.voronoi_metadata[cell_number].decoration_objects[j].alpha = 1;
    this.voronoi_metadata[cell_number].decoration_objects[j].filters = [];
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
    layer_name.addChild(layer_object_list[i]);
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

  if (this.typing_allowed) {
    if (this.game_phase == "typing") {
      for (i in lower_array) {
        if (key === lower_array[i] || key === letter_array[i]) {
          this.addType(letter_array[i]);
        }
      }
    }

    if (key === "Backspace" || key === "Delete") {
      this.deleteType();
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
      item.position.set(item.permanent_x - 3/5 + Math.random() * 6/5, item.permanent_y - 3/5 + Math.random() * 6/5)
      if (this.timeSince(item.shake) >= 150) {
        item.shake = null;
        item.position.set(item.permanent_x, item.permanent_y)
      }
    }
  }
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
    
    // TODO: this needs to be 200 for the player areas and 960 for the screen in total.
    if (item.position.y > 1160 || item.alpha < 0.04 || (item.floor != null && item.position.y > item.floor)) {
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
    player.move();

    if (player.direction != null) {
      this.checkPenProximity(player.x, player.y, player.direction);
    }
  }
}


Game.prototype.testMove = function(x, y, use_bounds, direction) {
  let tx = x;
  let ty = y;

  if (direction == "right") tx += 5;
  if (direction == "left") tx -= 5;
  if (direction == "up") ty -= 5;
  if (direction == "down") ty += 8;
  if (direction == "downright") {
    tx += 5;
    ty += 8;
  }
  if (direction == "downleft") {
    tx -= 5;
    ty += 8;
  }
  if (direction == "upright") {
    tx += 5;
    ty -= 5;
  }
  if (direction == "upleft") {
    tx -= 5;
    ty -= 5;
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
  for (let r = 1; r < 7; r++) {
    let tx = x;
    let ty = y;
    if (direction == "right") tx += 10*r;
    if (direction == "left") tx -= 10*r;
    if (direction == "up") ty -= 10*r;
    if (direction == "down") ty += 10*r;
    if (direction == "downright") {
      tx += 7*r;
      ty += 7*r;
    }
    if (direction == "downleft") {
      tx -= 7*r;
      ty += 7*r;
    }
    if (direction == "upright") {
      tx += 7*r;
      ty -= 7*r;
    }
    if (direction == "upleft") {
      tx -= 7*r;
      ty -= 7*r;
    }

    for (let i = 0; i < voronoi_size; i++) {
      if (this.voronoi_metadata[i].use == true
        && this.voronoi_metadata[i].group != null
        && this.voronoi_metadata[i].animal_object != null) {
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
      let tx = x + 20 * Math.cos(Math.PI / 180 * a);
      let ty = y + 20 * Math.sin(Math.PI / 180 * a);

      for (let i = 0; i < voronoi_size; i++) {
        if (this.voronoi_metadata[i].use == true
          && this.voronoi_metadata[i].group != null
          && this.voronoi_metadata[i].animal_object != null) {
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
      this.changeDisplayText(found_pen.animal);
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

  this.map.position.set(640-map_scale*this.player.x, 480-map_scale*this.player.y);

  for (let i = 0; i < this.animals.length; i++) {
    if (this.animals[i].pen.state == "ungrey") {
      this.animals[i].update();
    }
  }

  this.sortLayer(this.map.decoration_layer, this.decorations);

  let fractional = diff / (1000/30.0);

  this.shakeDamage();
  this.freeeeeFreeeeeFalling(fractional);

}