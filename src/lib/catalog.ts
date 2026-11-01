import knitOat from "@/assets/p-knit-oatmeal.jpg";
import knitForest from "@/assets/p-knit-forest.jpg";
import pufferPine from "@/assets/p-puffer-pine.jpg";
import pufferCocoa from "@/assets/p-puffer-cocoa.jpg";
import coat from "@/assets/p-coat-cocoa.jpg";
import scarf from "@/assets/p-scarf-ivory.jpg";
import trousers from "@/assets/p-trousers-stone.jpg";
import beanieB from "@/assets/p-beanie-burgundy.jpg";
import beanieO from "@/assets/p-beanie-oatmeal.jpg";
import lookMorning from "@/assets/look-morning.jpg";
import lookSnow from "@/assets/look-snow.jpg";
import lookEvening from "@/assets/look-evening.jpg";

export type Variant = { name: string; swatch: string; image: string };
export type Product = {
  id: string;
  name: string;
  material: string;
  details: string[];
  styling: string;
  variants: Variant[];
};

// Only colours with real imagery are listed.
export const products: Product[] = [
  {
    id: "knit",
    name: "Fireside Cable Knit",
    material: "Chunky wool-blend cable knit",
    details: ["Hand-feel: brushed and lofty", "Relaxed, dropped shoulder", "Ribbed collar and cuffs"],
    styling: "Tuck loosely into the Cabin Lounge Trousers and add the Snowfall Scarf for a soft, tonal look.",
    variants: [
      { name: "Oatmeal", swatch: "var(--oatmeal)", image: knitOat },
      { name: "Forest", swatch: "var(--forest)", image: knitForest },
    ],
  },
  {
    id: "puffer",
    name: "Alpine Puffer",
    material: "Matte quilted shell, lofty fill",
    details: ["High stand collar", "Two-way zip", "Hip length"],
    styling: "Layer over the Fireside Cable Knit with the Hearth Beanie for a bright snow day.",
    variants: [
      { name: "Pine", swatch: "var(--forest)", image: pufferPine },
      { name: "Cocoa", swatch: "var(--cocoa)", image: pufferCocoa },
    ],
  },
  {
    id: "coat",
    name: "Sunday Wool Coat",
    material: "Dense brushed wool, long line",
    details: ["Notched lapel", "Concealed front", "Below-knee length"],
    styling: "Wear it open over knitwear so the texture shows through.",
    variants: [{ name: "Cocoa", swatch: "var(--cocoa)", image: coat }],
  },
  {
    id: "scarf",
    name: "Snowfall Scarf",
    material: "Featherlight brushed wool",
    details: ["Oversized length", "Hand-twisted fringe", "Generous width"],
    styling: "Loop once and let both ends fall long over a dark coat.",
    variants: [{ name: "Ivory", swatch: "var(--ivory)", image: scarf }],
  },
  {
    id: "trousers",
    name: "Cabin Lounge Trousers",
    material: "Soft knitted jersey, wide leg",
    details: ["Drawstring waist", "Side pockets", "Full-length relaxed leg"],
    styling: "Pair with wool socks and the cable knit for slow mornings indoors.",
    variants: [{ name: "Stone", swatch: "var(--stone)", image: trousers }],
  },
  {
    id: "beanie",
    name: "Hearth Beanie",
    material: "Fine rib wool knit",
    details: ["Deep folded cuff", "Close, easy fit", "Soft crown"],
    styling: "A spot of colour against the Pine puffer and ivory scarf.",
    variants: [
      { name: "Burgundy", swatch: "var(--burgundy)", image: beanieB },
      { name: "Oatmeal", swatch: "var(--oatmeal)", image: beanieO },
    ],
  },
];

export const looks = [
  { id: "morning", name: "Cabin morning", note: "Sunlight, a warm mug, nowhere to be.", image: lookMorning, pieces: ["Fireside Cable Knit · Oatmeal", "Cabin Lounge Trousers · Stone", "Wool socks"] },
  { id: "snow", name: "Snow day", note: "Crisp air and fresh tracks.", image: lookSnow, pieces: ["Alpine Puffer · Pine", "Hearth Beanie · Burgundy", "Snowfall Scarf · Ivory", "Cabin Lounge Trousers · Stone"] },
  { id: "evening", name: "Fireside evening", note: "Low light and long conversations.", image: lookEvening, pieces: ["Sunday Wool Coat · Cocoa", "Fireside Cable Knit · Oatmeal", "Knit wide trousers · Burgundy"] },
] as const;
