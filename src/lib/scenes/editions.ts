import type { Collection, Region, Scene, Shape } from "../types";
import { BONUS_SCENES } from "./bonus";
import { c, e, p, poly, r } from "./shapes";

const EDITIONS: Record<string, string[]> = {
  meadow: [
    "Flower Parade", "Sunny Picnic", "Rainbow Garden", "Honey Morning", "Cloudy Day", "Little Adventures",
    "Blossom Festival", "Butterfly Picnic", "Starlit Garden", "Sweet Spring", "Wildflower Walk", "Happy Meadow",
    "Cherry Blossom", "Breezy Afternoon", "Garden Party", "Daisy Days", "Cozy Corner", "Confetti Picnic",
    "Morning Dew", "Lovely Leaves", "Dreamy Day", "Tiny Treasures", "Springtime Magic", "The Great Outdoors",
  ],
  zoom: [
    "Cloud Cruise", "The Big Race", "Sunshine Speedway", "Rainbow Route", "Starry Skies", "Little Journey",
    "Adventure Express", "Cloud Nine", "Happy Highway", "Flying High", "Dreamy Detour", "Festival Ride",
    "Golden Getaway", "Breezy Boulevard", "Star Trail", "Whizzing Wheels", "Picnic Trip", "Space Parade",
    "Sky Explorer", "Lucky Lap", "Sunset Trip", "Magic Miles", "Joy Ride", "Wonderful Wander",
  ],
  dino: [
    "Fern Forest", "Volcano Valley", "Dino Picnic", "Sunny Stomp", "Rainbow Valley", "Fossil Adventure",
    "Jurassic Garden", "Egg Hunt", "Dino Parade", "Lost Lagoon", "Little Footprints", "Sunshine Safari",
    "Prehistoric Party", "Starlight Stomp", "Mighty Meadow", "Clover Trail", "Breezy Valley", "Dinosaur Dreams",
    "Wildflower Woods", "Happy Hatchlings", "Ancient Adventure", "Magic Mountain", "Ferny Festival", "Roaring Day",
  ],
  dream: [
    "Starry Wishes", "Rainbow Dreams", "Enchanted Garden", "Moonlit Magic", "Cloud Kingdom", "Fairy Picnic",
    "Sparkle Parade", "Dreamy Meadow", "Magic Morning", "Twinkle Trail", "Sweet Spells", "Wish Upon a Star",
    "Candy Clouds", "Little Wonders", "Whimsical Woods", "Dreamland Party", "Glitter Garden", "Sunbeam Wishes",
    "Secret Garden", "Happily Ever After", "Magical Adventures", "Castle in the Clouds", "Wonderland Walk", "Golden Wishes",
  ],
};

type Stamp = { shapes: Shape[]; detail?: Shape[]; label: string };

/* Small storybook objects make every edition a different drawing, not just a different title. */
const STAMPS: Stamp[] = [
  { label: "Flower", shapes: [c(0, -10, 8), c(10, -2, 8), c(6, 9, 8), c(-6, 9, 8), c(-10, -2, 8)], detail: [c(0, 0, 5)] },
  { label: "Heart", shapes: [p("M0 16 C-22 3 -20 -11 -11 -14 C-5 -16 0 -12 0 -7 C0 -12 5 -16 11 -14 C20 -11 22 3 0 16 Z")] },
  { label: "Little Star", shapes: [poly("0,-19 5,-6 18,-6 8,3 11,16 0,9 -11,16 -8,3 -18,-6 -5,-6")] },
  { label: "Balloon", shapes: [e(0, -3, 13, 18)], detail: [p("M0 15 L-3 20 L3 20 Z M0 20 Q-7 25 0 32")] },
  { label: "Rainbow", shapes: [p("M-20 13 A20 20 0 0 1 20 13 L13 13 A13 13 0 0 0 -13 13 Z")], detail: [p("M-16 13 A16 16 0 0 1 16 13")] },
  { label: "Leaf", shapes: [p("M-17 13 Q-17 -15 17 -17 Q17 16 -17 13 Z")], detail: [p("M-14 10 L12 -12 M-4 2 L-7 -7 M3 -4 L10 -2")] },
  { label: "Mushroom", shapes: [p("M-7 0 L-7 14 Q0 18 7 14 L7 0 Z"), p("M-19 0 Q-17 -18 0 -19 Q17 -18 19 0 Q0 7 -19 0 Z")], detail: [c(-8, -7, 2.5), c(8, -7, 2.5), c(0, -12, 2.5)] },
  { label: "Puffy Cloud", shapes: [p("M-20 5 Q-20 -6 -11 -7 Q-8 -20 3 -17 Q13 -17 15 -7 Q23 -6 22 4 Q21 12 13 12 L-12 12 Q-20 12 -20 5 Z")] },
  { label: "Ringed Planet", shapes: [e(0, 0, 23, 7), c(0, 0, 13)], detail: [p("M-10 -3 Q0 0 10 -3 M-8 5 Q0 8 8 5")] },
  { label: "Present", shapes: [r(-16, -8, 32, 25, 2), r(-19, -13, 38, 7, 2)], detail: [p("M0 -13 L0 17 M0 -13 Q-17 -24 -12 -14 M0 -13 Q17 -24 12 -14")] },
  { label: "Butterfly", shapes: [p("M-2 -1 Q-14 -21 -19 -12 Q-24 -3 -3 3 Q-20 7 -15 16 Q-8 22 -2 7 Z"), p("M2 -1 Q14 -21 19 -12 Q24 -3 3 3 Q20 7 15 16 Q8 22 2 7 Z"), e(0, 3, 3, 10)], detail: [p("M-2 -7 L-8 -14 M2 -7 L8 -14")] },
  { label: "Sparkle", shapes: [poly("0,-21 5,-6 20,0 5,6 0,21 -5,6 -20,0 -5,-6")] },
];

function stamp(index: number, side: "left" | "right", variant: number): Region {
  const art = STAMPS[index % STAMPS.length];
  const x = side === "left" ? 34 : 366;
  const y = side === "left" ? 151 + (variant % 3) * 7 : 151 + ((variant + 1) % 3) * 7;
  const angle = side === "left" ? -8 + (variant % 3) * 5 : 8 - (variant % 3) * 5;
  return {
    id: `edition-${side}`,
    label: `${side === "left" ? "Left" : "Right"} ${art.label}`,
    shapes: art.shapes,
    detail: art.detail,
    transform: `translate(${x} ${y}) rotate(${angle}) scale(0.82)`,
  };
}

function variationOf(region: Region, edition: number): Region {
  const first = region.shapes[0];
  if (region.id === "sun" && first?.k === "circle" && edition % 3 !== 0) {
    const { cx, cy, r: radius } = first;
    if (edition % 3 === 1) {
      return {
        ...region,
        label: "Shining Star",
        shapes: [poly(`${cx},${cy - radius} ${cx + radius * 0.27},${cy - radius * 0.3} ${cx + radius},${cy - radius * 0.3} ${cx + radius * 0.45},${cy + radius * 0.12} ${cx + radius * 0.62},${cy + radius * 0.85} ${cx},${cy + radius * 0.45} ${cx - radius * 0.62},${cy + radius * 0.85} ${cx - radius * 0.45},${cy + radius * 0.12} ${cx - radius},${cy - radius * 0.3} ${cx - radius * 0.27},${cy - radius * 0.3}`)],
      };
    }
    return {
      ...region,
      label: "Sleepy Moon",
      shapes: [p(`M${cx + radius * 0.5} ${cy - radius * 0.85} A${radius} ${radius} 0 1 0 ${cx + radius * 0.5} ${cy + radius * 0.85} Q${cx - radius * 0.35} ${cy + radius * 0.55} ${cx - radius * 0.08} ${cy} Q${cx - radius * 0.35} ${cy - radius * 0.55} ${cx + radius * 0.5} ${cy - radius * 0.85} Z`)],
    };
  }
  if (region.id === "cloud" && first?.k === "ellipse" && edition % 2 === 1) {
    const { cx, cy } = first;
    return {
      ...region,
      shapes: [p(`M${cx - 39} ${cy + 7} Q${cx - 39} ${cy - 7} ${cx - 24} ${cy - 8} Q${cx - 19} ${cy - 23} ${cx - 5} ${cy - 20} Q${cx + 10} ${cy - 24} ${cx + 17} ${cy - 8} Q${cx + 35} ${cy - 10} ${cx + 39} ${cy + 5} Q${cx + 39} ${cy + 16} ${cx + 25} ${cy + 16} L${cx - 25} ${cy + 16} Q${cx - 39} ${cy + 16} ${cx - 39} ${cy + 7} Z`)],
    };
  }
  return region;
}

/** Five original masters × 25 editions = 125 independently playable pages per collection. */
export function expandCollection(collection: Collection, collectionIndex: number): Collection {
  const masters = [...collection.scenes, ...(BONUS_SCENES[collection.id] ?? [])];
  const names = EDITIONS[collection.id];
  if (masters.length !== 5 || !names || names.length !== 24) throw new Error(`Missing editions for ${collection.id}`);
  const variants: Scene[] = [];
  for (let edition = 0; edition < names.length; edition++) {
    for (let masterIndex = 0; masterIndex < masters.length; masterIndex++) {
      const base = masters[masterIndex];
      const localNumber = 6 + variants.length;
      const left = (edition + collectionIndex * 2 + masterIndex) % STAMPS.length;
      const right = (edition * 7 + Math.floor(edition / 12) * 5 + masterIndex * 3 + collectionIndex + 2) % STAMPS.length;
      variants.push({
        id: `${collection.id}-${String(localNumber).padStart(3, "0")}`,
        title: `${base.title} · ${names[edition]}`,
        emoji: base.emoji,
        blurb: `${base.title} goes on a ${names[edition].toLowerCase()} adventure. Add your own colours and patterns!`,
        paper: base.paper,
        mirror: (edition + masterIndex) % 2 === 1,
        regions: [
          ...base.regions.map((region) => variationOf(region, edition)),
          stamp(left, "left", edition),
          stamp(right, "right", edition),
        ],
        decor: base.decor,
      });
    }
  }
  return { ...collection, scenes: [...masters, ...variants] };
}
