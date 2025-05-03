/**
 * Types for the Dollar Game implementation
 */

// Represents a vertex in the graph
export interface Vertex {
  id: number;
  chips: number;  // Number of chips/money (can be negative)
  position: {
    x: number;
    y: number;
  };
}

// Represents an edge between two vertices
export interface Edge {
  source: number;  // ID of source vertex
  target: number;  // ID of target vertex
}

// Represents the entire graph
export interface Graph {
  vertices: Vertex[];
  edges: Edge[];
}

// Game state
export interface GameState {
  graph: Graph;
  history: Graph[];  // History of graph states for undo functionality
  isWon: boolean;
}

// Action types
export enum ActionType {
  GIVE = 'give',
  RECEIVE = 'receive'
}

// Action for vertex interactions
export interface VertexAction {
  vertexId: number;
  actionType: ActionType;
}