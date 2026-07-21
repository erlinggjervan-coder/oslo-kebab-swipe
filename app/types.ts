export type MenuItem = {
  name: string
  description?: string
  price: number
  fromPrice?: boolean
  popular?: boolean
  vegetarian?: boolean
  image?: string
}

export type MenuSection = {
  title: string
  items: MenuItem[]
}

export type Venue = {
  id: string
  name: string
  shortName: string
  address: string
  district: string
  distanceKm: number
  rating: number
  woltScore: number | null
  reviewCount: number
  priceLevel: 1 | 2 | 3
  priceFrom: number
  openNow: boolean
  closesAt: string
  tags: string[]
  features: string[]
  description: string
  images: string[]
  imageAlt: string[]
  menu: MenuSection[]
  menuPath: string
  menuSearch: string
  menuItemCount: number
  menuUpdated: string
  menuVerified: boolean
  googleMapsUrl: string
  googleReviewUrl: string
  phone?: string
  placeId?: string
  sourceLabel: string
  sourceUrl: string
  dataCheckedAt: string
}

export type SwipeDecision = 'liked' | 'passed'

export type Review = {
  venueId: string
  meat: number
  sauce: number
  bread: number
  portion: number
  value: number
  note: string
  visitedAt: string
}

export type Filters = {
  district: string
  openNow: boolean
  maxPrice: number
  type: string
  minRating: number
  verifiedMenu: boolean
}

export type View = 'home' | 'discover' | 'saved' | 'profile'
