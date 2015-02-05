requirejs.config({
    scriptType: navigator.userAgent.indexOf("Firefox") !== -1 ? "text/javascript;version=1.8" : "text/javascript",
    paths: {
        "underscore": "../bower_components/underscore/underscore-min"
    }
});
require(['tile-map', 'unit', 'graphics'], function (TileMap, Unit, Graphics) {
    'use strict';
    var tileMap = new TileMap().Init(vec2.fromValues(10, 10), true);
    window.tileMap = tileMap;
    console.log(tileMap);

    window.path = tileMap.PathTo(tileMap.tiles[0][0], tileMap.tiles[9][9]);
    window.Graphics = Graphics;
    Graphics.initialize(vec2.fromValues(500, 500));
    Graphics.tileMap = tileMap;
    Graphics.setupTiles();
    Graphics.drawTiles();
    //Graphics.drawTile();
});