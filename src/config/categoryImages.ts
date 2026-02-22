/**
 * Category detail page image configuration.
 *
 * Each category has an array of photos displayed in a masonry-style grid.
 * Row layout defines the visual rhythm: 2-col, 3-col, 2-col, 3-col, ...
 *
 * PRODUCTION: Replace Unsplash URLs with Azure CDN paths via CDN_BASE_URL
 *             in images.ts — e.g. `${CDN_BASE_URL}/landscapes/01.jpg`
 */

const CDN_BASE_URL = "";

const img = (cdnPath: string, unsplashFallback: string): string =>
  CDN_BASE_URL ? `${CDN_BASE_URL}/${cdnPath}` : unsplashFallback;

export interface CategoryPhoto {
  id: string;
  src: string;
  alt: string;
  aspect?: "landscape" | "portrait" | "square";
}

export interface CategoryDetail {
  id: string;
  name: string;
  description: string;
  photos: CategoryPhoto[];
}

export const categoryDetails: Record<string, CategoryDetail> = {
  landscapes: {
    id: "landscapes",
    name: "Landscapes",
    description:
      "Exploring the raw beauty of mountains, valleys, and open skies — chasing light across vast horizons.",
    photos: [
      {
        id: "l1",
        src: img("landscapes/01.jpg", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80&auto=format&fit=crop"),
        alt: "Mountain ridge at sunrise with golden light",
        aspect: "landscape",
      },
      {
        id: "l2",
        src: img("landscapes/02.jpg", "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop"),
        alt: "Alpine meadow with wildflowers and snow-capped peaks",
        aspect: "landscape",
      },
      {
        id: "l3",
        src: img("landscapes/03.jpg", "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80&auto=format&fit=crop"),
        alt: "Lone tree on hilltop against stormy sky",
        aspect: "landscape",
      },
      {
        id: "l4",
        src: img("landscapes/04.jpg", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80&auto=format&fit=crop"),
        alt: "Misty forest valley from above",
        aspect: "landscape",
      },
      {
        id: "l5",
        src: img("landscapes/05.jpg", "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&q=80&auto=format&fit=crop"),
        alt: "Mountain stream with silky water",
        aspect: "portrait",
      },
      {
        id: "l6",
        src: img("landscapes/06.jpg", "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80&auto=format&fit=crop"),
        alt: "Desert sand dunes at golden hour",
        aspect: "landscape",
      },
      {
        id: "l7",
        src: img("landscapes/07.jpg", "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=1200&q=80&auto=format&fit=crop"),
        alt: "Volcanic landscape with geothermal pools",
        aspect: "landscape",
      },
      {
        id: "l8",
        src: img("landscapes/08.jpg", "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=80&auto=format&fit=crop"),
        alt: "Rolling green hills under dramatic clouds",
        aspect: "landscape",
      },
      {
        id: "l9",
        src: img("landscapes/09.jpg", "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=1200&q=80&auto=format&fit=crop"),
        alt: "Frozen waterfall in winter",
        aspect: "portrait",
      },
      {
        id: "l10",
        src: img("landscapes/10.jpg", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop"),
        alt: "Ocean cliff coastline at sunset",
        aspect: "landscape",
      },
      {
        id: "l11",
        src: img("landscapes/11.jpg", "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80&auto=format&fit=crop"),
        alt: "Lake reflecting mountain peaks at dawn",
        aspect: "landscape",
      },
      {
        id: "l12",
        src: img("landscapes/12.jpg", "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1200&q=80&auto=format&fit=crop"),
        alt: "Golden field at sunset with lone path",
        aspect: "landscape",
      },
    ],
  },
  nature: {
    id: "nature",
    name: "Nature",
    description:
      "Intimate moments with flora and fauna — the quiet poetry of the natural world.",
    photos: [
      {
        id: "n1",
        src: img("nature/01.jpg", "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80&auto=format&fit=crop"),
        alt: "Morning dew on wildflower petals",
        aspect: "landscape",
      },
      {
        id: "n2",
        src: img("nature/02.jpg", "https://images.unsplash.com/photo-1518173946687-a4dbf3f4e7e3?w=1200&q=80&auto=format&fit=crop"),
        alt: "Butterfly resting on lavender",
        aspect: "portrait",
      },
      {
        id: "n3",
        src: img("nature/03.jpg", "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200&q=80&auto=format&fit=crop"),
        alt: "Autumn leaves in golden light",
        aspect: "landscape",
      },
      {
        id: "n4",
        src: img("nature/04.jpg", "https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?w=1200&q=80&auto=format&fit=crop"),
        alt: "Hummingbird at flower",
        aspect: "portrait",
      },
      {
        id: "n5",
        src: img("nature/05.jpg", "https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=1200&q=80&auto=format&fit=crop"),
        alt: "Moss-covered forest floor",
        aspect: "landscape",
      },
      {
        id: "n6",
        src: img("nature/06.jpg", "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80&auto=format&fit=crop"),
        alt: "Aerial view of winding river through forest",
        aspect: "landscape",
      },
      {
        id: "n7",
        src: img("nature/07.jpg", "https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?w=1200&q=80&auto=format&fit=crop"),
        alt: "Cherry blossoms against blue sky",
        aspect: "portrait",
      },
      {
        id: "n8",
        src: img("nature/08.jpg", "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=1200&q=80&auto=format&fit=crop"),
        alt: "Sunlight filtering through canopy",
        aspect: "landscape",
      },
    ],
  },
  street: {
    id: "street",
    name: "Street",
    description:
      "Candid stories from sidewalks and alleyways — the choreography of everyday life.",
    photos: [
      {
        id: "s1",
        src: img("street/01.jpg", "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=1200&q=80&auto=format&fit=crop"),
        alt: "Rain-soaked city street at night",
        aspect: "landscape",
      },
      {
        id: "s2",
        src: img("street/02.jpg", "https://images.unsplash.com/photo-1476973422084-e0fa66ff9456?w=1200&q=80&auto=format&fit=crop"),
        alt: "Silhouette walking through alley light",
        aspect: "portrait",
      },
      {
        id: "s3",
        src: img("street/03.jpg", "https://images.unsplash.com/photo-1517732306149-e8f829eb588a?w=1200&q=80&auto=format&fit=crop"),
        alt: "Neon reflections on wet pavement",
        aspect: "landscape",
      },
      {
        id: "s4",
        src: img("street/04.jpg", "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80&auto=format&fit=crop"),
        alt: "Umbrella crowd at crosswalk",
        aspect: "landscape",
      },
      {
        id: "s5",
        src: img("street/05.jpg", "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=80&auto=format&fit=crop"),
        alt: "Man reading newspaper at café",
        aspect: "portrait",
      },
      {
        id: "s6",
        src: img("street/06.jpg", "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&q=80&auto=format&fit=crop"),
        alt: "City skyline through chain-link fence",
        aspect: "landscape",
      },
      {
        id: "s7",
        src: img("street/07.jpg", "https://images.unsplash.com/photo-1520466809213-7b9a56adcd45?w=1200&q=80&auto=format&fit=crop"),
        alt: "Street musician performing at dusk",
        aspect: "landscape",
      },
      {
        id: "s8",
        src: img("street/08.jpg", "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1200&q=80&auto=format&fit=crop"),
        alt: "Long exposure traffic trails at night",
        aspect: "landscape",
      },
      {
        id: "s9",
        src: img("street/09.jpg", "https://images.unsplash.com/photo-1532364158125-02d75a0f7fb5?w=1200&q=80&auto=format&fit=crop"),
        alt: "Morning light through subway stairs",
        aspect: "portrait",
      },
      {
        id: "s10",
        src: img("street/10.jpg", "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80&auto=format&fit=crop"),
        alt: "Bicycle parked against graffiti wall",
        aspect: "landscape",
      },
      {
        id: "s11",
        src: img("street/11.jpg", "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1200&q=80&auto=format&fit=crop"),
        alt: "Steam rising from street grate at dawn",
        aspect: "landscape",
      },
      {
        id: "s12",
        src: img("street/12.jpg", "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=1200&q=80&auto=format&fit=crop"),
        alt: "Shadow patterns on cobblestone street",
        aspect: "landscape",
      },
      {
        id: "s13",
        src: img("street/13.jpg", "https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=1200&q=80&auto=format&fit=crop"),
        alt: "Vendor stall under string lights",
        aspect: "portrait",
      },
      {
        id: "s14",
        src: img("street/14.jpg", "https://images.unsplash.com/photo-1502899576159-f224dc2349fa?w=1200&q=80&auto=format&fit=crop"),
        alt: "Foggy bridge at first light",
        aspect: "landscape",
      },
      {
        id: "s15",
        src: img("street/15.jpg", "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&q=80&auto=format&fit=crop"),
        alt: "Aerial view of pedestrian crossing",
        aspect: "landscape",
      },
    ],
  },
  architecture: {
    id: "architecture",
    name: "Architecture",
    description:
      "Forms, lines, and light — the silent dialogue between structure and space.",
    photos: [
      {
        id: "a1",
        src: img("architecture/01.jpg", "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80&auto=format&fit=crop"),
        alt: "Geometric glass facade reflecting sky",
        aspect: "landscape",
      },
      {
        id: "a2",
        src: img("architecture/02.jpg", "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1200&q=80&auto=format&fit=crop"),
        alt: "Spiral staircase from above",
        aspect: "portrait",
      },
      {
        id: "a3",
        src: img("architecture/03.jpg", "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=1200&q=80&auto=format&fit=crop"),
        alt: "Brutalist concrete building at dusk",
        aspect: "landscape",
      },
      {
        id: "a4",
        src: img("architecture/04.jpg", "https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&q=80&auto=format&fit=crop"),
        alt: "Modern museum interior curves",
        aspect: "landscape",
      },
      {
        id: "a5",
        src: img("architecture/05.jpg", "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80&auto=format&fit=crop"),
        alt: "Gothic cathedral vaulted ceiling",
        aspect: "portrait",
      },
      {
        id: "a6",
        src: img("architecture/06.jpg", "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1200&q=80&auto=format&fit=crop"),
        alt: "Steel and glass skyscraper looking up",
        aspect: "portrait",
      },
      {
        id: "a7",
        src: img("architecture/07.jpg", "https://images.unsplash.com/photo-1470723710355-95304d8aece4?w=1200&q=80&auto=format&fit=crop"),
        alt: "Bridge suspension cables in fog",
        aspect: "landscape",
      },
      {
        id: "a8",
        src: img("architecture/08.jpg", "https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=1200&q=80&auto=format&fit=crop"),
        alt: "Repeating window pattern on office tower",
        aspect: "landscape",
      },
      {
        id: "a9",
        src: img("architecture/09.jpg", "https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=1200&q=80&auto=format&fit=crop"),
        alt: "Old building stairwell with light shaft",
        aspect: "portrait",
      },
      {
        id: "a10",
        src: img("architecture/10.jpg", "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80&auto=format&fit=crop"),
        alt: "Minimalist house against mountain backdrop",
        aspect: "landscape",
      },
    ],
  },
  travel: {
    id: "travel",
    name: "Travel",
    description:
      "Visual postcards from wandering — the feeling of being somewhere new for the first time.",
    photos: [
      {
        id: "t1",
        src: img("travel/01.jpg", "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=80&auto=format&fit=crop"),
        alt: "Santorini blue domes at sunset",
        aspect: "landscape",
      },
      {
        id: "t2",
        src: img("travel/02.jpg", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80&auto=format&fit=crop"),
        alt: "Traditional Japanese torii gate",
        aspect: "portrait",
      },
      {
        id: "t3",
        src: img("travel/03.jpg", "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&q=80&auto=format&fit=crop"),
        alt: "Moroccan market spice stalls",
        aspect: "landscape",
      },
      {
        id: "t4",
        src: img("travel/04.jpg", "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80&auto=format&fit=crop"),
        alt: "Boat on turquoise tropical water",
        aspect: "landscape",
      },
      {
        id: "t5",
        src: img("travel/05.jpg", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80&auto=format&fit=crop"),
        alt: "Paris Eiffel Tower at blue hour",
        aspect: "portrait",
      },
      {
        id: "t6",
        src: img("travel/06.jpg", "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1200&q=80&auto=format&fit=crop"),
        alt: "Colorful Havana street with vintage cars",
        aspect: "landscape",
      },
      {
        id: "t7",
        src: img("travel/07.jpg", "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80&auto=format&fit=crop"),
        alt: "Mountain road winding through autumn forest",
        aspect: "landscape",
      },
      {
        id: "t8",
        src: img("travel/08.jpg", "https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?w=1200&q=80&auto=format&fit=crop"),
        alt: "Floating market in Southeast Asia",
        aspect: "landscape",
      },
      {
        id: "t9",
        src: img("travel/09.jpg", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80&auto=format&fit=crop"),
        alt: "Overwater bungalows in Maldives",
        aspect: "landscape",
      },
      {
        id: "t10",
        src: img("travel/10.jpg", "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80&auto=format&fit=crop"),
        alt: "Campervan on open road at sunset",
        aspect: "landscape",
      },
      {
        id: "t11",
        src: img("travel/11.jpg", "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=80&auto=format&fit=crop"),
        alt: "Italian coastal village clinging to cliff",
        aspect: "portrait",
      },
      {
        id: "t12",
        src: img("travel/12.jpg", "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=1200&q=80&auto=format&fit=crop"),
        alt: "Northern lights over snowy cabin",
        aspect: "landscape",
      },
      {
        id: "t13",
        src: img("travel/13.jpg", "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80&auto=format&fit=crop"),
        alt: "Tropical beach with palm trees at golden hour",
        aspect: "landscape",
      },
      {
        id: "t14",
        src: img("travel/14.jpg", "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=1200&q=80&auto=format&fit=crop"),
        alt: "Ancient temple ruins at sunrise",
        aspect: "landscape",
      },
      {
        id: "t15",
        src: img("travel/15.jpg", "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=80&auto=format&fit=crop"),
        alt: "Venice canal with gondola",
        aspect: "portrait",
      },
      {
        id: "t16",
        src: img("travel/16.jpg", "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=80&auto=format&fit=crop"),
        alt: "Dramatic sunset over ocean horizon",
        aspect: "landscape",
      },
      {
        id: "t17",
        src: img("travel/17.jpg", "https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=1200&q=80&auto=format&fit=crop"),
        alt: "Cherry blossom lined canal in Kyoto",
        aspect: "landscape",
      },
      {
        id: "t18",
        src: img("travel/18.jpg", "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=1200&q=80&auto=format&fit=crop"),
        alt: "Hot air balloons over Cappadocia",
        aspect: "landscape",
      },
      {
        id: "t19",
        src: img("travel/19.jpg", "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=80&auto=format&fit=crop"),
        alt: "Bamboo forest path in Japan",
        aspect: "portrait",
      },
      {
        id: "t20",
        src: img("travel/20.jpg", "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80&auto=format&fit=crop"),
        alt: "Dubai skyline through desert haze",
        aspect: "landscape",
      },
    ],
  },
};
