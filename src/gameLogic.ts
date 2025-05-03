import { Graph, Vertex, Edge, GameState, VertexAction, ActionType } from './types';

/**
 * Creates a new graph with the specified number of vertices
 */
export const createGraph = (numVertices: number, randomize: boolean = true): Graph => {
  const vertices: Vertex[] = [];
  const edges: Edge[] = [];
  
  // Create vertices with random positions
  for (let i = 0; i < numVertices; i++) {
    vertices.push({
      id: i,
      chips: randomize ? Math.floor(Math.random() * 5) - 2 : 0, // Random between -2 and 2
      position: {
        x: 100 + Math.cos(2 * Math.PI * i / numVertices) * 150,
        y: 100 + Math.sin(2 * Math.PI * i / numVertices) * 150,
      },
    });
  }
  
  // Create edges - for simplicity, we'll create a cycle
  for (let i = 0; i < numVertices; i++) {
    edges.push({
      source: i,
      target: (i + 1) % numVertices,
    });
    
    // Add some random edges for more interesting graphs
    if (randomize && numVertices > 3 && Math.random() > 0.7) {
      let target = Math.floor(Math.random() * numVertices);
      while (target === i || edges.some(e => 
        (e.source === i && e.target === target) || 
        (e.source === target && e.target === i))) {
        target = Math.floor(Math.random() * numVertices);
      }
      
      edges.push({
        source: i,
        target,
      });
    }
  }
  
  return { vertices, edges };
};

/**
 * Gets the degree (number of connected edges) of a vertex
 */
export const getVertexDegree = (graph: Graph, vertexId: number): number => {
  return graph.edges.filter(
    edge => edge.source === vertexId || edge.target === vertexId
  ).length;
};

/**
 * Gets the neighbors of a vertex
 */
export const getNeighbors = (graph: Graph, vertexId: number): number[] => {
  const neighbors: number[] = [];
  
  graph.edges.forEach(edge => {
    if (edge.source === vertexId) {
      neighbors.push(edge.target);
    } else if (edge.target === vertexId) {
      neighbors.push(edge.source);
    }
  });
  
  return neighbors;
};

/**
 * Performs a vertex action (give to or receive from neighbors)
 */
export const performVertexAction = (graph: Graph, action: VertexAction): Graph => {
  const { vertexId, actionType } = action;
  const vertex = graph.vertices.find(v => v.id === vertexId);
  
  if (!vertex) {
    return graph;
  }
  
  const degree = getVertexDegree(graph, vertexId);
  const neighbors = getNeighbors(graph, vertexId);
  
  // Create a new graph to avoid mutating the original
  const newGraph: Graph = {
    vertices: [...graph.vertices],
    edges: [...graph.edges],
  };
  
  let newVertices = [...newGraph.vertices];
  
  if (actionType === ActionType.GIVE) {
    // GIVE action: vertex gives one chip to each neighbor
    // Note: We're removing the check for vertex.chips >= degree to allow firing from negative chips
    
    // Update the source vertex
    newVertices = newVertices.map(v => {
      if (v.id === vertexId) {
        return { ...v, chips: v.chips - degree };
      }
      return v;
    });
    
    // Update the neighbors
    neighbors.forEach(neighborId => {
      const neighborIndex = newVertices.findIndex(v => v.id === neighborId);
      if (neighborIndex !== -1) {
        newVertices[neighborIndex] = {
          ...newVertices[neighborIndex],
          chips: newVertices[neighborIndex].chips + 1,
        };
      }
    });
  } else if (actionType === ActionType.RECEIVE) {
    // RECEIVE action: each neighbor gives one chip to the vertex
    
    // Update the neighbors
    neighbors.forEach(neighborId => {
      const neighborIndex = newVertices.findIndex(v => v.id === neighborId);
      if (neighborIndex !== -1) {
        newVertices[neighborIndex] = {
          ...newVertices[neighborIndex],
          chips: newVertices[neighborIndex].chips - 1,
        };
      }
    });
    
    // Update the target vertex
    newVertices = newVertices.map(v => {
      if (v.id === vertexId) {
        return { ...v, chips: v.chips + degree };
      }
      return v;
    });
  }
  
  return {
    ...newGraph,
    vertices: newVertices,
  };
};

/**
 * Checks if the game is won (all vertices have non-negative chips)
 */
export const checkWinCondition = (graph: Graph): boolean => {
  return graph.vertices.every(vertex => vertex.chips >= 0);
};

/**
 * Initializes a new game state
 */
export const initializeGameState = (numVertices: number = 5): GameState => {
  const graph = createGraph(numVertices);
  
  return {
    graph,
    history: [graph],
    isWon: checkWinCondition(graph),
  };
};

/**
 * Performs a move in the game
 */
export const performMove = (state: GameState, action: VertexAction): GameState => {
  const newGraph = performVertexAction(state.graph, action);
  
  // Only update if the graph actually changed
  if (JSON.stringify(newGraph) === JSON.stringify(state.graph)) {
    return state;
  }
  
  return {
    graph: newGraph,
    history: [...state.history, newGraph],
    isWon: checkWinCondition(newGraph),
  };
};

/**
 * Checks if a vertex can perform the GIVE action
 * Note: We're removing the chip count restriction to allow firing from negative chips
 */
export const canGiveFromVertex = (graph: Graph, vertexId: number): boolean => {
  const vertex = graph.vertices.find(v => v.id === vertexId);
  if (!vertex) return false;
  
  // Always allow giving, regardless of chip count
  return true;
};

/**
 * Checks if a vertex can perform the RECEIVE action
 * (All neighbors must have at least 1 chip to give)
 */
export const canReceiveToVertex = (_: Graph, __: number): boolean => {
  // Always allow receiving, regardless of neighbors' chip counts
  return true;
};

/**
 * Gets the reason why a vertex cannot perform an action
 */
export const getActionDisabledReason = (
  _: Graph,
  __: number,
  ___: ActionType
): string | null => {
  // We're allowing both giving and receiving from any vertex, so no restrictions
  return null;
};

/**
 * Resets the game to a new random state
 */
export const resetGame = (numVertices: number = 5): GameState => {
  return initializeGameState(numVertices);
};

/**
 * Undoes the last move
 */
export const undoMove = (state: GameState): GameState => {
  if (state.history.length <= 1) {
    return state;
  }
  
  const newHistory = [...state.history];
  newHistory.pop();
  const newGraph = newHistory[newHistory.length - 1];
  
  return {
    graph: newGraph,
    history: newHistory,
    isWon: checkWinCondition(newGraph),
  };
};