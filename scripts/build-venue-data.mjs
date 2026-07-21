import fs from 'node:fs'

const discovered = JSON.parse(fs.readFileSync('/tmp/wolt-kebab-oslo.json', 'utf8'))
const manuallyVerified = JSON.parse(fs.readFileSync('scripts/manual-venues.json', 'utf8'))
const source = [...discovered, ...manuallyVerified].filter((venue, index, all) => all.findIndex((item) => item.id === venue.id) === index)
const checkedAt = '17. juli 2026'
const relevantFood = /kebab|d[öo]ner|shawarma|gyros|falafel/i
fs.mkdirSync('public/menus', { recursive: true })

const tagNames = {
  american: 'Amerikansk', arabic: 'Arabisk', bbq: 'Grill', burgers: 'Burger', chicken: 'Kylling',
  doner: 'Döner', falafel: 'Falafel', greek: 'Gresk', gyros: 'Gyros', halal: 'Halal',
  homemade: 'Hjemmelaget', hummus: 'Hummus', indian: 'Indisk', kebab: 'Kebab',
  mediterranean: 'Middelhavsmat', persian: 'Persisk', pizza: 'Pizza', salad: 'Salat',
  steak: 'Grillkjøtt', street_food: 'Gatemat', turkish: 'Tyrkisk', vegan: 'Vegansk', vegetarian: 'Vegetar',
}

const readMenu = (id) => {
  try {
    const menu = JSON.parse(fs.readFileSync(`/tmp/rull-menu-${id}.json`, 'utf8'))
    return Array.isArray(menu.items) && Array.isArray(menu.categories) ? menu : null
  } catch {
    return null
  }
}

const venues = source.map((venue) => {
  const rawMenu = readMenu(venue.id)
  const categoryNames = new Map((rawMenu?.categories ?? []).map((category) => [category.id, category.name]))
  const rawItems = (rawMenu?.items ?? []).filter((item) => item.enabled !== false && item.type !== 'deposit')
  const menu = (rawMenu?.categories ?? []).map((category) => ({
    title: category.name,
    items: rawItems.filter((item) => item.category === category.id).map((item) => ({
      name: item.name,
      description: item.description || undefined,
      price: Math.round((item.baseprice ?? 0) / 100),
      fromPrice: Boolean(item.options?.length || item.sell_by_weight_config),
      popular: Boolean(item.tags?.some((tag) => tag.id === 'popular')),
      vegetarian: Boolean(item.dietary_preferences?.some((preference) => /vegetarian|vegan/i.test(String(preference)))),
      image: item.image || item.images?.[0]?.url || undefined,
    })),
  })).filter((section) => section.items.length)

  const pricedItems = rawItems.filter((item) => (item.baseprice ?? 0) > 0)
  const relevantItems = pricedItems.filter((item) => relevantFood.test(`${categoryNames.get(item.category) ?? ''} ${item.name}`))
  const pricePool = relevantItems.length ? relevantItems : pricedItems
  const priceFrom = pricePool.length ? Math.min(...pricePool.map((item) => Math.round(item.baseprice / 100))) : 0

  const itemImages = [...relevantItems, ...pricedItems]
    .map((item) => item.image || item.images?.[0]?.url)
    .filter(Boolean)
  const images = [...new Set([venue.image, ...itemImages])].slice(0, 5)
  const menuText = `${(rawMenu?.categories ?? []).map((category) => category.name).join(' ')} ${rawItems.map((item) => item.name).join(' ')}`
  const inferredTags = [
    [/shawarma/i, 'Shawarma'],
    [/d[öo]ner/i, 'Döner'],
    [/gyros/i, 'Gyros'],
    [/falafel/i, 'Falafel'],
    [/kebab/i, 'Kebab'],
    [/tallerken/i, 'Tallerken'],
  ].filter(([pattern]) => pattern.test(menuText)).map(([, label]) => label)
  const tags = [...venue.tags.map((tag) => tagNames[tag] ?? tag), ...inferredTags].filter((tag, index, all) => all.indexOf(tag) === index)
  const woltScore = venue.rating?.score ?? null
  const reviewCount = venue.rating?.volume ?? 0
  const sourceUrl = `https://wolt.com/nb/nor/oslo/restaurant/${venue.slug}`
  const googleQuery = encodeURIComponent(`${venue.name}, ${venue.address}, Oslo`)
  const menuPath = `/menus/${venue.id}.json`
  if (rawMenu) fs.writeFileSync(`public${menuPath}`, JSON.stringify(menu))

  return {
    id: venue.id,
    name: venue.name.trim(),
    shortName: venue.name.split(/[-–—]/)[0].trim(),
    address: venue.address.trim(),
    district: venue.district,
    distanceKm: 0,
    rating: woltScore ? woltScore / 2 : 0,
    woltScore,
    reviewCount,
    priceLevel: priceFrom > 200 ? 3 : priceFrom > 150 ? 2 : 1,
    priceFrom,
    openNow: false,
    closesAt: '',
    tags,
    features: [
      rawMenu ? `${rawItems.length} publiserte menyvarer` : 'Meny ikke tilgjengelig i datakilden',
      ...(venue.tags.includes('halal') ? ['Halal-merket på Wolt'] : []),
      ...(venue.tags.includes('vegetarian') ? ['Vegetarvalg merket på Wolt'] : []),
    ],
    description: venue.shortDescription?.trim() || 'Ingen restaurantbeskrivelse er publisert i datakilden.',
    images,
    imageAlt: images.map((_, index) => index === 0 ? `Restaurantbilde for ${venue.name}, publisert på Wolt` : `Menybilde ${index} for ${venue.name}, publisert på Wolt`),
    menu: [],
    menuPath,
    menuSearch: menuText.toLowerCase(),
    menuItemCount: rawItems.length,
    menuUpdated: checkedAt,
    menuVerified: Boolean(rawMenu),
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${googleQuery}`,
    googleReviewUrl: `https://www.google.com/maps/search/?api=1&query=${googleQuery}`,
    sourceLabel: 'Wolt',
    sourceUrl,
    dataCheckedAt: checkedAt,
  }
})

fs.writeFileSync('app/data/verified-venues.json', JSON.stringify(venues))
console.log(`Wrote ${venues.length} verified venues (${(fs.statSync('app/data/verified-venues.json').size / 1024 / 1024).toFixed(1)} MB)`)
