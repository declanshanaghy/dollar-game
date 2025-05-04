import { Graph, Vertex, Edge, GameState, VertexAction, ActionType } from './types';

/**
 * Calculates the genus (Betti number) of the graph
 * Formula: E - V + 1 (where E is the number of edges and V is the number of vertices)
 */
export const calculateGenus = (graph: Graph): number => {
  const numEdges = graph.edges.length;
  const numVertices = graph.vertices.length;
  return numEdges - numVertices + 1;
};

/**
 * Calculates the total money in the graph
 */
export const calculateTotalMoney = (graph: Graph): number => {
  return graph.vertices.reduce((sum, vertex) => sum + vertex.chips, 0);
};

/**
 * Determines if the game is winnable based on the genus
 * A game is winnable if the total money >= genus
 */
export const isGameWinnable = (graph: Graph): boolean => {
  const genus = calculateGenus(graph);
  const totalMoney = calculateTotalMoney(graph);
  return totalMoney >= genus;
};

/**
 * Creates a new graph with the specified number of vertices, edge density, and total money
 */
export const createGraph = (
  numVertices: number,
  edgeDensity: number = 30,
  totalMoney: number = 5,
  randomize: boolean = true
): Graph => {
  const vertices: Vertex[] = [];
  const edges: Edge[] = [];
  
  // Create vertices with random positions
  for (let i = 0; i < numVertices; i++) {
    vertices.push({
      id: i,
      chips: 0, // Initialize with 0, we'll distribute money later
      position: {
        x: 300 + Math.cos(2 * Math.PI * i / numVertices) * 250,
        y: 300 + Math.sin(2 * Math.PI * i / numVertices) * 250,
      },
    });
  }
  
  // Create edges - for simplicity, we'll create a cycle
  for (let i = 0; i < numVertices; i++) {
    edges.push({
      source: i,
      target: (i + 1) % numVertices,
    });
  }
  
  // Add additional edges based on edge density
  if (randomize && numVertices > 3) {
    // Calculate maximum possible additional edges (fully connected graph minus the cycle)
    const maxPossibleEdges = (numVertices * (numVertices - 1)) / 2 - numVertices;
    
    // Calculate how many additional edges to add based on density
    const additionalEdgesToAdd = Math.floor((maxPossibleEdges * edgeDensity) / 100);
    
    // Add random edges
    let addedEdges = 0;
    let attempts = 0;
    const maxAttempts = maxPossibleEdges * 3; // Avoid infinite loop
    
    while (addedEdges < additionalEdgesToAdd && attempts < maxAttempts) {
      attempts++;
      
      const source = Math.floor(Math.random() * numVertices);
      let target = Math.floor(Math.random() * numVertices);
      
      // Avoid self-loops and duplicate edges
      if (target === source || edges.some(e =>
        (e.source === source && e.target === target) ||
        (e.source === target && e.target === source))) {
        continue;
      }
      
      edges.push({
        source,
        target,
      });
      
      addedEdges++;
    }
  }
  
  // Distribute money among vertices
  if (randomize && totalMoney > 0) {
    // First, distribute money randomly
    let remainingMoney = totalMoney;
    
    // Ensure each vertex has a chance to get money
    for (let i = 0; i < numVertices && remainingMoney > 0; i++) {
      const amount = Math.floor(Math.random() * 3) + 1; // 1-3 chips
      const actualAmount = Math.min(amount, remainingMoney);
      
      vertices[i].chips = actualAmount;
      remainingMoney -= actualAmount;
    }
    
    // Distribute any remaining money randomly
    while (remainingMoney > 0) {
      const vertexIndex = Math.floor(Math.random() * numVertices);
      vertices[vertexIndex].chips += 1;
      remainingMoney -= 1;
    }
    
    // Make some vertices negative to make the game challenging
    // The sum of all chips should still equal totalMoney
    for (let i = 0; i < Math.min(numVertices / 2, 3); i++) {
      const vertexIndex = Math.floor(Math.random() * numVertices);
      const negativeAmount = Math.floor(Math.random() * 3) + 1; // 1-3 negative chips
      
      // Find a vertex with enough positive chips to balance
      const positiveVertices = vertices.filter(v => v.chips > negativeAmount);
      if (positiveVertices.length > 0) {
        const positiveIndex = Math.floor(Math.random() * positiveVertices.length);
        const positiveVertex = positiveVertices[positiveIndex];
        
        // Make the selected vertex negative
        vertices[vertexIndex].chips -= negativeAmount;
        
        // Add the same amount to the positive vertex to maintain the total
        const positiveVertexIndex = vertices.findIndex(v => v.id === positiveVertex.id);
        vertices[positiveVertexIndex].chips += negativeAmount;
      }
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
export const initializeGameState = (
  numVertices: number = 5,
  edgeDensity: number = 30,
  totalMoney: number = 5
): GameState => {
  const graph = createGraph(numVertices, edgeDensity, totalMoney);
  const genus = calculateGenus(graph);
  
  return {
    graph,
    history: [graph],
    isWon: checkWinCondition(graph),
    genus: genus,
    isWinnable: isGameWinnable(graph),
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
  
  const genus = calculateGenus(newGraph);
  
  return {
    graph: newGraph,
    history: [...state.history, newGraph],
    isWon: checkWinCondition(newGraph),
    genus: genus,
    isWinnable: isGameWinnable(newGraph),
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
export const resetGame = (
  numVertices: number = 5,
  edgeDensity: number = 30,
  totalMoney: number = 5
): GameState => {
  return initializeGameState(numVertices, edgeDensity, totalMoney);
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
  const genus = calculateGenus(newGraph);
  
  return {
    graph: newGraph,
    history: newHistory,
    isWon: checkWinCondition(newGraph),
    genus: genus,
    isWinnable: isGameWinnable(newGraph),
  };
};