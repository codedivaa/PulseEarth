export interface LayerState {
  heatmap: boolean      // economic gradient by GDP per capita
  tradeRoutes: boolean  // animated arcs for major bilateral flows
  cityNetwork: boolean  // economic hub connections
  investment: boolean   // green/yellow/red country overlay
  news: boolean         // AI economic news in sidebar
  timeline: boolean     // historical year slider
}

export const DEFAULT_LAYERS: LayerState = {
  heatmap: false,
  tradeRoutes: false,
  cityNetwork: false,
  investment: false,
  news: false,
  timeline: false,
}
