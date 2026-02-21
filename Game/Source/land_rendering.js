

// land_rendering.js contains all map drawing and rendering functions.
//
//
// land.js contains all the code to make land.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

Game.prototype.drawMap = function() {
  var self = this;
  var screen = this.screens["zoo"];

  for (let i = 0; i < this.zoo_pens.length; i++) {

    let pen = this.zoo_pens[i];

    pen.land_object = new PIXI.Container();
    pen.land_object.cx = pen.cx;
    pen.land_object.cy = pen.cy;
  }

  this.drawRiver();
  this.drawTrainTracks();
  this.drawMapPath();

  for (let i = 0; i < this.zoo_pens.length; i++) {

    let pen = this.zoo_pens[i];

    let corner_x = pen.cx - square_width / 2;
    let corner_y = pen.cy - square_width / 2;

    let grid_i = pen.square_numbers[0];
    let grid_j = pen.square_numbers[1];

    if (pen.special == null) {
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


      let terrain_texture = this.renderer.generateTexture(render_container,
        PIXI.SCALE_MODES.LINEAR, 1, new PIXI.Rectangle(-50, -50, 1024, 1024));
      this.generated_textures.push(terrain_texture);

      let terrain_sprite = new PIXI.Sprite(terrain_texture);
      terrain_sprite.anchor.set(0, 0);
      terrain_sprite.position.set(corner_x - 50, corner_y - 50);

      pen.land_object.addChild(terrain_sprite);

      

      let fences = this.drawFence(pen.polygon, corner_x, corner_y);


      // fences[0].scale.set(0.2, 0.2);
      // let tf_mini_texture = this.renderer.generateTexture(fences[0],
      //   PIXI.SCALE_MODES.LINEAR, 1, new PIXI.Rectangle(-12.5, -25, 256, 256));
      // this.generated_textures.push(tf_mini_texture);
      // let tf_mini_sprite = new PIXI.Sprite(tf_mini_texture);
      // tf_mini_sprite.scale.set(5, 5);
      // tf_mini_sprite.anchor.set(0, 0);
      // fences[0].position.set(0, -50);
      render_container.addChild(fences[0])
      // this.map.minimap_layer.addChild(tf_mini_sprite);


      // fences[1].scale.set(0.2, 0.2);
      // let bf_mini_texture = this.renderer.generateTexture(fences[1],
      //   PIXI.SCALE_MODES.LINEAR, 1, new PIXI.Rectangle(-12.5, -25, 256, 256));
      // this.generated_textures.push(bf_mini_texture);
      // let bf_mini_sprite = new PIXI.Sprite(bf_mini_texture);
      // bf_mini_sprite.scale.set(5, 5);
      // bf_mini_sprite.anchor.set(0, 0);
      fences[1].position.set(0, square_width/2);
      render_container.addChild(fences[1])

      render_container.scale.set(0.2, 0.2);

      let mini_texture = this.renderer.generateTexture(render_container,
        PIXI.SCALE_MODES.LINEAR, 1, new PIXI.Rectangle(-12, -12, 256, 256));
      this.generated_textures.push(mini_texture);

      let mini_sprite = new PIXI.Sprite(mini_texture);
      mini_sprite.scale.set(5, 5);
      mini_sprite.anchor.set(0, 0);
      mini_sprite.position.set(corner_x - 50, corner_y - 50);

      this.map.minimap_layer.addChild(mini_sprite);
      // mini_sprite.visible = false;

      pen.mini_sprite = mini_sprite;

      render_container.destroy();
      fences[0].destroy();
      fences[1].destroy();

    }
    this.addLandCulling(pen.land_object);
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


Game.prototype.drawPond = function(render_container, land, corner_x, corner_y, polygon, depth_override = null) {
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
  if (depth_override != null) riverbank_depth = depth_override;
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
      if (land == "forest" || land == "grass" || land == "sand" || land == "water" || land == "background") {
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
      if (land == "forest" || land == "grass" || land == "sand" || land == "water" || land == "background") {
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
      if (land == "forest" || land == "grass" || land == "sand" || land == "water" || land == "background") {
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
      if (land == "forest" || land == "grass" || land == "sand" || land == "water" || land == "background") {
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

  if (land == "forest" || land == "grass" || land == "sand" || land == "water" || land == "background") {
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
  this.generated_textures.push(terrace_texture);


  var terrace_sprite = new PIXI.Sprite(terrace_texture);
  terrace_sprite.anchor.set(0, 0);
  // terrace_sprite.position.set(corner_x - 100 + (corner_x - top_point[0]), corner_y - 100 + (corner_y - top_point[1]));
  terrace_sprite.position.set(corner_x - 100 - top_point[0], corner_y - 100 - top_point[1]);
  let terrace = new PIXI.Container();
  terrace.position.set(top_point[0], top_point[1]);
  terrace.addChild(terrace_sprite);

  this.addDecorationCulling(terrace);

  // pen.land_object.addChild(terrace);
  pen.decoration_objects.push(terrace);
  this.decorations.push(terrace);

  terrace_container.destroy();
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
        } else if (second_land == "background") {
          edging.tint = background_color;
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
  this.generated_textures.push(top_texture);

  var top_fence_sprite = new PIXI.Sprite(top_texture);
  top_fence_sprite.anchor.set(0, 0);
  top_fence_sprite.position.set(-50, -100 - highest_top_point);
  top_fence = new PIXI.Container();
  top_fence.type = "fence";
  top_fence.addChild(top_fence_sprite);
  top_fence.position.set(corner_x, corner_y + highest_top_point);
  // pen.land_object.addChild(top_fence_sprite);
  this.decorations.push(top_fence);

  // top_fence_render_container.scale.set(0.2, 0.2);
  // let tf_mini_texture = this.renderer.generateTexture(top_fence_render_container,
  //   PIXI.SCALE_MODES.LINEAR, 1, new PIXI.Rectangle(-12.5, -25, 256, 256));
  // this.generated_textures.push(tf_mini_texture);
  // let tf_mini_sprite = new PIXI.Sprite(tf_mini_texture);
  // tf_mini_sprite.scale.set(5, 5);
  // tf_mini_sprite.anchor.set(0, 0);
  // tf_mini_sprite.position.set(corner_x - 50, corner_y - 100);
  // this.map.minimap_layer.addChild(tf_mini_sprite);

  // don't destroy the fences, because we will use them to make minimap sprites.
  //top_fence_render_container.destroy();

  // render the stuff in the bottom container to a texture, and use that
  // texture to make the bottom fence sprite, and add that to this.decorations.
  var bottom_texture = this.renderer.generateTexture(bottom_fence_render_container,
    PIXI.SCALE_MODES.LINEAR,
    1,
    new PIXI.Rectangle(-50, -200, 1024, 1024));
  this.generated_textures.push(bottom_texture);

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

  // bottom_fence_render_container.scale.set(0.2, 0.2);
  // let bf_mini_texture = this.renderer.generateTexture(bottom_fence_render_container,
  //   PIXI.SCALE_MODES.LINEAR, 1, new PIXI.Rectangle(-12.5, -50, 256, 256));
  // this.generated_textures.push(bf_mini_texture);
  // let bf_mini_sprite = new PIXI.Sprite(bf_mini_texture);
  // bf_mini_sprite.scale.set(5, 5);
  // bf_mini_sprite.anchor.set(0, 0);
  // bf_mini_sprite.position.set(corner_x - 50, corner_y + square_width/2 - 200);
  // this.map.minimap_layer.addChild(bf_mini_sprite);

  // don't destroy the fences, because we will use them to make minimap sprites.
  //bottom_fence_render_container.destroy();

  this.addCulling(top_fence);
  this.addCulling(bottom_fence);

  return [top_fence_render_container, bottom_fence_render_container];
}


// Culling testing
Game.prototype.testCulling = function() {
  // White screen tester;
  this.player.red_circle = PIXI.Sprite.from(PIXI.Texture.WHITE);
  this.player.red_circle.width = 1400;
  this.player.red_circle.height = 900;
  this.player.red_circle.anchor.set(0.5,0.5);
  this.player.red_circle.alpha = 0.4;
  this.player.red_circle.position.set(0,0);
  this.player.addChild(this.player.red_circle);

  this.ungreyAll();
  this.map.scale.set(0.2, 0.2);
}


// I don't care that this is code duplication. It's fast to write.
Game.prototype.addDecorationCulling = function(decoration) {
  decoration.hidden = false;
  decoration.culled = false;

  decoration.computeVisibility = function() {
    if (decoration.hidden || decoration.culled) {
      decoration.visible = false;
    } else {
      decoration.visible = true;
    }
  }

  decoration.hide = function() {
    decoration.hidden = true;
    decoration.computeVisibility();
  }

  decoration.show = function() {
    decoration.hidden = false;
    decoration.computeVisibility();
  }

  decoration.computeCulling = function(x, y) {
    if(
      game.map_visible == true || 
        (decoration.x > x - 1200 && decoration.x < x + 1200
      && decoration.y > y - 900 && decoration.y < y + 900)) {
      decoration.culled = false;
    } else {
      decoration.culled = true;
    }
    decoration.computeVisibility();
  }
}


Game.prototype.addLandCulling = function(land_element) {
  land_element.hidden = false;
  land_element.culled = false;

  land_element.computeVisibility = function() {
    if (land_element.hidden || land_element.culled) {
      land_element.visible = false;
    } else {
      land_element.visible = true;
    }
  }

  land_element.hide = function() {
    land_element.hidden = true;
    land_element.computeVisibility();
  }

  land_element.show = function() {
    land_element.hidden = false;
    land_element.computeVisibility();
  }

  land_element.computeCulling = function(x, y) {
    if(
      game.map_visible == true || 
      (land_element.cx > x - 1300 && land_element.cx < x + 1300
      && land_element.cy > y - 900 && land_element.cy < y + 900)) {
      land_element.culled = false;
    } else {
      land_element.culled = true;
    }
    land_element.computeVisibility();
  }
}


Game.prototype.addCulling = function(land_element) {
  land_element.hidden = false;
  land_element.culled = false;

  land_element.computeVisibility = function() {
    if (land_element.hidden || land_element.culled) {
      land_element.visible = false;
    } else {
      land_element.visible = true;
    }
  }

  land_element.hide = function() {
    land_element.hidden = true;
    land_element.computeVisibility();
  }

  land_element.show = function() {
    land_element.hidden = false;
    land_element.computeVisibility();
  }

  land_element.computeCulling = function(x, y) {
    if(
      game.map_visible == true || 
      (land_element.x > x - 1800 && land_element.x < x + 900
      && land_element.y > y - 1500 && land_element.y < y + 900)) {
      land_element.culled = false;
    } else {
      land_element.culled = true;
    }
    land_element.computeVisibility();
  }
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


Game.prototype.drawRiver = function() {
  if (this.river_polygon != null) {
    let polygon = this.river_polygon;

    let chunks = [];

    for (let c = -2; c < this.zoo_size + 2; c++) {

      let flat_polygon = [];
      let polygon_chunk = [];
      for (let j = 0; j < polygon.length; j++) {
        if (polygon[j][0] >= c * square_width - 50 && polygon[j][0] <= (c+1) * square_width + 50) {
          flat_polygon.push(polygon[j][0] - c * square_width);
          flat_polygon.push(polygon[j][1] - this.river_j * square_width);
          polygon_chunk.push([polygon[j][0] - c * square_width, polygon[j][1] - this.river_j * square_width]);
        }
      }
      chunks.push(polygon_chunk);

      let ground = new PIXI.Graphics();
      ground.beginFill(0xFFFFFF);
      ground.drawPolygon(flat_polygon);
      ground.endFill();

      ground.tint = water_color;

      let render_container = new PIXI.Container();
      render_container.addChild(ground);

      let terrain_texture = this.renderer.generateTexture(render_container,
        PIXI.SCALE_MODES.LINEAR, 1, new PIXI.Rectangle(-50, -50, 1024, 1024));
      this.generated_textures.push(terrain_texture);

      let terrain_sprite = new PIXI.Sprite(terrain_texture);
      terrain_sprite.anchor.set(0, 0);
      terrain_sprite.position.set(c * square_width - 50, this.river_j * square_width - 50);

      this.map.background_layer.addChild(terrain_sprite);

      render_container.destroy();
    }

    for (let c = -2; c < this.zoo_size + 2; c++) {
      let chunk = chunks[c];

      let render_container = new PIXI.Container();
      this.drawPond(render_container, "background", c * square_width, this.river_j * square_width, polygon, 40);

      let terrain_texture = this.renderer.generateTexture(render_container,
        PIXI.SCALE_MODES.LINEAR, 1, new PIXI.Rectangle(-50, -50, 1024, 1024));
      this.generated_textures.push(terrain_texture);

      let terrain_sprite = new PIXI.Sprite(terrain_texture);
      terrain_sprite.anchor.set(0, 0);
      terrain_sprite.position.set(c * square_width - 50, this.river_j * square_width - 50);

      this.map.background_layer.addChild(terrain_sprite);

      render_container.destroy();
    }

  }
  
}


let track_edge_size = 0;
Game.prototype.drawTrainTracks = function() {
  var self = this;
  var screen = this.screens["zoo"];

  track_edge_size = (this.zoo_size + 1) * square_width - 400;

  let nw_arc = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_arc_1.png"));
  nw_arc.anchor.set(0.5, 0.5);
  nw_arc.position.set(-0.5 * square_width + 200, -0.5 * square_width + 200);
  this.map.background_layer.addChild(nw_arc);

  let ne_arc = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_arc_1.png"));
  ne_arc.anchor.set(0.5, 0.5);
  ne_arc.position.set((this.zoo_size + 0.5) * square_width - 200, -0.5 * square_width + 200);
  ne_arc.scale.set(-1,1);
  this.map.background_layer.addChild(ne_arc);

  let sw_arc = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_arc_2.png"));
  sw_arc.anchor.set(0.5, 0.5);
  sw_arc.position.set(-0.5 * square_width + 200, (this.zoo_size + 0.5) * square_width - 200);
  this.map.background_layer.addChild(sw_arc);

  let se_arc = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_arc_2.png"));
  se_arc.anchor.set(0.5, 0.5);
  se_arc.position.set((this.zoo_size + 0.5) * square_width - 200, (this.zoo_size + 0.5) * square_width - 200);
  se_arc.scale.set(-1,1);
  this.map.background_layer.addChild(se_arc);

  this.stations = {};
  this.stops = {};
  this.stations["north"] = this.makeTrainStation("north", this.north_station * square_width, -0.5 * square_width + 80 + 200 + 120)
  this.stations["south"] = this.makeTrainStation("south", this.south_station * square_width, (this.zoo_size + 0.5) * square_width - 80 - 200)
  this.stations["east"] = this.makeTrainStation("east", (this.zoo_size + 0.5) * square_width - 200 - 296, this.east_station * square_width + 120)
  this.stations["west"] = this.makeTrainStation("west", -0.5 * square_width + 200 + 296, this.west_station * square_width + 120)

  this.stations["south"].stop = this.south_station * square_width + 200 + 256;
  this.stations["east"].stop = track_edge_size + (this.zoo_size - this.east_station) * square_width + 200 + 256;
  this.stations["north"].stop = 2 * track_edge_size + (this.zoo_size - this.north_station) * square_width + 200 + 256;
  this.stations["west"].stop = 3 * track_edge_size + this.west_station * square_width + 200 + 256;

  for (let i = -1; i < this.zoo_size; i++) {
    let section = null;

    if (i < this.zoo_size - 1) {
      section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_horizontal_straight.png"));
      section.anchor.set(0.5, 0.5);
      // section.tint = 0x999999;
      section.position.set(square_width * i + square_width + 200, square_width * (this.zoo_size + 0.5) - 200);
      this.map.background_layer.addChild(section);

      section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_horizontal_straight.png"));
      section.anchor.set(0.5, 0.5);
      // section.tint = 0x999999;
      section.position.set(square_width * i + square_width + 200, square_width * (-0.5) + 200);
      this.map.background_layer.addChild(section);
    }

    if (i >= 0 && i < this.zoo_size - 1) {
      section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_horizontal_span.png"));
      section.anchor.set(0.5, 0.5);
      section.position.set(square_width * i + square_width/2 + 200, square_width * (this.zoo_size + 0.5) - 200);
      this.map.background_layer.addChild(section);

      section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_horizontal_span.png"));
      section.anchor.set(0.5, 0.5);
      section.position.set(square_width * i + square_width/2 + 200, square_width * (-0.5) + 200);
      this.map.background_layer.addChild(section);
    } else if (i == this.zoo_size - 1) {
      section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_horizontal_straight.png"));
      section.anchor.set(0.5, 0.5);
      section.position.set(square_width * i + square_width/2 + 250, square_width * (this.zoo_size + 0.5) - 200);
      this.map.background_layer.addChild(section);

      section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_horizontal_straight.png"));
      section.anchor.set(0.5, 0.5);
      section.position.set(square_width * i + square_width/2 + 250, square_width * (-0.5) + 200);
      this.map.background_layer.addChild(section);
    }
  }


  for (let i = -1; i < this.zoo_size; i++) {
    let section = null;

    if (i < this.zoo_size - 1) {
      section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_vertical_straight.png"));
      section.anchor.set(0.5, 0.5);
      // section.tint = 0xAAAAAA;
      section.position.set(square_width * (this.zoo_size + 0.5) - 200, square_width * i + square_width + 200);
      this.map.background_layer.addChild(section);

      section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_vertical_straight.png"));
      section.anchor.set(0.5, 0.5);
      // section.tint = 0xAAAAAA;
      section.position.set(square_width * (-0.5) + 200,square_width * i + square_width + 200);
      this.map.background_layer.addChild(section);
    }

    if (i >= 0 && i < this.zoo_size - 1) {
      section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_vertical_span.png"));
      section.anchor.set(0.5, 0.5);
      section.position.set(square_width * (this.zoo_size + 0.5) - 200, square_width * i + square_width/2 + 200);
      this.map.background_layer.addChild(section);

      section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_vertical_span.png"));
      section.anchor.set(0.5, 0.5);
      section.position.set(square_width * (-0.5) + 200, square_width * i + square_width/2 + 200);
      this.map.background_layer.addChild(section);
    } else if (i == this.zoo_size - 1) {
      section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_vertical_straight.png"));
      section.anchor.set(0.5, 0.5);
      section.position.set(square_width * (this.zoo_size + 0.5) - 200, square_width * i + square_width/2 + 250);
      this.map.background_layer.addChild(section);

      section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/rail_vertical_straight.png"));
      section.anchor.set(0.5, 0.5);
      section.position.set(square_width * (-0.5) + 200, square_width * i + square_width/2 + 250);
      this.map.background_layer.addChild(section);
    }
  }
}


Game.prototype.drawMapPath = function() {
  var self = this;
  var screen = this.screens["zoo"];

  for (let i = 0; i < this.zoo_size; i++) {
    for (let j = 0; j < this.zoo_size; j++) {
      let cell = this.zoo_squares[i][j];
      if (cell.e_edge == true && (this.river_tiles == null || this.river_j != j)) {
        // draw the eastern edge section
        let section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_straight_vertical_v4.png"));
        section.anchor.set(0.5, 0.5);
        section.position.set(square_width * i + square_width, square_width * j + square_width / 2);
        // section.angle = 90;
        this.map.background_layer.addChild(section);
      }

      if (cell.e_edge == true && (this.river_tiles != null && this.river_j == j)) {
        // draw the eastern edge section
        let section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/bridge.png"));
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