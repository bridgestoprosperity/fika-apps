// Shared handoff for the live Impact Map controller so components outside
// ImpactMap.svelte (e.g. the print dialog) can reach the Mapbox map.
// Only written on the client (in onMount), never during SSR.
export const mapRegistry = $state({ controller: null });
