define(["underscore"], function (underscore) {
    'use strict';

    function Tile(tilePos, closed, moveCost, state) {
        var self = this;
        self.tilePos = tilePos;
        //TODO: Break this out
        self.state = state;
        self.children = new WeakSet();
        self.moveCost = moveCost || 1;
        self.closed = closed || false;
        self.tag = "tile";
        self.id = underscore.uniqueId(`${self.tag}_`);
    }
    return Tile;
});