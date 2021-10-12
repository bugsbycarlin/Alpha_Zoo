
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

  this.dropshadow_filter = new PIXI.filters.DropShadowFilter();
  this.dropshadow_filter.blur  = 2;
  this.dropshadow_filter.quality = 3;
  this.dropshadow_filter.alpha = 0.55;
  this.dropshadow_filter.distance = 8;
  this.dropshadow_filter.rotation = 45;

  // this.path_shadow_filter = new PIXI.filters.DropShadowFilter();
  // this.path_shadow_filter.blur  = 0;
  // this.path_shadow_filter.alpha = 1;
  // this.path_shadow_filter.color = 0xb2aca8;
  // this.path_shadow_filter.distance = 8;
  // this.path_shadow_filter.rotation = 90;

  this.resetZooScreen();

  this.map.scale.set(1,1);
}

let background_color = 0x318115;
let path_color = 0xf9e6bb;
let grass_color = 0xb1d571;
let forest_color = 0x518f40;
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

let square_width = 900;
let total_ents = 150;

Game.prototype.resetZooScreen = function() {
  var self = this;
  var screen = this.screens["zoo"];

  this.zoo_mode = "active"; // active, ferris_wheel

  // Make the map
  this.initializeMap();
  this.makeMapGroups();
  this.makeMapPath();
  this.makeMapPens();

  // Make the title image
  this.title_image = new PIXI.Sprite(PIXI.Texture.from("Art/alpha_zoo_title.png"));
  this.title_image.width = this.width;
  this.title_image.height = this.height;
  screen.addChild(this.title_image);

  // Make the ui layer
  this.makeUI();

  // Populate the map with things
  this.designatePens();
  this.drawMap();
  this.populateZoo();
  this.playerAndBoundaries();
  this.sortLayer(this.map.decoration_layer, this.decorations);
  this.greyAllActivePens();

  this.start_time = this.markTime();

  this.setMusic("background_music");
}


Game.prototype.initializeMap = function() {
  var self = this;
  var screen = this.screens["zoo"];

  // The zoo is an NxN grid of square pens. Small is 5, leading to at most 25 pens.
  // Large is 8, leading to at most 64 pens.
  // Note some squares may be snipped, meaning less pens.
  this.zoo_size = 6;

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
      };
    }
  }

  this.zoo_pens = [];
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

  this.display_poop_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/poop.png"));
  this.display_poop_glyph.anchor.set(0.5,0.75);
  this.display_poop_glyph.position.set(70, 905);
  this.display_poop_glyph.scale.set(0.75, 0.75)
  this.display_ui.addChild(this.display_poop_glyph);

  this.display_poop_grey_text = new PIXI.Text("POOP", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0xDDDDDD, letterSpacing: 8, align: "left"});
  this.display_poop_grey_text.anchor.set(0,1);
  this.display_poop_grey_text.position.set(130, 945);
  this.display_ui.addChild(this.display_poop_grey_text);

  this.display_poop_typing_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0xFFFFFF, letterSpacing: 8, align: "left"});
  this.display_poop_typing_text.tint = 0x000000;
  this.display_poop_typing_text.anchor.set(0,1);
  this.display_poop_typing_text.position.set(130, 945);
  this.display_ui.addChild(this.display_poop_typing_text);

  this.display_ride_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/Ferris_Wheel/cart_icon.png"));
  this.display_ride_glyph.anchor.set(0.5,0.75);
  this.display_ride_glyph.position.set(70, 910);
  this.display_ride_glyph.scale.set(0.75, 0.75);
  this.display_ui.addChild(this.display_ride_glyph);
  this.display_ride_glyph.visible = false;

  this.display_ride_grey_text = new PIXI.Text("RIDE", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0xDDDDDD, letterSpacing: 8, align: "left"});
  this.display_ride_grey_text.anchor.set(0,1);
  this.display_ride_grey_text.position.set(130, 945);
  this.display_ui.addChild(this.display_ride_grey_text);
  this.display_ride_grey_text.visible = false;

  this.display_ride_typing_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 80, fill: 0xFFFFFF, letterSpacing: 8, align: "left"});
  this.display_ride_typing_text.tint = 0x000000;
  this.display_ride_typing_text.anchor.set(0,1);
  this.display_ride_typing_text.position.set(130, 945);
  this.display_ui.addChild(this.display_ride_typing_text);
  this.display_ride_typing_text.visible = false;

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


  this.animal_count_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/Animals/brown_bear.png"));
  this.animal_count_glyph.anchor.set(1,0.5);
  this.animal_count_glyph.position.set(this.width + 40, 33);
  this.animal_count_glyph.scale.set(0.4, 0.4)
  this.animal_count_glyph.tint = 0x000000;
  this.animal_count_glyph.alpha = 0.0;
  this.animal_count_glyph.visible = false;
  screen.addChild(this.animal_count_glyph);

  this.animal_count_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 60, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.animal_count_text.anchor.set(1,0.5);
  this.animal_count_text.position.set(this.width - 110, 65);
  this.animal_count_text.alpha = 0.0;
  this.animal_count_text.visible = false;
  screen.addChild(this.animal_count_text);
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

  console.log(group_num);

  // Attach singletons to larger groups
  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      let cell = this.zoo_squares[i][j];
      if (this.group_counts[cell.group] == 1) {
        console.log("Singleton at " + i + " " + j);
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

  // if ((i - 1) == this.special_ferris_tile[0] && j == this.special_ferris_tile[1]) return true;

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
          console.log(i + "," + j);
          console.log(this.zoo_squares[i][j].e_edge);
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

  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {

      if (this.zoo_squares[i][j].reachable && !this.isFerrisTile(i,j) && !this.isFerrisTile(i-1,j)) {

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
        let smooth_polygon = [];
        let smoothing_factor = 0.7;
        let l = polygon.length;
        for (let m = 0; m < l; m++) {
          let point = polygon[m];
          if (polygon[m].length > 2 && polygon[m][2] == "s") {
            // pre could go to l - 2 and post could go to 0 instead.
            let pre_point = m > 0 ? polygon[m - 1] : polygon[l - 1];
            let post_point = m < l - 1 ? polygon[m + 1] : polygon[0];

            let start_point = blendPoints([point, pre_point], [smoothing_factor, 1 - smoothing_factor]);
            let end_point = blendPoints([point, post_point], [smoothing_factor, 1 - smoothing_factor]);

            smooth_polygon.push(start_point);
            smooth_polygon.push(blendPoints([start_point, point, end_point], [0.5, 0.3, 0.2]));
            smooth_polygon.push(blendPoints([start_point, point, end_point], [0.333, 0.333, 0.333]));
            smooth_polygon.push(blendPoints([start_point, point, end_point], [0.2, 0.3, 0.5]));
            smooth_polygon.push(end_point);

          } else {
            smooth_polygon.push(point);
          }
        }
        // Push a duplicate of the first point.
        smooth_polygon.push([smooth_polygon[0][0],smooth_polygon[0][1]]);
        

        this.zoo_pens.push({
          use: false,
          outer: false,
          polygon: smooth_polygon,
          polygon_flat: smooth_polygon.flat(),
          cx: square_width * i + square_width / 2,
          cy: square_width * j + square_width / 2,
          animal: null,
          special: null,
          land: "grass",
          decorations: ["grass", "tree", "bush", "rock"],
          decoration_objects: [],
          land_object: null,
          special_object: null,
          animal_objects: null,
          state: "ungrey",
          location: this.zoo_squares[i][j],
        });
      } else if (this.zoo_squares[i][j].reachable && this.isFerrisTile(i,j)) {
        let polygon = [];
        polygon.push(this.zoo_vertices[i][j].halo.se);
        polygon.push(this.zoo_vertices[i+1][j].halo.s);
        polygon.push(this.zoo_vertices[i+2][j].halo.sw);
        polygon.push(this.zoo_vertices[i+2][j+1].halo.nw);
        polygon.push(this.zoo_vertices[i+1][j+1].halo.n);
        polygon.push(this.zoo_vertices[i][j+1].halo.ne);
        polygon.push(this.zoo_vertices[i][j].halo.se);

        this.zoo_pens.push({
          use: false,
          outer: false,
          polygon: polygon,
          polygon_flat: polygon.flat(),
          cx: square_width * (i + 1),
          cy: square_width * j + square_width / 2,
          animal: null,
          special: "FERRIS_WHEEL",
          land: "grass",
          decorations: null,
          decoration_objects: [],
          land_object: null,
          animal_objects: null,
          state: "ungrey",
          location: this.zoo_squares[i][j],
        });
      }
    }
  }

  console.log(this.zoo_pens);
  shuffleArray(this.zoo_pens);
}


Game.prototype.playerAndBoundaries = function() {
  
  this.upper_bound = 0;
  this.lower_bound = 0;
  this.left_bound = 0;
  this.right_bound = 0;


  this.upper_bound = -0.5 * square_width;
  this.lower_bound = square_width * (this.zoo_size + 0.5);
  this.left_bound = -0.5 * square_width;
  this.right_bound = square_width * (this.zoo_size + 0.5);

  min_location = [-square_width,-square_width];

  for (let i = 0; i <= this.zoo_size; i++) {
    for (let j = 0; j <= this.zoo_size; j++) {
      if (this.zoo_vertices[i][j].n_path == true && square_width * j + square_width / 2 > min_location[1]) {
        min_location = [square_width * i, square_width * j];
      }
    }
  }

  this.player = this.makeCharacter();
  this.player.position.set(min_location[0], min_location[1]);
  this.decorations.push(this.player);

  this.updateEnts();
}


Game.prototype.updateEnts = function() {
  for (let k = 0; k < total_ents; k++) {
    this.ents[k].visible = false;
  }
  ent_count = 0;
  for (let e = 0; e < this.ent_positions.length; e++) {
    let pos = this.ent_positions[e];

    if(Math.abs(this.player.x - pos[0]) < 800 && Math.abs(this.player.y - pos[1]) < 700) {
      if (ent_count < total_ents) {
        this.ents[ent_count].visible = true;
        this.ents[ent_count].position.set(pos[0], pos[1]);
        ent_count += 1;
      }
    }
  }
}


Game.prototype.designatePens = function() {
  console.log("There are " + this.zoo_pens.length + " pens.");

  // There are currently three zoo sections.
  // Choose a random angle, and divide the cells into three sections
  // as though they are slices of a pie centered on the center of the zoo.
  // Then assign animals by section.
  let section_dividing_angle = 360 * Math.random();
  console.log("Dividing angle: " + section_dividing_angle);

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
    if (this.zoo_pens[i].special == null) {
      let s = this.zoo_pens[i].location.section;

      if (s != null && s.length > 0) {
        new_animal = s.pop();
        this.zoo_pens[i].animal = new_animal;
        this.zoo_pens[i].land = animals[new_animal].land;
        this.zoo_pens[i].decorations = animals[new_animal].decorations;
      }
    } else if (this.zoo_pens[i].special == "FERRIS_WHEEL") {
      // do the ferris wheel thing!
    }
  }
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
  let background = new PIXI.Sprite(PIXI.Texture.from("Art/zoo_gradient.png"));
  background.width = square_width * (this.zoo_size + 4);
  background.height = square_width * (this.zoo_size + 4);
  background.anchor.set(0, 0);
  background.position.set(-2 * square_width, -2 * square_width);
  this.map.background_layer.addChild(background);



  // this.debugDrawMapGroups();



  // Draw the path background
  // let path_background = new PIXI.Graphics();
  // path_background.beginFill(path_color);
  // path_background.drawEllipse(0, 0, ellipse_size * ellipse_eccentricity, ellipse_size);
  // path_background.endFill();
  // this.map.background_layer.addChild(path_background);

  // let new_path_background = new PIXI.TilingSprite(PIXI.Texture.from("Art/path_art_2.png"));
  // new_path_background.position.set(0, 0);
  // this.map.background_layer.addChild(new_path_background);

  // Draw the land background, using the unused voronoi cells to partially cover
  // the elliptical edges of the path background.
  // let land_background = new PIXI.Graphics();
  // land_background.lineStyle(0, 0x000000, 0);
  // //for (let i = 0; i < voronoi_size; i++) {
  //   //if (this.voronoi_metadata[i].use == false && this.voronoi_metadata[i].group != 5000) {
  // for (let i = 0; i < this.zoo_pens.length; i++) {
  //   land_background.beginFill(background_color);
  //   let polygon = this.zoo_pens[i].polygon_flat;
  //   land_background.drawPolygon(polygon);
  //   land_background.endFill();
  // }
  // this.map.background_layer.addChild(land_background);


  this.drawMapPath();


  // for (let i = 0; i < voronoi_size; i++) {
  //   if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != 5000) {
  for (let i = 0; i < this.zoo_pens.length; i++) {
      this.zoo_pens[i].land_object = new PIXI.Container();
      this.zoo_pens[i].land_object.cx = this.zoo_pens[i].cx;
      this.zoo_pens[i].land_object.cy = this.zoo_pens[i].cy;

      // let grass_polygon = this.zoo_pens[i].grass_polygon.flat();

      // let grass = new PIXI.Graphics();
      // grass.beginFill(grass_color);
      // grass.drawPolygon(grass_polygon);
      // grass.endFill();
      // grass.true_color = grass_color;
      // grass.grey_color = grass_color;
      // this.zoo_pens[i].land_object.addChild(grass);

      let polygon = this.zoo_pens[i].polygon.flat();

      let ground = new PIXI.Graphics();
      ground.beginFill(0xFFFFFF);
      ground.drawPolygon(polygon);
      ground.endFill();

      ground.grey_color = 0xFFFFFF;

      if (this.zoo_pens[i].land == null || this.zoo_pens[i].land == "grass") {
        ground.true_color = grass_color;
      } else if (this.zoo_pens[i].land == "water") {
        ground.true_color = water_color;
      } else if (this.zoo_pens[i].land == "sand") {
        ground.true_color = sand_color;
      } else if (this.zoo_pens[i].land == "forest") {
        ground.true_color = forest_color;
      } else if (this.zoo_pens[i].land == "watergrass") {
        ground.true_color = water_color;
      } else if (this.zoo_pens[i].land == "waterice") {
        ground.true_color = water_color;
      }

      ground.tint = ground.true_color;
      this.zoo_pens[i].land_object.addChild(ground);

      if (this.zoo_pens[i].land == "watergrass" || this.zoo_pens[i].land == "waterice") {
        let super_ground = new PIXI.Graphics();
        super_ground.beginFill(0xFFFFFF);

        let polygon_left = [];
        for (let k = 0; k < this.zoo_pens[i].polygon.length; k++) {
          if (this.zoo_pens[i].polygon[k][0] <= this.zoo_pens[i].cx) {
            polygon_left.push(this.zoo_pens[i].polygon[k][0])
            polygon_left.push(this.zoo_pens[i].polygon[k][1]);
          }
        }
        polygon_left.push(polygon_left[0])
        polygon_left.push(polygon_left[1]);
        super_ground.drawPolygon(polygon_left);
        super_ground.endFill();

        super_ground.grey_color = 0xFEFEFE;
        if (this.zoo_pens[i].land == "watergrass") {
          super_ground.true_color = grass_color;
        } else if (this.zoo_pens[i].land == "waterice") {
          super_ground.true_color = ice_color;
        }

        super_ground.tint = super_ground.true_color;
        this.zoo_pens[i].land_object.addChild(super_ground);
      }


      let border = new PIXI.Graphics();
      border.lineStyle(12, 0xFFFFFF, 1); //width, color, alpha
      let border_polygon = this.zoo_pens[i].polygon.flat();
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

      this.zoo_pens[i].land_object.addChild(border_depth_1);
      this.zoo_pens[i].land_object.addChild(border_depth_2);
      this.zoo_pens[i].land_object.addChild(border);


      this.terrain.push(this.zoo_pens[i].land_object)
    //}
  }

  this.sortLayer(this.map.terrain_layer, this.terrain, true);
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


Game.prototype.populateZoo = function() {

  this.animals_obtained = 0;
  this.animals_available = 0;

  this.decorations = [];
  for (let i = 0; i < this.zoo_pens.length; i++) {
  // for (let i = 0; i < voronoi_size; i++) {
    // if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != null && this.voronoi_metadata[i].group != 5000) {
      if (this.zoo_pens[i].decorations != null) {
        decoration_number = Math.random();
        for (let t = 0; t < 5; t++) {
          if (Math.random() > 0.3) {
            let decoration_type = pick(this.zoo_pens[i].decorations);
            let decoration = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/" + decoration_type + ".png"));
            let edge = pick(this.zoo_pens[i].polygon);
            let fraction = 0.3 + 0.5 * Math.random();
            decoration.position.set(
              (1-fraction) * this.zoo_pens[i].cx + (fraction) * edge[0],
              (1-fraction) * this.zoo_pens[i].cy + (fraction) * edge[1]);
            decoration.scale.set(1.2, 1.2);
            decoration.anchor.set(0.5,0.9);
            this.decorations.push(decoration);
            this.zoo_pens[i].decoration_objects.push(decoration);
          }
        }
      }

      if (this.zoo_pens[i].animal != null) {
        this.animals_available += 1;
        this.zoo_pens[i].animal_objects = [];
        let animal_name = this.zoo_pens[i].animal;
        let num_animals_here = Math.ceil(3 * Math.random());
        if (animal_name == "OTTER" && num_animals_here == 1) num_animals_here = 2;
        if (animal_name == "PENGUIN") num_animals_here = 2 + Math.ceil(3 * Math.random());
        if (animal_name == "MEERKAT") num_animals_here = 2 + Math.ceil(3 * Math.random());
        if (animal_name == "CHIMPANZEE") num_animals_here = 1 + Math.ceil(3 * Math.random());
        for (let n = 0; n < num_animals_here; n++) {
          let animal = this.makeAnimal(animal_name, this.zoo_pens[i]);
          animal.position.set(this.zoo_pens[i].cx - 36 + 72 * n, this.zoo_pens[i].cy - 36 + 72 * Math.random());
          // animal.position.set(this.zoo_pens[i].cx, this.zoo_pens[i].cy);
          this.decorations.push(animal);
          this.zoo_pens[i].animal_objects.push(animal);
          this.animals.push(animal);
          this.shakers.push(animal);
          this.shakers.push(this.zoo_pens[i].land_object);
        }
      }

      if (this.zoo_pens[i].special == "FERRIS_WHEEL") {
        this.ferris_wheel = this.makeFerrisWheel(this.zoo_pens[i]);
        this.ferris_wheel.position.set(this.zoo_pens[i].cx, this.zoo_pens[i].cy + 180);
        this.decorations.push(this.ferris_wheel);
        this.zoo_pens[i].special_object = this.ferris_wheel;
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
            this.ent_positions.push([x,y]);
          }
        }
      }
    }
  }
  
  this.ents = [];
  for (let k = 0; k < total_ents; k++) {
    let ent = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/tree.png"));
    ent.position.set(0, 0);
    ent.scale.set(1.2, 1.2);
    ent.anchor.set(0.5, 0.9);
    ent.visible = false;
    this.ents.push(ent);
    this.decorations.push(ent);
  }


  // Add a few trees around the edges of the pens
  let inner_trees = 0;
  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].w_edge) {
        for (let t = 0; t < 4; t++) {
          if (Math.random() > 0.4) {
            let x = square_width * i + 120 + 20 * Math.random();
            let y = square_width * j + 200 + (square_width - 400) * Math.random();
            let tree = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/tree.png"));
            tree.position.set(x, y);
            tree.scale.set(1.2, 1.2);
            tree.anchor.set(0.5, 0.9);
            this.decorations.push(tree);
            inner_trees += 1;
          }
        }
      }
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].e_edge) {
        for (let t = 0; t < 4; t++) {
          if (Math.random() > 0.4) {
            let x = square_width * i + square_width - 120 - 20 * Math.random();
            let y = square_width * j + 200 + (square_width - 400) * Math.random();
            let tree = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/tree.png"));
            tree.position.set(x, y);
            tree.scale.set(1.2, 1.2);
            tree.anchor.set(0.5, 0.9);
            this.decorations.push(tree);
            inner_trees += 1;
          }
        }
      }
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].n_edge) {
        for (let t = 0; t < 3; t++) {
          if (Math.random() > 0.3) {
            let x = square_width * i + 200 + (square_width - 400) * Math.random();
            let y = square_width * j + 120 + 20 * Math.random();
            let tree = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/tree.png"));
            tree.position.set(x, y);
            tree.scale.set(1.2, 1.2);
            tree.anchor.set(0.5, 0.9);
            this.decorations.push(tree);
            inner_trees += 1;
          }
        }
      }
      if (this.zoo_squares[i][j].reachable && this.zoo_squares[i][j].n_edge) {
        for (let t = 0; t < 3; t++) {
          if (Math.random() > 0.3) {
            let x = square_width * i + 200 + (square_width - 400) * Math.random();
            let y = square_width * j + square_width - 120 - 20 * Math.random();
            let tree = new PIXI.Sprite(PIXI.Texture.from("Art/Decorations/tree.png"));
            tree.position.set(x, y);
            tree.scale.set(1.2, 1.2);
            tree.anchor.set(0.5, 0.9);
            this.decorations.push(tree);
            inner_trees += 1;
          }
        }
      }
    }
  }
  console.log(inner_trees);

  this.updateAnimalCount();

  // Add zoo sign
  // for (let i = 0; i < voronoi_size; i++) {
  //   if(this.voronoi_metadata[i].group == 5000) {
  //     let zoo = new PIXI.Sprite(PIXI.Texture.from("Art/alpha_zoo.png"));
  //     zoo.scale.set(1.2, 1.2);
  //     zoo.anchor.set(0.5, 0.8);
  //     zoo.position.set(this.voronoi_metadata[i].cx, this.voronoi_metadata[i].cy);
  //     this.decorations.push(zoo);
  //     // this.map.addChild(zoo);

  //     this.player.position.set(this.voronoi_metadata[i].cx, this.voronoi_metadata[i].cy);
  //     this.decorations.push(this.player);
  //   }
  // }
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

  if (this.zoo_mode == "active") {
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
}


Game.prototype.addType = function(letter) {
  var self = this;
  var screen = this.screens["typing"];

  if (this.typing_text.text.length < this.thing_to_type.length) {
    if (this.thing_to_type[this.typing_text.text.length] == "_") {
      this.typing_text.text += " ";
    }
    this.typing_text.text += letter;
  }

  if (this.typing_text.text == this.thing_to_type.replace("_", " ")) {
    this.soundEffect("success");
    flicker(this.typing_text, 300, 0x000000, 0xFFFFFF);
    this.typing_allowed = false;

    let thing_to_type = this.thing_to_type;
    let pen_to_fix = this.pen_to_fix;

    delay(function() {
      self.ungrey(pen_to_fix);
      self.soundEffect("build");
      if (pen_to_fix.animal_objects != null) {
        self.animals_obtained += 1;
        self.updateAnimalCount();
      }
      pen_to_fix.land_object.shake = self.markTime();

      for (let i = 0; i < self.pen_to_fix.polygon.length; i++) {
        let x = pen_to_fix.polygon[i][0];
        let y = pen_to_fix.polygon[i][1];
        self.makeSmoke(self.map.build_effect_layer, x, y, 1.8, 1.8);
      }

      self.hideTypingText();

      self.checkPenProximity(self.player.x, self.player.y, self.player.direction);

    }, 200);


    delay(function() {
      self.changeDisplayText(thing_to_type, pen_to_fix);
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
  var screen = this.screens["zoo"];

  console.log(this.thing_to_display);
  if (this.thing_to_display == "FERRIS_WHEEL") {
    if (this.display_ride_typing_text.text.length < 4) {
      this.display_ride_typing_text.text += letter;
    }

    if (this.display_ride_typing_text.text == "RIDE") {
      this.soundEffect("success");
    
      this.display_typing_allowed = false;

      flicker(this.display_ride_typing_text, 300, 0x000000, 0xFFFFFF);

      delay(function() {
        self.display_ride_typing_text.text = "";
        self.display_typing_allowed = true;
      }, 300);

      this.zoo_mode = "pre_ferris_wheel";
      // this.fadeScreens("zoo", "zoo", true);

      delay(function() {
        self.hideDisplayText();
        self.fadeToBlack(1000);
      }, 300);

      delay(function() {
        self.player.old_position = [self.player.position.x, self.player.position.y];

        self.zoo_mode = "ferris_wheel";

        new_decorations = [];
        for (let i = 0; i < self.decorations.length; i++) {
          if (self.decorations[i].type != "character") {
            new_decorations.push(self.decorations[i]);
          } else {
          }
        }
        self.decorations = new_decorations;
        self.sortLayer(self.map.decoration_layer, self.decorations);

        self.ferris_wheel.addPlayer(self.player);
      }, 1400)

      delay(function() {
        self.fadeFromBlack(1000);
      }, 1800);

      delay(function() {
        self.ferris_wheel.startMoving();
      }, 2800);

      delay(function() {
        self.ferris_wheel.stopMoving();
      }, 62800)

      delay(function() {
        self.fadeToBlack(1000);
      }, 63100)

      delay(function() {
        self.ferris_wheel.reset();
      }, 64200)

      delay(function() {
        self.decorations.push(self.player);
        self.sortLayer(self.map.decoration_layer, self.decorations);

        self.fadeFromBlack(1000);

        self.zoo_mode = "active";
      }, 64600)


    }
  } else {

    // standard animal actions
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
      if (carnivores.includes(this.thing_to_display)) {
        food_types = ["steak"];
      } else if (omnivores.includes(this.thing_to_display)) {
        food_types = ["greens", "steak", "fruit"];
      }
      let food_type = pick(food_types);

      let sheet = PIXI.Loader.shared.resources["Art/Food/" + food_type + ".json"].spritesheet
      let food = new PIXI.AnimatedSprite(sheet.animations[food_type]);
      food.scale.set(0.75, 0.75);
      food.type = food_type;
      food.start_x = this.player.x;
      food.start_y = this.player.y + 1;
      food.end_x = this.pen_to_display.cx - 32 + 64 * Math.random();
      food.end_y = this.pen_to_display.cy - 32 + 64 * Math.random();
      food.anchor.set(0.5,0.75)
      food.position.set(food.start_x, food.start_y);
      food.interpolation = 0;
      food.state = "flying";
      food.parent = this.map.decoration_layer;
      food.animal_target = this.thing_to_display;
      // this.map.decoration_layer.addChild(food);
      this.decorations.push(food);
      this.foods.push(food);
      console.log(food);
    } else if (this.display_poop_typing_text.text == "POOP") {
      flicker(this.display_poop_typing_text, 300, 0x000000, 0xFFFFFF);

      console.log(this.pen_to_display)
      let current_animal = pick(this.pen_to_display.animal_objects);
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
  } else if (this.display_ride_typing_text.text.length > 0) {
    let l = this.display_ride_typing_text.text.slice(-1,this.display_ride_typing_text.text.length);
    let t = new PIXI.Text(l, {fontFamily: "Bebas Neue", fontSize: 80, fill: 0x000000, letterSpacing: 3, align: "left"});
    t.anchor.set(0,1);
    t.position.set(130 + 28 * (this.display_ride_typing_text.text.length - 1), 945);
    t.vx = -20 + 40 * Math.random();
    t.vy = -5 + -20 * Math.random();
    t.floor = 1200;
    screen.addChild(t);
    this.freefalling.push(t);

    this.display_ride_typing_text.text = this.display_ride_typing_text.text.slice(0,-1);
    this.soundEffect("swipe");
  }
}


Game.prototype.changeTypingText = function(new_word, found_pen) {
  var self = this;
  var screen = this.screens["zoo"];

  this.thing_to_type = new_word;
  this.pen_to_fix = found_pen;
  
  if (this.typing_backing != null) {
    this.typing_ui.removeChild(this.typing_backing);
    this.typing_backing.destroy();
  }

  if (this.typing_picture != null) {
    this.typing_ui.removeChild(this.typing_picture);
    this.typing_picture.destroy();
  }

  console.log(this.thing_to_type);

  let measure = new PIXI.TextMetrics.measureText(new_word, this.typing_text.style);
  // sign_backing.width = measure.width + 6;
  // sign_backing.height = measure.height + 6;

  if (this.thing_to_type == "FERRIS_WHEEL") {
    this.typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Ferris_Wheel/icon.png"));
  } else if (!(this.thing_to_type in animated_animals)) {
    this.typing_picture = new PIXI.Sprite(PIXI.Texture.from("Art/Animals/" + this.thing_to_type.toLowerCase() + ".png"));
  } else {
    console.log(this.thing_to_type);
    var sheet = PIXI.Loader.shared.resources["Art/Animals/" + this.thing_to_type.toLowerCase() + ".json"].spritesheet;
    this.typing_picture = new PIXI.AnimatedSprite(sheet.animations[this.thing_to_type.toLowerCase()]);
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

  this.thing_to_display = new_word;
  this.pen_to_display = found_pen;

  this.display_food_typing_text.text = "";
  this.display_poop_typing_text.text = "";
  this.display_ride_typing_text.text = "";

  // if (Math.random() > 0.65) {
  //   this.soundEffect(this.thing_to_display.toLowerCase());
  // }

  let measure = new PIXI.TextMetrics.measureText(new_word, this.display_text.style);

  this.display_backing.position.set(1280 - (measure.width + 50), 960 - 30)

  this.display_text.text = new_word.replace("_", " ");

  if (new_word == "FERRIS_WHEEL") {
    this.display_food_glyph.visible = false;
    this.display_food_grey_text.visible = false;
    this.display_food_typing_text.visible = false;
    this.display_poop_glyph.visible = false;
    this.display_poop_grey_text.visible = false;
    this.display_poop_typing_text.visible = false;

    this.display_ride_glyph.visible = true;
    this.display_ride_grey_text.visible = true;
    this.display_ride_typing_text.visible = true;

    this.display_action_backing.anchor.set(0, 1);
    this.display_action_backing.scale.set(0.5, 0.5);

  } else {
    this.display_food_glyph.visible = true;
    this.display_food_grey_text.visible = true;
    this.display_food_typing_text.visible = true;
    this.display_poop_glyph.visible = true;
    this.display_poop_grey_text.visible = true;
    this.display_poop_typing_text.visible = true;

    this.display_ride_glyph.visible = false;
    this.display_ride_grey_text.visible = false;
    this.display_ride_typing_text.visible = false;

    this.display_action_backing.anchor.set(0, 1);
    this.display_action_backing.scale.set(0.5, 1);
  }

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
  this.pen_to_fix = null;
  this.thing_to_type = "";
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
  this.pen_to_display = null;

  this.thing_to_display = "";
  new TWEEN.Tween(this.display_ui)
    .to({y: 300})
    .duration(250)
    .start()
    .onComplete(function() {
      self.display_ui.visible = false;
    });
}


Game.prototype.grey = function(pen) {
  pen.state = "grey";
  if (pen.animal_objects != null) {
    for (let j = 0; j < pen.animal_objects.length; j++) {
      pen.animal_objects[j].alpha = 0.4;
      if (j > 0) pen.animal_objects[j].visible = false;
    }
  }
  for (let j = 0; j < pen.decoration_objects.length; j++) {
    pen.decoration_objects[j].visible = false;
  }
  if (pen.special_object != null) {
    for (let j = 0; j < pen.special_object.all_objects.length; j++) {
      pen.special_object.all_objects[j].tint = pen.special_object.all_objects[j].grey_color;
    }
  }
  if (pen.land_object != null) {
    for (let j = 0; j < pen.land_object.children.length; j++) {
      let land = pen.land_object.children[j];
      land.tint = land.grey_color;
    }
  }
}


Game.prototype.ungrey = function(pen) {

  pen.land_object.filters = [];

  pen.state = "ungrey";
  if (pen.animal_objects != null) {
    for (let j = 0; j < pen.animal_objects.length; j++) {
      pen.animal_objects[j].alpha  = 1;
      pen.animal_objects[j].visible = true;
    }
  }
  for (let j = 0; j < pen.decoration_objects.length; j++) {
    pen.decoration_objects[j].visible = true;
  }
  if (pen.special_object != null) {
    for (let j = 0; j < pen.special_object.all_objects.length; j++) {
      pen.special_object.all_objects[j].tint = pen.special_object.all_objects[j].true_color;
    }
  }
  if (pen.land_object != null) {
    for (let j = 0; j < pen.land_object.children.length; j++) {
      let land = pen.land_object.children[j];
      land.tint = land.true_color;
    }
  }
}


Game.prototype.greyAll = function() {
  for (let i = 0; i < this.zoo_pens.length; i++) {
    //if(this.zoo_pens[i].use == true && this.zoo_pens[i].group != 5000) {
      this.grey(this.zoo_pens[i]);
    //}
  }
}


Game.prototype.ungreyAll = function() {
  for (let i = 0; i < this.zoo_pens.length; i++) {
    //if(this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != 5000) {
      this.ungrey(this.zoo_pens[i]);
    //}
  }
}


Game.prototype.greyAllActivePens = function() {
  // for (let i = 0; i < voronoi_size; i++) {
  //   if(this.voronoi_metadata[i].use == true 
  //     && this.voronoi_metadata[i].group != 5000
  //     && this.voronoi_metadata[i].animal != null) {
  //     this.grey(i);
  //   }
  // }
  for (let i = 0; i < this.zoo_pens.length; i++) {
    if (this.zoo_pens[i].animal != null || this.zoo_pens[i].special != null) {
      this.grey(this.zoo_pens[i]);
    }
  }
}


Game.prototype.fadeTitle = function() {
  var self = this;

  new TWEEN.Tween(this.title_image)
    .to({alpha: 0})
    .duration(1000)
    .start()
    .onUpdate(function() {
    })
    .onComplete(function() {
      self.title_image.visible = false;
    });

  this.updateAnimalCount();

  this.animal_count_text.alpha = 0.01;
  this.animal_count_text.visible = true;
  new TWEEN.Tween(this.animal_count_text)
    .to({alpha: 0.6})
    .duration(1000)
    .start()
    .onUpdate(function() {
    }); 

  this.animal_count_glyph.alpha = 0.01;
  this.animal_count_glyph.visible = true;
  new TWEEN.Tween(this.animal_count_glyph)
    .to({alpha: 0.6})
    .duration(1000)
    .start()
    .onUpdate(function() {
    });  
}


Game.prototype.updateAnimalCount = function() {
  this.animal_count_text.text = this.animals_obtained + " / " + this.animals_available;
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
      this.fadeTitle();
    }

    player.move();

    this.updateEnts();

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
  // for (let i = 0; i < voronoi_size; i++) {
  //   if (this.voronoi_metadata[i].use == true && this.voronoi_metadata[i].group != null) {
  for (let i = 0; i < this.zoo_pens.length; i++) {
      if (pointInsidePolygon([tx, ty], this.zoo_pens[i].polygon)) {
        return false;
      }
    // }
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

    // for (let i = 0; i < voronoi_size; i++) {
    //   if (this.voronoi_metadata[i].use == true
    //     && this.voronoi_metadata[i].group != null
    for (let i = 0; i < this.zoo_pens.length; i++) {
      if (this.zoo_pens[i].animal_objects != null || this.zoo_pens[i].special_object != null) {
        if (pointInsidePolygon([tx, ty], this.zoo_pens[i].polygon)) {
          found_pen = this.zoo_pens[i];

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

      // for (let i = 0; i < voronoi_size; i++) {
      //   if (this.voronoi_metadata[i].use == true
      //     && this.voronoi_metadata[i].group != null
      for (let i = 0; i < this.zoo_pens.length; i++) {
        if (this.zoo_pens[i].animal_objects != null || this.zoo_pens[i].special_object != null) {
          if (pointInsidePolygon([tx, ty], this.zoo_pens[i].polygon)) {
            found_pen = this.zoo_pens[i];
            break;
          }
        }
      }
    }
  }

  if (found_pen != null) {
    if (found_pen.animal_objects != null) {
      if (found_pen.animal != this.thing_to_type && found_pen.state == "grey") {
        // console.log("typing");
        this.changeTypingText(found_pen.animal, found_pen);
        if (this.display_ui.visible == true) {
          this.hideDisplayText();
        }
      } else if (found_pen.animal != this.thing_to_display && found_pen.state == "ungrey") {
        // console.log("display");
        this.changeDisplayText(found_pen.animal, found_pen);
        if (this.typing_ui.visible == true) {
          this.hideTypingText();
        }
      }
    } else if (found_pen.special_object != null) {
      if (found_pen.special != this.thing_to_type && found_pen.state == "grey") {
        // console.log("typing");
        this.changeTypingText(found_pen.special, found_pen);
        if (this.display_ui.visible == true) {
          this.hideDisplayText();
        }
      } else if (found_pen.special != this.thing_to_display && found_pen.state == "ungrey") {
        // console.log("display");
        this.changeDisplayText(found_pen.special, found_pen);
        if (this.typing_ui.visible == true) {
          this.hideTypingText();
        }
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

  let fractional = diff / (1000/30.0);

  if(this.player == null) return;

  if (this.zoo_mode == "active") this.updatePlayer();

  if (this.zoo_mode == "ferris_wheel") this.ferris_wheel.update(fractional);

  // if (this.timeSince(this.start_time) < 5000) {
  //     let scale = Math.max(0.1, (this.timeSince(this.start_time) / 5000));
  //     this.map.scale.set(scale, scale);
  //   } else {
  //     this.map.scale.set(1, 1);  
  //   }
  // if(true) {
  //   if (this.timeSince(this.start_time) < 2000) {
  //     this.map.position.set(640 - this.player.x * this.map.scale.x, 500 * ((2000 - this.timeSince(this.start_time)) / 2000) + 580 - this.player.y * this.map.scale.y);
  //   } else {
  //     this.map.position.set(640 - this.player.x * this.map.scale.x, 580 - this.player.y * this.map.scale.y);
  //   }
  // } else {
  //   this.map.scale.set(0.2, 0.2);
  //   this.map.position.set(640 - this.player.x * this.map.scale.x, 580 - this.player.y * this.map.scale.y);
  // }

  if (this.zoo_mode == "active") {
    if (this.timeSince(this.start_time) < 2000) {
      this.map.position.set(640 - this.player.x * this.map.scale.x, 500 * ((2000 - this.timeSince(this.start_time)) / 2000) + 580 - this.player.y * this.map.scale.y);
    } else {
      this.map.position.set(640 - this.player.x * this.map.scale.x, 580 - this.player.y * this.map.scale.y);
    }
  } else if (this.zoo_mode == "pre_ferris_wheel") {
    this.map.position.set(640 - this.player.x * this.map.scale.x, 580 - this.player.y * this.map.scale.y);
  } else if (this.zoo_mode == "ferris_wheel") {
    let x = this.ferris_wheel.x + this.player.x;
    let y = this.ferris_wheel.y + this.player.y;
    this.map.position.set(640 - x * this.map.scale.x, 580 - y * this.map.scale.y);
  }

  
  if (this.ferris_wheel != null) {
    if (this.mode == "active" && this.player.y + 150 < this.ferris_wheel.y) {
      this.ferris_wheel.alpha = Math.max(1 - (this.ferris_wheel.y - this.player.y - 150) / 800, 0.0);
    } else {
      this.ferris_wheel.alpha = 1;
    }
  }

  for (let i = 0; i < this.animals.length; i++) {
    if (this.animals[i].pen.state == "ungrey") {
      this.animals[i].update();
    }
  }

  this.sortLayer(this.map.decoration_layer, this.decorations);

  this.shakeDamage();
  this.freeeeeFreeeeeFalling(fractional);
  this.poopsAndFoods(fractional);

}