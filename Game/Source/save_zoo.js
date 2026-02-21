
//
// save_zoo.js contains serialization and deserialization logic for map persistence.
// This allows the zoo layout to persist across sessions while keeping animals
// and decorations fresh.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

// Dynamic getters for animal counts (calculated from pen states)
Game.prototype.getAnimalsAvailable = function() {
  let count = 0;
  for (let pen of this.zoo_pens) {
    if (pen.animal != null) {
      count += 1;
    }
  }
  return count;
}

Game.prototype.getAnimalsObtained = function() {
  let count = 0;
  for (let pen of this.zoo_pens) {
    if (pen.animal != null && pen.state === "ungrey") {
      count += 1;
    }
  }
  return count;
}

// Extract zoo state for saving
Game.prototype.serializeZooState = function() {
  let zoo_data = {
    version: 1,
    timestamp: Date.now(),
    zoo: {
      size: this.zoo_size,
      river_j: this.river_j,
      north_station: this.north_station,
      south_station: this.south_station,
      east_station: this.east_station,
      west_station: this.west_station,
      pens: [],
      squares: {}
    },
    progression: {
      dollar_bucks: this.dollar_bucks || 0,
      balloons: [],
      shirt_color: null,
      hat_type: null,
      glasses_type: null,
      scooter_type: null,
      stuffies: []
    }
  };

  // Save purchases if persistPurchases is enabled
  let persist_purchases = window.getPersistPurchases();
  if (persist_purchases && this.player) {
    // Save balloons
    if (this.player.balloons) {
      for (let balloon of this.player.balloons) {
        zoo_data.progression.balloons.push(balloon.color);
      }
    }

    // Save shirt, hat, glasses, scooter
    zoo_data.progression.shirt_color = this.player.shirt_color || null;
    zoo_data.progression.hat_type = this.player.hat_type || null;
    zoo_data.progression.glasses_type = this.player.glasses_type || null;
    zoo_data.progression.scooter_type = this.player.scooter_type || null;

    // Save stuffies
    if (this.player.stuffies) {
      for (let stuffie of this.player.stuffies) {
        zoo_data.progression.stuffies.push(stuffie.character_name);
      }
    }
  }

  // Serialize pens
  for (let pen of this.zoo_pens) {
    zoo_data.zoo.pens.push({
      animal: pen.animal,  // Animal type or null
      special: pen.special,  // Building type or null
      land: pen.land,
      pond_choice: pen.pond_choice,
      terrace_choice: pen.terrace_choice,
      polygon: pen.polygon,
      grey_polygon: pen.grey_polygon || pen.polygon,
      ungrey_polygon: pen.ungrey_polygon || pen.polygon,
      inner_polygon: pen.inner_polygon || [],
      cx: pen.cx,
      cy: pen.cy,
      square_numbers: pen.square_numbers,
      state: pen.state  // Save grey/ungrey state
    });
  }

  // Serialize grid (convert 2D array to nested object)
  for (let i = 0; i < this.zoo_size; i++) {
    zoo_data.zoo.squares[i] = {};
    for (let j = 0; j < this.zoo_size; j++) {
      let square = this.zoo_squares[i][j];
      if (square) {
        zoo_data.zoo.squares[i][j] = {
          group: square.group,
          section: square.section,
          reachable: square.reachable,
          outer: square.outer,
          pen_index: square.pen ? this.zoo_pens.indexOf(square.pen) : null,
          n_edge: square.n_edge,
          s_edge: square.s_edge,
          w_edge: square.w_edge,
          e_edge: square.e_edge
        };
      }
    }
  }

  // Serialize vertices (path crossroads)
  zoo_data.zoo.vertices = {};
  for (let i = 0; i <= this.zoo_size; i++) {
    zoo_data.zoo.vertices[i] = {};
    for (let j = 0; j <= this.zoo_size; j++) {
      let vertex = this.zoo_vertices[i][j];
      if (vertex) {
        zoo_data.zoo.vertices[i][j] = {
          n_path: vertex.n_path,
          s_path: vertex.s_path,
          e_path: vertex.e_path,
          w_path: vertex.w_path
        };
      }
    }
  }

  return zoo_data;
}

// Restore zoo state from save data
Game.prototype.deserializeZooState = function(zoo_data) {
  // Restore basic properties
  this.zoo_size = zoo_data.zoo.size;
  this.river_j = zoo_data.zoo.river_j;
  this.north_station = zoo_data.zoo.north_station;
  this.south_station = zoo_data.zoo.south_station;
  this.east_station = zoo_data.zoo.east_station;
  this.west_station = zoo_data.zoo.west_station;
  this.dollar_bucks = zoo_data.progression.dollar_bucks;

  // Store purchase data for later restoration (after player is created)
  this.saved_balloons = zoo_data.progression.balloons || [];
  this.saved_shirt_color = zoo_data.progression.shirt_color || null;
  this.saved_hat_type = zoo_data.progression.hat_type || null;
  this.saved_glasses_type = zoo_data.progression.glasses_type || null;
  this.saved_scooter_type = zoo_data.progression.scooter_type || null;
  this.saved_stuffies = zoo_data.progression.stuffies || [];

  // Initialize arrays
  this.zoo_pens = [];
  this.zoo_squares = [];
  for (let i = 0; i < this.zoo_size; i++) {
    this.zoo_squares[i] = [];
  }

  // Reconstruct river_tiles array if river exists
  this.river_tiles = [];
  if (this.river_j != null) {
    for (let i = 0; i < this.zoo_size; i++) {
      this.river_tiles.push([i, this.river_j]);
    }
  }

  // Restore pens
  for (let pen_data of zoo_data.zoo.pens) {
    let pen = {
      animal: pen_data.animal,
      special: pen_data.special,
      land: pen_data.land,
      pond_choice: pen_data.pond_choice,
      terrace_choice: pen_data.terrace_choice,
      polygon: pen_data.polygon || [],
      grey_polygon: pen_data.grey_polygon || pen_data.polygon || [],
      ungrey_polygon: pen_data.ungrey_polygon || pen_data.polygon || [],
      inner_polygon: pen_data.inner_polygon || [],
      cx: pen_data.cx,
      cy: pen_data.cy,
      square_numbers: pen_data.square_numbers || [],
      // Initialize arrays that will be populated during rendering
      decoration_objects: [],
      animal_objects: [],
      state: pen_data.state || "grey"  // Restore saved state (grey/ungrey)
    };
    this.zoo_pens.push(pen);
  }

  // Restore grid and reconnect pen references
  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      let square_data = zoo_data.zoo.squares[i][j];
      if (square_data) {
        this.zoo_squares[i][j] = {
          group: square_data.group,
          section: square_data.section,
          reachable: square_data.reachable,
          outer: square_data.outer,
          pen: square_data.pen_index !== null ? this.zoo_pens[square_data.pen_index] : null,
          n_edge: square_data.n_edge,
          s_edge: square_data.s_edge,
          w_edge: square_data.w_edge,
          e_edge: square_data.e_edge
        };
      }
    }
  }

  // Restore vertices path data
  if (zoo_data.zoo.vertices) {
    for (let i = 0; i <= this.zoo_size; i++) {
      for (let j = 0; j <= this.zoo_size; j++) {
        let vertex_data = zoo_data.zoo.vertices[i][j];
        if (vertex_data && this.zoo_vertices[i] && this.zoo_vertices[i][j]) {
          this.zoo_vertices[i][j].n_path = vertex_data.n_path;
          this.zoo_vertices[i][j].s_path = vertex_data.s_path;
          this.zoo_vertices[i][j].e_path = vertex_data.e_path;
          this.zoo_vertices[i][j].w_path = vertex_data.w_path;
        }
      }
    }
  }

  // Mark that we loaded from save (skip procedural generation)
  this.loaded_from_save = true;
}

// Save zoo state (wrapper function)
Game.prototype.saveZooState = function() {
  // Only save if persistMap is enabled
  let persist_enabled = window.getPersistMap();
  if (!persist_enabled) {
    return;  // Map persistence disabled, skip save
  }

  try {
    let save_data = this.serializeZooState();
    let result = window.saveZoo(save_data);
    if (result === 'zoo saved') {
      console.log("Zoo saved successfully to map.json");
    }
  } catch (e) {
    console.error("Failed to save zoo:", e);
    // Don't block gameplay on save failure
  }
}
