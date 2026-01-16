
//
// The marimba class defines a marimba.
//
// Copyright 2026 Alpha Zoo LLC.
// Written by Matthew Carlin
//

Game.prototype.makeMarimba = function(pen) {
  let self = this;

  let marimba = new PIXI.Container();

  marimba.pen = pen;

  marimba.exterior = new PIXI.Sprite(PIXI.Texture.from("Art/marimba.png"));
  marimba.exterior.visible = false;
  marimba.exterior.anchor.set(0.5, (400-100)/400); // the center is 100 pixels from the bottom of the 400px file.
  marimba.exterior.scale.set(0.5,0.5);
  marimba.exterior.position.set(0, 0);
  marimba.addChild(marimba.exterior);

  marimba.exterior_grey = new PIXI.Sprite(PIXI.Texture.from("Art/marimba_grey.png"));
  marimba.exterior_grey.visible = true;
  marimba.exterior_grey.anchor.set(0.5, (400-100)/400); // the center is 100 pixels from the bottom of the 400px file.
  marimba.exterior_grey.scale.set(0.5,0.5);
  marimba.exterior_grey.position.set(0, 0);
  marimba.addChild(marimba.exterior_grey);

  marimba.grey = function() {
    marimba.exterior.visible = false;
    marimba.exterior_grey.visible = true;
    marimba.pen.polygon = marimba.pen.grey_polygon;
  }

  marimba.ungrey = function() {
    marimba.exterior.visible = true;
    marimba.exterior_grey.visible = false;
    marimba.pen.polygon = marimba.pen.ungrey_polygon;
  }

  return marimba;
}