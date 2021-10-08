




// let temp_zoo_size = "small";

// Game.prototype.initializeAltGen = function() {
//   var self = this;
//   var screen = this.screens["alt_gen"];
//   this.clearScreen(screen);

//   // Small is 5, large is 8
//   this.zoo_square_size = 8;
//   this.view_scale = 0.1;



//   this.map = new PIXI.Container();
//   this.map.position.set(
//     640 - this.view_scale * 1000 * this.zoo_square_size / 2,
//     480 - this.view_scale * 1000 * this.zoo_square_size / 2
//   );
//   this.map.scale.set(this.view_scale, this.view_scale);
//   screen.addChild(this.map);


//   let background = new PIXI.Sprite(PIXI.Texture.from("Art/zoo_gradient.png"));
//   background.width = 1000 * (this.zoo_square_size + 4);
//   background.height = 1000 * (this.zoo_square_size + 4);
//   background.anchor.set(0, 0);
//   background.position.set(-2000, -2000);
//   this.map.addChild(background);


//   this.zoo_vertices = {};
//   for (let i = 0; i <= this.zoo_square_size; i++) {
//     this.zoo_vertices[i] = {};
//     for (let j = 0; j <= this.zoo_square_size; j++) {
//       this.zoo_vertices[i][j] = {
//         use: false,
//         n_path: false,
//         s_path: false,
//         w_path: false,
//         e_path: false,
//         vertex: [1000 * i, 1000 * j],
//         halo: {
//           nw: [1000 * i - 130 - 70 * Math.random(), 1000 * j - 130 - 70 * Math.random()],
//           ne: [1000 * i + 130 + 70 * Math.random(), 1000 * j - 130 - 70 * Math.random()],
//           sw: [1000 * i - 130 - 70 * Math.random(), 1000 * j + 130 + 70 * Math.random()],
//           se: [1000 * i + 130 + 70 * Math.random(), 1000 * j + 130 + 70 * Math.random()],
//           n: [1000 * i - 40 + 80 * Math.random(), 1000 * j - 140 - 70 * Math.random()],
//           s: [1000 * i - 40 + 80 * Math.random(), 1000 * j + 140 + 70 * Math.random()],
//           e: [1000 * i + 140 + 70 * Math.random(), 1000 * j - 40 + 80 * Math.random()],
//           w: [1000 * i - 140 - 70 * Math.random(), 1000 * j - 40 + 80 * Math.random()],
//         }
//       };
//     }
//   }

//   this.zoo_grid = {};
//   for (let i = 0; i < this.zoo_square_size; i++) {
//     this.zoo_grid[i] = {};
//     for (let j = 0; j < this.zoo_square_size; j++) {
//       this.zoo_grid[i][j] = {
//         group: -1,
//         new_group: null,
//         reachable: false,
//         outer: (i == 0 || i == this.zoo_square_size - 1 || j == 0 || j == this.zoo_square_size - 1),
//         n_edge: false,
//         s_edge: false,
//         w_edge: false,
//         e_edge: false,
//       };
//     }
//   }

//   this.zoo_pens = {};
//   for (let i = 0; i < this.zoo_square_size; i++) {
//     this.zoo_pens[i] = {};
//     for (let j = 0; j < this.zoo_square_size; j++) {
//       this.zoo_pens[i][j] = {
//         polygon: [],
//         polygon_flat: [],
//       };
//     }
//   }

//   // this.debugDrawGrid();
//   this.makeGroups();
//   this.markPath();
//   this.makePens();
//   // TO DO: test connectedness of the path and either regenerate or fix it if it's not simply connected.
//   // this.debugDrawGroups();
//   this.drawPath();
//   this.debugDrawPens();
//   this.debugDrawHalo();
// }


// // Game.prototype.debugDrawGrid = function() {
// //   var self = this;
// //   var screen = this.screens["alt_gen"];

// //   let path = new PIXI.Graphics();
// //   path.lineStyle(1 / this.view_scale, 0xFFFFFF, 1); //width, color, alpha
// //   for (let i = 0; i <= this.zoo_square_size; i++) {
// //     let vertical_line = [800 * i, 0, 800 * i, 800 * this.zoo_square_size];
// //     path.drawPolygon(vertical_line);

// //     let horizontal_line = [0, 800 * i, 800 * this.zoo_square_size, 800 * i];
// //     path.drawPolygon(horizontal_line);
// //   }
// //   this.map.addChild(path);
// // }


// Game.prototype.makeGroups = function() {
//   var self = this;
//   var screen = this.screens["alt_gen"];

//   // Mark groups using a random search
//   let group_num = 1;
//   let group_count = 0;
//   let max_group_count = Math.floor(2 + Math.random() * 5);
//   this.group_colors = {};
//   this.group_counts = {};

//   for (let i = 0; i < this.zoo_square_size; i++) {
//     for (let j = 0; j < this.zoo_square_size; j++) {
//       if (this.zoo_grid[i][j].group == -1) {
//         let new_group_count = this.markGroupZ(i, j, group_num, group_count, max_group_count);
//         this.group_colors[group_num] = PIXI.utils.rgb2hex([Math.random(), Math.random(), Math.random()]);
//         this.group_counts[group_num] = new_group_count;
//         group_num += 1;
//         // console.log(group_num);
//         group_count = 0;
//         max_group_count = Math.floor(2 + Math.random() * 5);
//       }
//     }
//   }

//   console.log(group_num);

//   // TO DO: Attach singletons to larger groups
//   // ALSO MAYBE DON'T DO THIS!
//   for (let i = 0; i < this.zoo_square_size; i++) {
//     for (let j = 0; j < this.zoo_square_size; j++) {
//       let cell = this.zoo_grid[i][j];
//       if (this.group_counts[cell.group] == 1) {
//         console.log("Singleton at " + i + " " + j);
//         let neighbors = [];
//         if (i > 0) neighbors.push(this.zoo_grid[i-1][j].group);
//         if (i < this.zoo_square_size - 1) neighbors.push(this.zoo_grid[i+1][j].group);
//         if (j > 0) neighbors.push(this.zoo_grid[i][j-1].group);
//         if (j < this.zoo_square_size - 1) neighbors.push(this.zoo_grid[i][j+1].group);
//         shuffleArray(neighbors);
//         cell.new_group = neighbors[0];
//       }
//     }
//   }
//   for (let i = 0; i < this.zoo_square_size; i++) {
//     for (let j = 0; j < this.zoo_square_size; j++) {
//       let cell = this.zoo_grid[i][j];
//       if (this.group_counts[cell.group] == 1) {
//         cell.group = cell.new_group;
//         cell.new_group = null;
//       }
//     }
//   }

// }


// Game.prototype.markGroupZ = function(i, j, group_num, group_count, max_group_count) {
//   if (group_count >= max_group_count) return group_count;

//   this.zoo_grid[i][j].group = group_num;
//   group_count += 1;

//   let neighbors = [];
//   if (i > 0 && this.zoo_grid[i-1][j].group == -1) {
//     neighbors.push([i-1,j]);
//   }
//   if (i < this.zoo_square_size - 1 && this.zoo_grid[i+1][j].group == -1) {
//     neighbors.push([i+1,j]);
//   }
//   if (j > 0 && this.zoo_grid[i][j-1].group == -1) {
//     neighbors.push([i,j-1]);
//   }
//   if (j < this.zoo_square_size - 1 && this.zoo_grid[i][j+1].group == -1) {
//     neighbors.push([i,j+1]);
//   }
  
//   if (neighbors.length > 0) {
//     shuffleArray(neighbors);
//     group_count = this.markGroupZ(neighbors[0][0], neighbors[0][1], group_num, group_count, max_group_count);
//     // if (neighbors.length > 1) {
//     //   // console.log("here");
//     //   group_count = this.markGroup(neighbors[0][0], neighbors[0][1], group_num, group_count, max_group_count);
//     // }
//   }

//   return group_count;
// }


// Game.prototype.markPath = function() {
//   var self = this;
//   var screen = this.screens["alt_gen"];

//   for (let i = 1; i < this.zoo_square_size; i++) {
//     for (let j = 0; j < this.zoo_square_size; j++) {
//       if (this.zoo_grid[i][j].group != this.zoo_grid[i-1][j].group) {
          
//         this.zoo_grid[i][j].w_edge = true;
//         this.zoo_grid[i-1][j].e_edge = true;

//         this.zoo_grid[i][j].reachable = true;
//         this.zoo_grid[i-1][j].reachable = true;

//         this.zoo_vertices[i][j].s_path = true;
//         this.zoo_vertices[i][j+1].n_path = true;
//       }
//     }
//   }

//   for (let i = 0; i < this.zoo_square_size; i++) {
//     for (let j = 1; j < this.zoo_square_size; j++) {
//       if (this.zoo_grid[i][j].group != this.zoo_grid[i][j-1].group) {
//         this.zoo_grid[i][j].n_edge = true;
//         this.zoo_grid[i][j-1].s_edge = true;

//         this.zoo_grid[i][j].reachable = true;
//         this.zoo_grid[i][j-1].reachable = true;

//         this.zoo_vertices[i][j].e_path = true;
//         this.zoo_vertices[i+1][j].w_path = true;
//       }
//     }
//   }
// }


// Game.prototype.makePens = function() {
//   for (let i = 0; i < this.zoo_square_size; i++) {
//     for (let j = 0; j < this.zoo_square_size; j++) {

//       if (this.zoo_grid[i][j].reachable) {

//         let polygon = this.zoo_pens[i][j].polygon;

//         // northwest corner
//         let nw_vertex = this.zoo_vertices[i][j];
//         if (nw_vertex.s_path || nw_vertex.n_path || nw_vertex.e_path || nw_vertex.w_path) {
//           // pre corner
//           if (nw_vertex.s_path == false) polygon.push(nw_vertex.halo.s);
          
//           // corner
//           polygon.push(nw_vertex.halo.se);
//           if (nw_vertex.e_path == true && nw_vertex.s_path == true) polygon[polygon.length - 1].push("s");
          
//           // post corner
//           if (nw_vertex.e_path == false) polygon.push(nw_vertex.halo.e);
//         } else {
//           polygon.push(nw_vertex.vertex);
//         }

//         // northeast corner
//         let ne_vertex = this.zoo_vertices[i+1][j];
//         if (ne_vertex.s_path || ne_vertex.n_path || ne_vertex.e_path || ne_vertex.w_path) {
//           // pre corner
//           if (ne_vertex.w_path == false) polygon.push(ne_vertex.halo.w);
          
//           // corner
//           polygon.push(ne_vertex.halo.sw)
//           if (ne_vertex.s_path == true && ne_vertex.w_path == true) polygon[polygon.length - 1].push("s");

//           // post corner
//           if (ne_vertex.s_path == false) polygon.push(ne_vertex.halo.s);
//         } else {
//           polygon.push(ne_vertex.vertex);
//         }

//         // southeast corner
//         let se_vertex = this.zoo_vertices[i+1][j+1];
//         if (se_vertex.s_path || se_vertex.n_path || se_vertex.e_path || se_vertex.w_path) {
//           // pre corner
//           if (se_vertex.n_path == false) polygon.push(se_vertex.halo.n);
          
//           // corner
//           polygon.push(se_vertex.halo.nw);
//           if (se_vertex.w_path == true && se_vertex.n_path == true) polygon[polygon.length - 1].push("s");
          
//           // post corner
//           if (se_vertex.w_path == false) polygon.push(se_vertex.halo.w);
//         } else {
//           polygon.push(se_vertex.vertex);
//         }
        
//         // southwest corner
//         let sw_vertex = this.zoo_vertices[i][j+1];
//         if (sw_vertex.s_path || sw_vertex.n_path || sw_vertex.e_path || sw_vertex.w_path) {
//           // pre corner
//           if (sw_vertex.e_path == false) polygon.push(sw_vertex.halo.e);
          
//           // corner
//           polygon.push(sw_vertex.halo.ne);
//           if (sw_vertex.n_path == true && sw_vertex.e_path == true) polygon[polygon.length - 1].push("s");
          
//           // post corner
//           if (sw_vertex.n_path == false) polygon.push(sw_vertex.halo.n);
//         } else {
//           polygon.push(sw_vertex.vertex);
//         }


//         // Push a duplicate of the first point.
//         // polygon.push([polygon[0][0],polygon[0][1]]);
        

//         // Now do smoothing on any corner with an "s" in it.
//         let new_polygon = [];
//         let smoothing_factor = 0.7;
//         let l = polygon.length;
//         for (let m = 0; m < l; m++) {
//           let point = polygon[m];
//           if (polygon[m].length > 2 && polygon[m][2] == "s") {
//             // pre could go to l - 2 and post could go to 0 instead.
//             let pre_point = m > 0 ? polygon[m - 1] : polygon[l - 1];
//             let post_point = m < l - 1 ? polygon[m + 1] : polygon[0];

//             let start_point = blendPoints([point, pre_point], [smoothing_factor, 1 - smoothing_factor]);
//             let end_point = blendPoints([point, post_point], [smoothing_factor, 1 - smoothing_factor]);
//             // let start_point = [
//             //   smoothing_factor * point[0] + (1 - smoothing_factor) * pre_point[0],
//             //   smoothing_factor * point[1] + (1 - smoothing_factor) * pre_point[1]
//             // ];

//             // let end_point = [
//             //   smoothing_factor * point[0] + (1 - smoothing_factor) * post_point[0],
//             //   smoothing_factor * point[1] + (1 - smoothing_factor) * post_point[1]
//             // ];

//             new_polygon.push(start_point);
//             new_polygon.push(blendPoints([start_point, point, end_point], [0.5, 0.25, 0.25]));
//             new_polygon.push(blendPoints([start_point, point, end_point], [0.333, 0.333, 0.333]));
//             new_polygon.push(blendPoints([start_point, point, end_point], [0.25, 0.25, 0.5]));
//             new_polygon.push(end_point);



//             // new_polygon.push(new_pre);
//             // new_polygon.push(new_post);
//           } else {
//             new_polygon.push(point);
//           }
//         }
//         //let last = [new_polygon[0][0], new_polygon[0][1]];
//         //new_polygon.push(last);
//         this.zoo_pens[i][j].polygon = new_polygon;


//         this.zoo_pens[i][j].polygon_flat = new_polygon.flat();
//       }
//     }
//   }
// }


// Game.prototype.debugDrawGroups = function() {
//   for (let i = 0; i < this.zoo_square_size; i++) {
//     for (let j = 0; j < this.zoo_square_size; j++) {
//       let group = this.zoo_grid[i][j].group;
//       let color = this.group_colors[group];
//       let cell = new PIXI.Graphics();
//       cell.beginFill(color);
//       let polygon = [
//         1000 * i, 1000 * j,
//         1000 * i, 1000 * (j+1),
//         1000 * (i+1), 1000 * (j+1),
//         1000 * (i+1), 1000 * j,
//         1000 * i, 1000 * j,
//       ]
//       cell.drawPolygon(polygon);
//       cell.endFill();
//       if (!this.zoo_grid[i][j].reachable) cell.alpha = 0.5;
//       this.map.addChild(cell);
//     }
//   }
// }


// Game.prototype.drawPath = function() {
//   var self = this;
//   var screen = this.screens["alt_gen"];

//   for (let i = 0; i < this.zoo_square_size; i++) {
//     for (let j = 0; j < this.zoo_square_size; j++) {
//       let cell = this.zoo_grid[i][j];
//       if (cell.e_edge == true) {
//         // draw the eastern edge section
//         let section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_straight_v1.png"));
//         section.anchor.set(0.5, 0.5);
//         section.position.set(1000 * i + 1000, 1000 * j + 500);
//         section.angle = 90;
//         this.map.addChild(section);
//       }

//       if (cell.s_edge == true) {
//         // draw the southern edge section
//         let section = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_straight_v1.png"));
//         section.anchor.set(0.5, 0.5);
//         section.position.set(1000 * i + 500, 1000 * j + 1000);
//         section.angle = 0;
//         this.map.addChild(section);
//       }
//     }
//   }


//   for (let i = 0; i <= this.zoo_square_size; i++) {
//     for (let j = 0; j <= this.zoo_square_size; j++) {
//       let vertex = this.zoo_vertices[i][j];

//       let intersection = null;
//       if (vertex.s_path && vertex.e_path && vertex.n_path && vertex.w_path) {
//         intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_cross_v1.png"));
//       }
//       else if (vertex.s_path && vertex.e_path && !vertex.n_path && !vertex.w_path) {
//         intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_arc_v1.png"));
//       }
//       else if (vertex.s_path && vertex.w_path && !vertex.n_path && !vertex.e_path) {
//         intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_arc_v1.png"));
//         intersection.scale.set(-1,1);
//       }
//       else if (!vertex.s_path && !vertex.e_path && vertex.n_path && vertex.w_path) {
//         intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_arc_v1.png"));
//         intersection.angle = 180;
//       }
//       else if (!vertex.s_path && !vertex.w_path && vertex.n_path && vertex.e_path) {
//         intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_arc_v1.png"));
//         intersection.scale.set(-1,1);
//         intersection.angle = 180;
//       }
//       else if (vertex.s_path && vertex.w_path && !vertex.n_path && vertex.e_path) {
//         intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_flat_t_v1.png"));
//         intersection.angle = 0;
//       }
//       else if (!vertex.s_path && vertex.w_path && vertex.n_path && vertex.e_path) {
//         intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_flat_t_v1.png"));
//         intersection.angle = 180;
//       }
//       else if (vertex.s_path && !vertex.w_path && vertex.n_path && vertex.e_path) {
//         intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_curve_t_v1.png"));
//         intersection.angle = 0;
//       }
//       else if (vertex.s_path && vertex.w_path && vertex.n_path && !vertex.e_path) {
//         intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_curve_t_v1.png"));
//         intersection.angle = 180;
//       }
//       else if (!vertex.s_path && vertex.w_path && !vertex.n_path && vertex.e_path) {
//         intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_span_v1.png"));
//       }
//       else if (vertex.s_path && !vertex.w_path && vertex.n_path && !vertex.e_path) {
//         intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_span_v1.png"));
//         intersection.angle = 90;
//       }
//       else if (!vertex.s_path && !vertex.w_path && !vertex.n_path && vertex.e_path) {
//         intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_terminus_v1.png"));
//         intersection.angle = 180;
//       }
//       else if (!vertex.s_path && vertex.w_path && !vertex.n_path && !vertex.e_path) {
//         intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_terminus_v1.png"));
//         intersection.angle = 0;
//       }
//       else if (!vertex.s_path && !vertex.w_path && vertex.n_path && !vertex.e_path) {
//         intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_terminus_v1.png"));
//         intersection.angle = 90;
//       }
//       else if (vertex.s_path && !vertex.w_path && !vertex.n_path && !vertex.e_path) {
//         intersection = new PIXI.Sprite(PIXI.Texture.from("Art/PathElements/path_terminus_v1.png"));
//         intersection.angle = 270;
//       }

//       if (intersection) {
//         intersection.anchor.set(0.5, 0.5);
//         intersection.position.set(1000 * i, 1000 * j);
//         this.map.addChild(intersection);
//       }

      
//     }
//   }
// }


// Game.prototype.debugDrawPens = function() {
//   var self = this;
//   var screen = this.screens["alt_gen"];

//   for (let i = 0; i < this.zoo_square_size; i++) {
//     for (let j = 0; j < this.zoo_square_size; j++) {

//       let pen_border = new PIXI.Graphics();
//       pen_border.lineStyle(2/this.view_scale, pen_color, 1);
//       pen_border.drawPolygon(this.zoo_pens[i][j].polygon_flat);
//       this.map.addChild(pen_border);
//     }
//   }
// }


// Game.prototype.debugDrawHalo = function() {
//   var self = this;
//   var screen = this.screens["alt_gen"];

//   path = new PIXI.Graphics();
//   path.lineStyle(1 / this.view_scale, 0x000000, 1);

//   let vertex = this.zoo_vertices[5][5];
//   for (const direction of Object.keys(vertex.halo)) {
//     console.log(direction);
//     console.log(vertex.halo[direction][0] + "," + vertex.halo[direction][1]);

//     let vertical_line = [vertex.halo[direction][0], vertex.halo[direction][1] - 20, vertex.halo[direction][0], vertex.halo[direction][1] + 20];
//     path.drawPolygon(vertical_line);

//     let horizontal_line = [vertex.halo[direction][0] - 20, vertex.halo[direction][1], vertex.halo[direction][0] + 20, vertex.halo[direction][1]];
//     path.drawPolygon(horizontal_line);
//   }

//   this.map.addChild(path);

//   // let path = new PIXI.Graphics();
//   // path.lineStyle(1 / this.view_scale, 0xFFFFFF, 1); //width, color, alpha
//   // for (let i = 0; i <= this.zoo_square_size; i++) {
//   //   let vertical_line = [800 * i, 0, 800 * i, 800 * this.zoo_square_size];
//   //   path.drawPolygon(vertical_line);

//   //   let horizontal_line = [0, 800 * i, 800 * this.zoo_square_size, 800 * i];
//   //   path.drawPolygon(horizontal_line);
//   // }
//   // this.map.addChild(path);


// }


// Game.prototype.updateAltGen = function(diff) {
//   var self = this;
//   var screen = this.screens["alt_gen"];

  



// }
