
//
// The gift_shop_exterior class defines the exterior of a gift shop.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

Game.prototype.makeGiftShopExterior = function(pen) {
  let self = this;

  let gift_shop = new PIXI.Container();

  gift_shop.pen = pen;

  gift_shop.exterior = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/exterior.png"));
  gift_shop.exterior.visible = false;
  gift_shop.exterior.anchor.set(0.5, (800-86)/800); // the center, the door, is 86 pixels from the bottom of the 800px file.
  gift_shop.exterior.scale.set(1,1);
  gift_shop.exterior.position.set(0, 0);
  gift_shop.addChild(gift_shop.exterior);

  gift_shop.exterior_grey = new PIXI.Sprite(PIXI.Texture.from("Art/Gift_Shop/exterior_grey.png"));
  gift_shop.exterior_grey.visible = true;
  gift_shop.exterior_grey.anchor.set(0.5, (800-86)/800); // the center, the door, is 86 pixels from the bottom of the 800px file.
  gift_shop.exterior_grey.scale.set(1,1);
  gift_shop.exterior_grey.position.set(0, 0);
  gift_shop.addChild(gift_shop.exterior_grey);

  gift_shop.grey = function() {
    gift_shop.exterior.visible = false;
    gift_shop.exterior_grey.visible = true;
    gift_shop.pen.polygon = gift_shop.pen.grey_polygon;
  }

  gift_shop.ungrey = function() {
    gift_shop.exterior.visible = true;
    gift_shop.exterior_grey.visible = false;
    gift_shop.pen.polygon = gift_shop.pen.ungrey_polygon;
  }

  return gift_shop;
}