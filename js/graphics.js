define(['game-manager'], function (GM) {
    'use strict';
    const TAO = Math.PI * 2;
    const TILE_RADIUS = 20;
    const TILE_PATH = new Path2D();
    const TILE_SIZE = vec2.fromValues(
        TILE_RADIUS * Math.cos((TAO / 4) + ((TAO / 6) * 4)) * 2,
        TILE_RADIUS * 2
    );
    const TILE_OFFSET = vec2.fromValues(TILE_SIZE[0] / 2, TILE_SIZE[1] - TILE_SIZE[1] / 4);


    function Graphics() {
        var self = this;
        var loopId = 0;
        self.tileMap = null;
        self.loopRunning = false;
        self.contexts = new Map();
        self.container = null;
        self.makeCanvas = function (id, parent) {
            var canvas = document.createElement('canvas');
            canvas.classList.add('abs-canvas');
            canvas.id = id;
            canvas.width = self.screenSize[0];
            canvas.height = self.screenSize[1];


            parent.appendChild(canvas);
            return canvas.getContext('2d');
        };
        self.initialize = function (screenSize) {
            self.screenSize = screenSize;
            self.container = document.getElementById('main-canvas-container');
            let tileCtx = self.makeCanvas('tile-canvas', self.container),
                mainCtx = self.makeCanvas('main-canvas', self.container),
                hitCtx = self.makeCanvas('hit-canvas', self.container);

            self.contexts.set('tile', tileCtx);
            self.contexts.set('main', mainCtx);
            self.contexts.set('hit', hitCtx);

            function OnClick(event) {
                if (event.region) {
                    console.log("Position", GM.GetObjById(event.region).tilePos);
                    GM.OnClick(event.region, event);
                }
            };
            //self.container.addEventListener("click", OnClick);
            hitCtx.canvas.addEventListener("click", OnClick);
        };
        self.drawLoop = function (timestamp) {
            loopId = window.requestAnimationFrame(self.drawLoop);
            self.drawTiles();
        };
        self.startLoop = function () {
            //Just to make sure we do not have two loops going at once
            window.cancelAnimationFrame(loopId);
            loopId = window.requestAnimationFrame(self.drawLoop);
            self.loopRunning = true;
        };
        self.stopLoop = function () {
            window.cancelAnimationFrame(loopId);
            self.loopRunning = false;
        };
        self.offsetAng = TAO / 4;
        self.tileRadius = 20;
        self.tileXRadius = self.tileRadius * Math.cos((TAO / 6 * 5) + self.offsetAng);
        self.tileXDiameter = self.tileXRadius * 2;
        self.tileYDiameter = self.tileRadius * 1.5;

        /**
         * Clears the Screen by adding, and then removing one pixel from the width.
         * Also, resets the transformation of the canvas
         */
        self.clear = function (ctx) {
            ++ctx.canvas.width;
            --ctx.canvas.width;
        };
        self.setupTiles = function () {
            console.time("Setting Up Tiles");
            const MAX_X = self.tileMap.size[0],
                MAX_X_ODD = MAX_X - 1,
                MAX_Y = self.tileMap.size[1],
                TILE_MAP = self.tileMap;

            var offsetX = TILE_SIZE[0], //TILE_OFFSET[0],
                offsetY = TILE_OFFSET[1],
                isEven = true,
                ctx = self.contexts.get('tile'),
                hitCtx = self.contexts.get('hit');

            console.log(offsetX, offsetY, MAX_X, MAX_Y);
            self.clear(ctx);
            self.clear(hitCtx);

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.translate(offsetX, offsetY);
            hitCtx.translate(offsetX, offsetY);
            for (var y = 0; y < MAX_Y; ++y) {
                for (var x = 0; x < MAX_X; ++x) {
                    let tile = TILE_MAP.tiles[isEven ? x : MAX_X_ODD - x][y];
                    ctx.stroke(TILE_PATH);
                    hitCtx.addHitRegion({
                        path: TILE_PATH,
                        id: tile.id //`${isEven ? x : MAX_X_ODD - x} ${y}`,
                            //control: self.container
                    });
                    ctx.fillText(tile.moveCost.toFixed(2), 0, 0);
                    ctx.translate(offsetX, 0);

                    hitCtx.translate(offsetX, 0);
                }
                offsetX *= -1;

                ctx.translate(offsetX / 2, offsetY);
                hitCtx.translate(offsetX / 2, offsetY);
                isEven = !isEven;
            }
            console.timeEnd("Setting Up Tiles");

        };

        self.drawTile = function () {
            let ctx = self.contexts.get('tile');
            ctx.stroke(TILE_PATH);
        };
        self.drawTiles = function (path) {
            console.time("Draw Tiles");
            const MAX_X = self.tileMap.size[0],
                MAX_X_ODD = MAX_X - 1,
                MAX_Y = self.tileMap.size[1],
                TILE_MAP = self.tileMap,
                SELECTED = GM.selections;


            var offsetX = TILE_SIZE[0], //TILE_OFFSET[0],
                offsetY = TILE_OFFSET[1],
                isEven = true,
                ctx = self.contexts.get('main');

            path = path || [];

            console.log(offsetX, offsetY, MAX_X, MAX_Y);
            self.clear(ctx);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.translate(offsetX, offsetY);

            function InnerDraw(tile) {
                if (tile.closed) {
                    ctx.fillStyle = "black";
                    ctx.fill(TILE_PATH);
                } else if (SELECTED.has(tile.id)) {
                    ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
                    ctx.fill(TILE_PATH);
                } else if (path.indexOf(tile) !== -1) {
                    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
                    ctx.fill(TILE_PATH);
                }
                ctx.translate(offsetX, 0);
            }
            for (var y = 0; y < MAX_Y; ++y) {
                if (isEven) {
                    for (var x = 0; x < 10; ++x) {
                        InnerDraw(TILE_MAP.tiles[x][y]);
                    }
                } else {
                    for (var x = MAX_X_ODD; x >= 0; --x) {
                        InnerDraw(TILE_MAP.tiles[x][y]);
                    }
                }
                offsetX *= -1;

                ctx.translate(offsetX / 2, offsetY);
                isEven = !isEven
            }
            console.timeEnd("Draw Tiles");

        };
        self.pathTile = function (ctx, xOffset, yOffset) {
            ctx.beginPath();
            //ctx.moveTo(tileDiameter, self.tileRadius);
            for (var ang = 0, it = TAO / 6; ang < TAO; ang += it) {
                var x = Math.cos(ang + self.offsetAng) * self.tileRadius,
                    y = Math.sin(ang + self.offsetAng) * self.tileRadius;
                //console.log(ang, ang/it, x, y);
                ctx.lineTo(x + xOffset, y + yOffset);
            }
            ctx.stroke();
        };

        self.drawTilesOld = function (path) {
            self.canvas.width++;
            self.canvas.width--;
            path = path || [];
            var ctx = self.ctx;
            var tileIt = self.tileMap.TileIterator();
            for (var tile of tileIt) {
                var tilePos = tile.tilePos;
                var xOffset = self.tileXRadius + tilePos[0] * self.tileXDiameter + ((tilePos[1] % 2) * self.tileXRadius),
                    yOffset = self.tileRadius + tilePos[1] * self.tileYDiameter;
                self.pathTile(ctx, xOffset, yOffset);
                ctx.stroke();
                if (tile.closed) {
                    ctx.fill();
                } else {

                    var text = tile.penalty.toFixed(3);
                    var measure = ctx.measureText(text);
                    console.log(text, measure);
                    ctx.fillText(text, xOffset - measure.width / 2, yOffset);
                }
            }
        };

        self.drawPath = function (path) {
            var ctx = self.contexts.get('main');
            self.clear(ctx);
            self.ctx.fillStyle = "#ffaaaa";
            path.forEach(function (tile) {
                var tilePos = tile.tilePos,
                    xOffset = self.tileXRadius + tilePos[0] * self.tileXDiameter + ((tilePos[1] % 2) * self.tileXRadius),
                    yOffset = self.tileRadius + tilePos[1] * self.tileYDiameter;
                self.pathTile(self.ctx, xOffset, yOffset);
                self.ctx.fill();
                var text = tile.penalty.toFixed(3);
                var measure = self.ctx.measureText(text);
                console.log(text, measure);
                self.ctx.fillStyle = "#000000";

                self.ctx.fillText(text, xOffset - measure.width / 2, yOffset);
                self.ctx.fillStyle = "#ffaaaa";

            });
            self.ctx.fillStyle = "#000000";
        };
    }

    (function () {
        // or c = a => Math.cos(a); in ECMAScript 6 (damn chrome)
        var offset = TAO / 4,
            normal = TAO / 6;

        //TILE_SIZE[0] = TILE_RADIUS * Math.cos(Math.PI + Math.PI / 3) * 2;
        //TILE_SIZE[1] = 40;


        TILE_PATH.moveTo(TILE_RADIUS * Math.cos(normal * 0 + offset), TILE_RADIUS * Math.sin(normal * 0 + offset));
        TILE_PATH.lineTo(TILE_RADIUS * Math.cos(normal * 1 + offset), TILE_RADIUS * Math.sin(normal * 1 + offset));
        TILE_PATH.lineTo(TILE_RADIUS * Math.cos(normal * 2 + offset), TILE_RADIUS * Math.sin(normal * 2 + offset));
        TILE_PATH.lineTo(TILE_RADIUS * Math.cos(normal * 3 + offset), TILE_RADIUS * Math.sin(normal * 3 + offset));
        TILE_PATH.lineTo(TILE_RADIUS * Math.cos(normal * 4 + offset), TILE_RADIUS * Math.sin(normal * 4 + offset));
        TILE_PATH.lineTo(TILE_RADIUS * Math.cos(normal * 5 + offset), TILE_RADIUS * Math.sin(normal * 5 + offset));
        TILE_PATH.lineTo(TILE_RADIUS * Math.cos(normal * 6 + offset), TILE_RADIUS * Math.sin(normal * 6 + offset));
    }());

    return new Graphics();
});