
//
// The balloon class defines a balloon.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

Game.prototype.makeBalloon = function(parent, color, anchor_x, anchor_y, top_x, top_y) {
  let self = this;

  let balloon = new PIXI.Container();
  balloon.position.set(anchor_x, anchor_y);

  balloon.parent = parent;
  balloon.color = color;

  balloon.status = "active";

  balloon.tick = 0;
  balloon.rope_density = 30;
  balloon.x_sway = Math.random() * 8;
  balloon.y_sway = Math.random() * 4;
  balloon.sway_ticker = Math.ceil(Math.random() * 3) + 18;

  balloon.top_x = top_x;
  balloon.top_y = top_y;
  balloon.original_x = balloon.top_x;
  balloon.original_y = balloon.top_y;

  balloon.rope_points = [];
  for (let i = 0; i <= balloon.rope_density; i += 1) {
     balloon.rope_points.push(new PIXI.Point(0,0));
  };

  // Move the entire balloon without changing the string
  balloon.reposition = function(new_x, new_y) {
    let dx = new_x - balloon.x;
    let dy = new_y - balloon.y;
    balloon.x += dx;
    balloon.y += dy;
    // balloon.original_x += dx;
    // balloon.original_y += dy;
    // balloon.top_x += dx;
    // balloon.top_y += dy;
  }

  // Push the balloon by a certain amount, which will cause it to rebound
  balloon.push = function(dx, dy) {
    balloon.top_x += dx;
    balloon.top_y += dy;
  }

  // Release the balloon to fly upwards.
  balloon.free = function(x, y, layer) {
    balloon.reposition(x, y);
    balloon.ceiling = balloon.y - 3000;
    balloon.status = "free";
    layer.addChild(balloon);
    balloon.parent = layer;
    game.free_balloons.push(balloon);
  }

  // Update the balloon, rebounding it and gently moving the string
  balloon.update = function() {
    balloon.tick += 1;

    if (balloon.original_x != balloon.top_x) balloon.top_x = 0.93 * balloon.top_x + 0.07 * balloon.original_x;
    if (balloon.original_y != balloon.top_y) balloon.top_y = 0.93 * balloon.top_y + 0.07 * balloon.original_y;

    balloon.sprite.position.set(balloon.top_x + balloon.x_sway * Math.sin(balloon.tick/balloon.sway_ticker), balloon.top_y + balloon.y_sway * Math.sin(balloon.tick/(balloon.sway_ticker+1)));

    for (let i = 0; i <= balloon.rope_density; i += 1) {
      let sway = 10 * i / balloon.rope_density/2;
      if (i > balloon.rope_density / 2) sway = 10 * ((balloon.rope_density - i) / balloon.rope_density/2);
      balloon.rope_points[i].x = i / balloon.rope_density * balloon.sprite.x + sway * Math.sin((balloon.tick + i) / 20);
      balloon.rope_points[i].y = Math.pow(i / balloon.rope_density, 1.5) * balloon.sprite.y;
    }
  }

  balloon.rope = new PIXI.SimpleRope(PIXI.Texture.from("Art/rope_texture.png"), balloon.rope_points);
  balloon.addChild(balloon.rope);

  balloon.sprite = new PIXI.Sprite(PIXI.Texture.from("Art/balloon.png"));
  balloon.sprite.anchor.set(0.5,0.75);
  balloon.sprite.position.set(balloon.top_x, balloon.top_y);
  balloon.sprite.tint = balloon.color;
  balloon.addChild(balloon.sprite);

  balloon.update();

  balloon.parent.addChild(balloon);

  return balloon;
}