export const UNITS = [
	"g",
	"kg",
	"ml",
	"l",
	"tsp",
	"tbsp",
	"piece",
	"pinch",
] as const;

export type Unit = (typeof UNITS)[number];