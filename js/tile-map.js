define(['EventDispatcher', 'game-manager', 'tile'], function (EventDispatcher, GM, Tile) {
    'use strict';
    const DIRS = [
        vec2.fromValues(0, -1),
        vec2.fromValues(1, -1),

        vec2.fromValues(-1, 0),
        vec2.fromValues(1, 0),

        vec2.fromValues(-1, 1),
        vec2.fromValues(0, 1)
    ];

    function TileMap() {
        var self = this,
            idToTile = new Map();
        self.tiles = [];

        self.size = vec2.fromValues(0, 0);

        function* NeighborIterator(tile) {
            var sPos = tile.tilePos,
                tPos = vec2.create();
            for (var dir of DIRS) {
                vec2.add(tPos, sPos, dir);
                if (tPos[0] < 0 || tPos[1] < 0 || tPos[0] >= self.size[0] || tPos[1] >= self.size[1])
                    continue;
                if (
                    yield self.tiles[tPos[0]][tPos[1]])
                    return;
            }
        }

        function* TileIterator() {
            var tiles = self.tiles;
            for (var row of tiles) {
                for (var tile of row) {
                    if (
                        yield tile) {
                        break;
                    }
                }
            }
        }


        function heuristicCostEstimate(start, goal) {
            return vec2.dist(start.tilePos, goal.tilePos);
        }

        function distBetween(start, end) {
            return end.moveCost;
        }

        function getMinTile(openSet, fScore) {
            var minVal = Infinity,
                minTile = null;
            openSet.forEach(function (tile) {
                var val = fScore.get(tile);
                if (val < minVal) {
                    minVal = val;
                    minTile = tile;
                }

            });
            return minTile;
        }

        function reconstructPath(cameFrom, current) {
            var totalPath = [current];
            while (cameFrom.has(current)) {
                current = cameFrom.get(current);
                totalPath.unshift(current);
            };
            return totalPath;
        }
        self.TileIterator = TileIterator;
        self.PathTo = function (startTile, endTile) {
            if (!startTile.closed || !endTile.closed) {
                var closedSet = new WeakSet(),
                    openSet = new Set([startTile]),
                    cameFrom = new Map(),
                    gScore = new Map(),
                    fScore = new Map();

                gScore.set(startTile, 0);
                fScore.set(startTile, heuristicCostEstimate(startTile, endTile));
                try {
                    while (openSet.values().length !== 0) {
                        var current = getMinTile(openSet, fScore);

                        if (current === endTile) {
                            return reconstructPath(cameFrom, endTile);
                        }

                        //console.log(current);
                        openSet.delete(current);
                        closedSet.add(current);

                        if (current.closed) continue;
                        var currentGScore = gScore.get(current);

                        for (var neighbor of NeighborIterator(current)) {
                            //console.log(neighbor);
                            if (closedSet.has(neighbor))
                                continue;
                            else if (neighbor.closed) {
                                closedSet.add(neighbor);
                                continue;
                            }
                            var tentativeGScore = currentGScore + distBetween(startTile, endTile),
                                notInOpen = !openSet.has(neighbor);

                            if (notInOpen || tentativeGScore < gScore.get(neighbor)) {
                                cameFrom.set(neighbor, current);
                                gScore.set(neighbor, tentativeGScore);
                                fScore.set(neighbor, tentativeGScore + heuristicCostEstimate(neighbor, endTile));
                                if (notInOpen) {
                                    openSet.add(neighbor);
                                }
                            }
                        }
                    }
                } catch (e) {
                    debugger;
                }
            }
            return false;
        };
        self.PathFromSelections = function () {
            let selections = GM.selections,
                startTile = null,
                endTile = null,
                fullPath = [];
            if (selections.size > 1) {
                for (let selection of selections) {
                    if (startTile) {
                        endTile = selection[1];
                        let path = self.PathTo(startTile, endTile);
                        if (!path)
                            return false;
                        fullPath = fullPath.concat(path);

                        startTile = endTile;
                    } else {
                        startTile = selection[1];
                    }
                }
            }
            selections.clear();
            return fullPath;
        };
        self.findPossibleMovement = function (unit) {
            var startTile = GM.GetObjById(unit.tileId),
                totalMP = unit.movePoints,
                tiles = new Set();



            function findNeighbors(tile, avaliableMP) {
                var neighborIt = NeighborIterator(tile);
                for (var neighbor of neighborIt) {
                    tiles.add(neighbor);
                    var remainingMP = avaliableMP - neighbor.moveCost;
                    if (remainingMP > 0) {
                        findNeighbors(neighbor, remainingMP);
                    }
                }

            }

            if (totalMP > 0) {
                findNeighbors(startTile, totalMP);
            }

            return tiles;
        };
        const tileClosedChance = [false, true, false, false]; // 1 out of 4 aka 25%
        self.Init = function (size, random) {
            console.log(size);
            self.size = size;
            for (var x = 0; x < size[0]; ++x) {
                var row = [];
                for (var y = 0; y < size[1]; ++y) {
                    var closed = false,
                        penalty = 0;
                    if (random) {
                        closed = tileClosedChance[Math.floor(Math.random() * 3)];
                        penalty = Math.random() * 2;
                    }

                    row[y] = new Tile(vec2.fromValues(x, y), closed, penalty, {
                        neighbors: []
                    });
                    GM.AddObj(row[y]);
                }
                self.tiles[x] = row;

            }
            return self;
        }
    }
    TileMap.prototype.constructor = TileMap;
    EventDispatcher.prototype.apply(TileMap.prototype);
    return TileMap;
});