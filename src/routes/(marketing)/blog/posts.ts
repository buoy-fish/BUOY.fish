export const blogInfo = {
  name: "BUOY.fish Blog",
  description: "News and updates from BUOY.fish",
}

export type BlogPost = {
  link: string
  date: string // date is a string 'YYYY-MM-DD'
  title: string
  description: string
  parsedDate?: Date // Optional because it's added dynamically
}

// Update this list with the actual blog post list
// Create a page in the "(posts)" directory for each entry
const blogPosts: BlogPost[] = [
  {
    title: "Introducing BUOY.fish — Solving Ghost Gear with GPS Tracking",
    description:
      "How we're using ruggedized GPS trackers and low-power networks to help fishermen find their gear and protect our oceans.",
    link: "/blog/introducing_buoy_fish",
    date: "2026-03-18",
  },
  {
    title:
      "Costa Rica — Bringing Connected Gear Tracking to the Gulf of Nicoya",
    description:
      "BUOY.fish plans its first Central American deployment, targeting 90% LoRaWAN coverage of the Gulf of Nicoya for artisanal fisheries.",
    link: "/blog/costa-rica-gulf-of-nicoya",
    date: "2026-02-20",
  },
  {
    title: "Punta Eugenia & Isla Natividad — Expanding in Baja California",
    description:
      "Our next deployment brings upgraded smart buoys to two more Baja fishing cooperatives, building on 160,000+ payloads from Punta Abreojos.",
    link: "/blog/punta-eugenia-isla-natividad",
    date: "2026-01-15",
  },
  {
    title: "Nova Scotia — Protecting the North Atlantic Right Whale",
    description:
      "60 smart buoys deploying in LFA35 with Go Deep International, GGGI, and DFO to tackle ghost gear in one of the world's most critical whale habitats.",
    link: "/blog/nova-scotia-trial",
    date: "2025-09-10",
  },
  {
    title: "First At-Scale Trial — 80 Smart Buoys in Punta Abreojos, Mexico",
    description:
      "Together with GGGI, Pro Natura, and Fedecoop, we deployed 80 connected buoys — recording 160,000+ payloads and proving the technology at commercial scale.",
    link: "/blog/punta-abreojos-deployment",
    date: "2025-03-08",
  },
  {
    title: "BUOY.fish Launches Publicly",
    description:
      "Founded by commercial fishermen, BUOY.fish makes its first sale to Bay Area Dungeness crab fishermen and gains California DFW approval.",
    link: "/blog/buoy-fish-launches-publicly",
    date: "2023-09-20",
  },
]

// Parse post dates from strings to Date objects
for (const post of blogPosts) {
  if (!post.parsedDate) {
    const dateParts = post.date.split("-")
    post.parsedDate = new Date(
      parseInt(dateParts[0]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[2]),
    ) // Note: months are 0-based
  }
}

export const sortedBlogPosts = blogPosts.sort(
  (a: BlogPost, b: BlogPost) =>
    (b.parsedDate?.getTime() ?? 0) - (a.parsedDate?.getTime() ?? 0),
)
