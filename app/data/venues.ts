import venueData from './verified-venues.json'
import type { Venue } from '../types'

export const districts = [
  'Alle bydeler',
  'Alna',
  'Bjerke',
  'Frogner',
  'Gamle Oslo',
  'Grorud',
  'Grünerløkka',
  'Nordre Aker',
  'Nordstrand',
  'Sagene',
  'St. Hanshaugen',
  'Stovner',
  'Søndre Nordstrand',
  'Ullern',
  'Vestre Aker',
  'Østensjø',
  'Sentrum',
] as const

export const venues = venueData as Venue[]
