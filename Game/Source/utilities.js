
//
// utilities.js has general utility methods like array shuffling, distance detection,
// random element picking, point-inside-polygon detection, and so forth.
// Lots of good stuff here.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

const letter_values = {
  "A": 1, "B": 2, "C": 1, "D": 1, "E": 1, "F": 2, "G": 1,
  "H": 2, "I": 1, "J": 3, "K": 2, "L": 1, "M": 1, "N": 1,
  "O": 1, "P": 1, "Q": 4, "R": 1, "S": 1, "T": 1, "U": 2,
  "V": 3, "W": 2, "X": 3, "Y": 2, "Z": 4,
}

const letter_array = Object.keys(letter_values);
const lower_array = [];
for (i in letter_array) {
  lower_array.push(letter_array[i].toLowerCase());
}
const shuffle_letters = [];
for (i in letter_array) {
  shuffle_letters.push(letter_array[i]);
}


function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}


lloydRelaxation = function (points, width, height) {
  let vals = [];
  for(let i = 0; i < points.length; i++) {
    vals.push([0,0,0]);
  }

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let min_distance = width * height * 10;
      let min_val = null;
      for(let i = 0; i < points.length; i++) {
        let p = points[i];
        let px = p[0];
        let py = p[1];
        let pd = distance(x,y,px,py);
        if (pd < min_distance) {
          min_val = i;
          min_distance = pd;
        }
      }
      if (min_val != null) {
        vals[min_val][0] += x;
        vals[min_val][1] += y;
        vals[min_val][2] += 1;
      }
    }
  }

  for(let i = 0; i < points.length; i++) {
    let v = vals[i];
    if (v[2] != 0) {
      points[i][0] = v[0] / v[2];
      points[i][1] = v[1] / v[2];
    }
  }
}

// https://github.com/substack/point-in-polygon (MIT license)
function pointInsidePolygon(point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};


// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}


function checkNeighbor(array, x, y, dir, val) {
  if (dir == "w") {
    return (x > 0 && (array[x-1][y] == val));
  } else if (dir == "e") {
    return (x < array.length - 1 && (array[x+1][y] == val));
  } else if (dir == "n") {
    return (y > 0 && (array[x][y-1] == val));
  } else if (dir == "s") {
    return (y < array[x].length - 1 && (array[x][y+1] == val));
  }
}


function detectMobileBrowser() {
  const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
  ];

  return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
  });
}


// Wrap setTimeout so it has pause functionality.
delays = {};
unique = 0;
function delay(callback, delay_time) {
  var d = new Object();
  d.fixed_id = unique;
  unique += 1;
  d.callback = callback;
  d.delay_time = delay_time;
  d.start_time = Date.now();
  d.id = window.setTimeout(d.callback, d.delay_time);
  d.delete_id = window.setTimeout(function() {delete delays[d.fixed_id]}, d.delay_time);
  d.paused = false;
  delays[d.fixed_id] = d;
}


function pauseAllDelays() {
  console.log(delays);
  for ([id, value] of Object.entries(delays)) {
    let d = value;
    if (d.paused == false) {
      console.log("Pausing");
      window.clearTimeout(d.id);
      window.clearTimeout(d.delete_id);
      d.delay_time -= Date.now() - d.start_time;
      d.paused = true;
    }
  }
}


function resumeAllDelays() {
  for ([id, value] of Object.entries(delays)) {
    let d = value;
    if (d.paused == true) {
      d.start_time = Date.now();
      d.id = window.setTimeout(d.callback, d.delay_time);
      d.delete_id = window.setTimeout(function() {delete delays[d.fixed_id]}, d.delay_time);
    }
  }
}

function pick(some_list) {
  return some_list[Math.floor(Math.random() * some_list.length)]
}


function addDedupeSort(some_list, other_list) {
  other_list.forEach((score) => {
    let dupe = false;
    some_list.forEach((score2) => {
      if (score.name == score2.name && score.score == score2.score && score.uid == score2.uid) {
        dupe = true;
      }
    });
    if (!dupe) {
      some_list.push(score);
    }
    some_list.sort(function comp(a, b) {
      return (a.score < b.score || a.score == b.score && b.name < a.name) ? 1 : -1;
    })
  });
}


// points and weights should match length and be nonzero length
function blendPoints(points, weights) {
  let new_point = [0,0];
  for (let i = 0; i < points.length; i++) {
    new_point[0] += points[i][0] * weights[i];
    new_point[1] += points[i][1] * weights[i];
  }
  return new_point;
}


function flicker(item, duration, color_1, color_2) {
  item.flicker_junker = 0
  let color_counter = 0;
  var tween = new TWEEN.Tween(item)
    .to({flicker_junker: 80})
    .duration(duration)
    .onUpdate(function() {
      if (color_counter % 2 == 0) {
        item.tint = color_1;
      } else {
        item.tint = color_2;
      }
      color_counter += 1;
    })
    .onComplete(function() {
      item.tint = color_1;
    })
    .start();
}

// https://scottmcdonnell.github.io/pixi-examples/index.html
function CustomFilter(fragmentSource)
{

    PIXI.Filter.call(this,
        // vertex shader
        null,
        // fragment shader
        fragmentSource
    );
}

CustomFilter.prototype = Object.create(PIXI.Filter.prototype);
CustomFilter.prototype.constructor = CustomFilter;

