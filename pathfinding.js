var unvisitedList = [];
var closedList = [];
var endTile = null;
var pathfindingNow = false;
var initialTile;
var consideredInitialTile = false;
var endC;
var endR;

function SetupPathfindingGridData() {
    
    

    unvisitedList = [];
    endTile = null;
    pathfindingNow = false;

    if(grid.length > 0) { // non-zero, copy over player set walls into tileGrid for reset
        for (var eachCol = 0; eachCol < TILE_COLS; eachCol++) {
            for (var eachRow = 0; eachRow < TILE_ROWS; eachRow++) {
                var idxHere = tileCoordToIndex(eachCol, eachRow);
                if(grid[idxHere].elementType == VISITED ||
                    grid[idxHere].elementType == PATH) {
                    tileGrid[idxHere] = NOTHING;
                } else {
                    tileGrid[idxHere] = grid[idxHere].elementType;
                }
            }
        }
    }

    grid = [];

    for (var eachCol = 0; eachCol < TILE_COLS; eachCol++) {
        for (var eachRow = 0; eachRow < TILE_ROWS; eachRow++) {
            var idxHere = tileCoordToIndex(eachCol, eachRow);

            grid[idxHere] = new GridElement();
            unvisitedList.push( grid[idxHere] );
            // passes in the col/row so it knows where it is
            // the index in the gridArray, and what type of tile it is
            grid[idxHere].setup(eachCol, eachRow, idxHere, tileGrid[idxHere]);

            if (grid[idxHere].elementType == DEST) {
                endC = eachCol;
                endR = eachRow;   
            }

        }
    }
}

function PathfindingNextStep() {
    var tentativeDistance=0;

    if(unvisitedList.length > 0) {

        var currentTile;

        if (consideredInitialTile == false) {
            currentTile = initialTile;
            consideredInitialTile = true;
        } else {
            var shortestFCostFound = INFINITY_START_DISTANCE;
            for (var i = 0; i < unvisitedList.length; i++) {
                if (unvisitedList[i].fCost < shortestFCostFound) {
                    shortestFCostFound = unvisitedList[i].fCost;
                    currentTile = unvisitedList[i];
                }
            }
        }

        arrayRemove(unvisitedList,currentTile);
        closedList.push(currentTile);

        var neighborsStillInUnvisitedList = currentTile.myUnvisitedNeighbors();
        for (var i=0; i<neighborsStillInUnvisitedList.length; i++) {
          var neighborTile = neighborsStillInUnvisitedList[i];

          if (arrayContains(closedList, neighborTile)) {
                continue;
          } 
          
          if (neighborTile.isTileType(NOTHING)) {
            tentativeDistance = currentTile.distance+1;
            neighborTile.setDistIfLess(tentativeDistance, currentTile);
            neighborTile.hVal =  neighborTile.calculateHVal(endC, endR);
            neighborTile.fCost = neighborTile.distance + neighborTile.hVal;
            neighborTile.setTile(VISITED);
          } else if (neighborTile.isTileType(DEST)) {
            tentativeDistance = currentTile.distance+1;
            neighborTile.setDistIfLess (tentativeDistance, currentTile);
            endTile=neighborTile;
            unvisitedList = []; //// empty the unvisitedList since we've found the end
          }
        }
      
      } else { //// all nodes have been accounted for, work backward from end's tiles for path
             //// terminate the algorithm from taking further steps since we found what we needed
        if (endTile!=null) {
          console.log("Best distance found: " + endTile.distance);
         
          // walk backward from destination to create the path
          var previousTile = endTile.cameFrom;
          
          for (var pathIndex = endTile.distance; pathIndex>1; pathIndex--) {
            previousTile.setTile(PATH);
            previousTile = previousTile.cameFrom;  
          }
        }
        pathfindingNow = false;
        consideredInitialTile = false;
      }
}
