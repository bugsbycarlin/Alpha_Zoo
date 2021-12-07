
//
// The cafe_exterior class defines the exterior of a cafe.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

Game.prototype.makeCafeExterior = function(pen) {
  let self = this;

  let cafe = new PIXI.Container();

  cafe.pen = pen;

  cafe.exterior = new PIXI.Sprite(PIXI.Texture.from("Art/Cafe/exterior.png"));
  cafe.exterior.visible = false;
  cafe.exterior.anchor.set(0.5, (800-86)/800); // the center, the door, is 86 pixels from the bottom of the 800px file.
  cafe.exterior.scale.set(1,1);
  cafe.exterior.position.set(0, 0);
  cafe.addChild(cafe.exterior);

  cafe.exterior_grey = new PIXI.Sprite(PIXI.Texture.from("Art/Cafe/exterior_grey.png"));
  cafe.exterior_grey.visible = true;
  cafe.exterior_grey.anchor.set(0.5, (800-86)/800); // the center, the door, is 86 pixels from the bottom of the 800px file.
  cafe.exterior_grey.scale.set(1,1);
  cafe.exterior_grey.position.set(0, 0);
  cafe.addChild(cafe.exterior_grey);

  cafe.grey = function() {
    cafe.exterior.visible = false;
    cafe.exterior_grey.visible = true;
    cafe.pen.polygon = cafe.pen.grey_polygon;
  }

  cafe.ungrey = function() {
    cafe.exterior.visible = true;
    cafe.exterior_grey.visible = false;
    cafe.pen.polygon = cafe.pen.ungrey_polygon;
  }

  return cafe;
}