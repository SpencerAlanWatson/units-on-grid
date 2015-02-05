define(['underscore'], function (underscore) {
    'use strict';

    function Unit(tileId, state) {
        var self = this;
        self.tileId = tileId;
        self.tag = "unit";
        self.id = underscore.uniqueId(`${self.tag}_`);
        //TODO:  branch this out;
        self.state = state;
        
        //self.hasMoved = false;
        self.movePoints = 1;
    }
    Unit.prototype.constructor = Unit;
    return Unit;
});