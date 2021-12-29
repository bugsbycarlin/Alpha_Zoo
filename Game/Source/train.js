
//
// The train class defines a train.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

Game.prototype.makeTrain = function(parent, color, type, x, y) {
  let self = this;

  let train = new PIXI.Container();
  train.position.set(anchor_x, anchor_y);

  train.parent = parent;
  train.color = color;

  train.status = "active";

  train.tick = 0;
  train.rope_density = 30;
  train.x_sway = Math.random() * 8;
  train.y_sway = Math.random() * 4;
  train.sway_ticker = Math.ceil(Math.random() * 3) + 18;

  train.top_x = top_x;
  train.top_y = top_y;
  train.original_x = train.top_x;
  train.original_y = train.top_y;

  train.rope_points = [];
  for (let i = 0; i <= train.rope_density; i += 1) {
     train.rope_points.push(new PIXI.Point(0,0));
  };

  // Move the entire train without changing the string
  train.reposition = function(new_x, new_y) {
    let dx = new_x - train.x;
    let dy = new_y - train.y;
    train.x += dx;
    train.y += dy;
    // train.original_x += dx;
    // train.original_y += dy;
    // train.top_x += dx;
    // train.top_y += dy;
  }

  // Push the train by a certain amount, which will cause it to rebound
  train.push = function(dx, dy) {
    train.top_x += dx;
    train.top_y += dy;
  }

  // Release the train to fly upwards.
  train.free = function(x, y, layer) {
    train.reposition(x, y);
    train.ceiling = train.y - 3000;
    train.status = "free";
    layer.addChild(train);
    train.parent = layer;
    game.free_trains.push(train);
  }

  // Update the train, rebounding it and gently moving the string
  train.update = function() {
  }

  // train.rope = new PIXI.SimpleRope(PIXI.Texture.from("Art/rope_texture.png"), train.rope_points);
  // train.addChild(train.rope);

  // train.sprite = new PIXI.Sprite(PIXI.Texture.from("Art/train.png"));
  // train.sprite.anchor.set(0.5,0.75);
  // train.sprite.position.set(train.top_x, train.top_y);
  // train.sprite.tint = train.color;
  // train.addChild(train.sprite);

  train.update();

  train.parent.addChild(train);

  return train;
}