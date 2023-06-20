let graph = {
	left_wrist: { left_forearm: 1},
	left_forearm: { left_wrist: 1, left_elbow: 1},
    left_elbow: { left_forearm: 1},
};

let shortestDistanceNode = (distances, visited) => {
    // create a default value for shortest
      let shortest = null;
      
        // for each node in the distances object
      for (let node in distances) {
          // if no node has been assigned to shortest yet
            // or if the current node's distance is smaller than the current shortest
          let currentIsShortest =
              shortest === null || distances[node] < distances[shortest];
              
            // and if the current node is in the unvisited set
          if (currentIsShortest && !visited.includes(node)) {
              // update shortest to be the current node
              shortest = node;
          }
      }
      return shortest;
  };

let findShortestPath = (graph, startNode, endNode) => {

    // track distances from the start node using a hash object
    let distances = {};
    distances[endNode] = "Infinity";
    distances = Object.assign(distances, graph[startNode]);
    // track paths using a hash object
    let parents = { endNode: null };
    for (let child in graph[startNode]) {
        parents[child] = startNode;
    }

    // collect visited nodes
    let visited = [];
    // find the nearest node
    let node = shortestDistanceNode(distances, visited);

    // for that node:
    while (node) {
        // find its distance from the start node & its child nodes
        let distance = distances[node];
        let children = graph[node];

        // for each of those child nodes:
        for (let child in children) {

            // make sure each child node is not the start node
            if (String(child) === String(startNode)) {
                continue;
            } else {
                // save the distance from the start node to the child node
                let newdistance = distance + children[child];
                // if there's no recorded distance from the start node to the child node in the distances object
                // or if the recorded distance is shorter than the previously stored distance from the start node to the child node
                if (!distances[child] || distances[child] > newdistance) {
                    // save the distance to the object
                    distances[child] = newdistance;
                    // record the path
                    parents[child] = node;
                }
            }
        }
        // move the current node to the visited set
        visited.push(node);
        // move to the nearest neighbor node
        node = shortestDistanceNode(distances, visited);
    }

    // using the stored paths from start node to end node
    // record the shortest path
    let shortestPath = [endNode];
    let parent = parents[endNode];
    while (parent) {
        shortestPath.push(parent);
        parent = parents[parent];
    }
    shortestPath.reverse();

    //this is the shortest path
    let results = {
        distance: distances[endNode],
        path: shortestPath,
    };
    return results;
};

// previousNode = "left_wrist";
// shortestPath = findShortestPath(graph, "left_wrist", "belly");
// shortestPathString = JSON.stringify(shortestPath.path);
// pathPresence = shortestPathString.search(previousNode);

var current_node_temp;
var destination_node;
var previousPath;
var foundPath;

function selector(btn) {
    current_node_temp = btn.id;
}

function destinationSelector(btn) {
    destination_node = current_node_temp;
    foundPath = findShortestPath(graph, current_node, destination_node);
    var traversalLength = foundPath.path.length;
    console.log(foundPath);
    console.log(traversalLength);
    move(foundPath.path.length);
}

function move(x) {   
    var path_string = JSON.stringify(foundPath.path);
    var pathPresence = path_string.search(previous_node);
    console.log("Search:" + pathPresence);
    //connection.write("stopAtHallbb("+x+");\n");
    savePreviousPath();
}

function savePreviousPath() {
    previousPath = foundPath;
    previous_node = previousPath.path[previousPath.path.length - 2];
}