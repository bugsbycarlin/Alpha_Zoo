
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

  balloon.tick = 0;
  balloon.rope_density = 30;
  balloon.x_sway = Math.random() * 8;
  balloon.y_sway = Math.random() * 4;
  balloon.sway_ticker = Math.ceil(Math.random() * 3) + 18;

  balloon.top_x = top_x;
  balloon.top_y = top_y;

  balloon.rope_points = [];
  for (let i = 0; i <= balloon.rope_density; i += 1) {
     balloon.rope_points.push(new PIXI.Point(0,0));
  };

  balloon.update = function() {
    balloon.tick += 1;

    // if (balloon.tick % 20 == 0 && Math.random() < 0.25) {
    //   balloon.x_sway = Math.random() * 8;
    // }
    // if (balloon.tick % 21 == 0 && Math.random() < 0.25) {
    //   balloon.y_sway = Math.random() * 8;
    // }

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