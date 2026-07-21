'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  Home,
  Info,
  ListFilter,
  LocateFixed,
  MapPin,
  MessageSquareText,
  Navigation,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  UserRound,
  Utensils,
  X,
  Zap,
} from 'lucide-react'
import { districts, venues } from './data/venues'
import type { Filters, MenuSection, Review, SwipeDecision, Venue, View } from './types'

type MissingPlaceReport = {
  id: string
  name: string
  address: string
  link: string
  note: string
  createdAt: string
}

const defaultFilters: Filters = {
  district: 'Alle bydeler',
  openNow: false,
  maxPrice: 400,
  type: 'Alt',
  minRating: 0,
  verifiedMenu: false,
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [view, setView] = useState<View>('home')
  const [decisions, setDecisions] = useState<Record<string, SwipeDecision>>(() =>
    readStorage('rull-decisions', {}),
  )
  const [favorites, setFavorites] = useState<string[]>(() => readStorage('rull-favorites', []))
  const [reviews, setReviews] = useState<Record<string, Review>>(() => readStorage('rull-reviews', {}))
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [menuVenue, setMenuVenue] = useState<Venue | null>(null)
  const [detailVenue, setDetailVenue] = useState<Venue | null>(null)
  const [reviewVenue, setReviewVenue] = useState<Venue | null>(null)
  const [showFinale, setShowFinale] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reports, setReports] = useState<MissingPlaceReport[]>(() => readStorage('rull-reports', []))
  const [lastDecision, setLastDecision] = useState<{ id: string; decision: SwipeDecision } | null>(null)

  useEffect(() => window.localStorage.setItem('rull-decisions', JSON.stringify(decisions)), [decisions])
  useEffect(() => window.localStorage.setItem('rull-favorites', JSON.stringify(favorites)), [favorites])
  useEffect(() => window.localStorage.setItem('rull-reviews', JSON.stringify(reviews)), [reviews])
  useEffect(() => window.localStorage.setItem('rull-reports', JSON.stringify(reports)), [reports])

  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (key === 'district') return value !== defaultFilters.district
    if (key === 'maxPrice') return value !== defaultFilters.maxPrice
    if (key === 'type') return value !== defaultFilters.type
    return value !== defaultFilters[key as keyof Filters]
  }).length

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      if (decisions[venue.id]) return false
      if (filters.district !== 'Alle bydeler' && venue.district !== filters.district) return false
      if (venue.priceFrom > 0 && venue.priceFrom > filters.maxPrice) return false
      if (filters.type !== 'Alt' && !`${venue.tags.join(' ')} ${venue.menuSearch}`.toLowerCase().includes(filters.type.toLowerCase())) return false
      if ((venue.woltScore ?? 0) < filters.minRating) return false
      if (filters.verifiedMenu && !venue.menuVerified) return false
      return true
    })
  }, [decisions, filters])

  const likedVenues = venues.filter((venue) => decisions[venue.id] === 'liked')

  const decide = (venue: Venue, decision: SwipeDecision) => {
    setLastDecision({ id: venue.id, decision })
    setDecisions((current) => ({ ...current, [venue.id]: decision }))
  }

  const undo = () => {
    if (!lastDecision) return
    setDecisions((current) => {
      const next = { ...current }
      delete next[lastDecision.id]
      return next
    })
    setLastDecision(null)
  }

  const toggleFavorite = (venueId: string) => {
    setFavorites((current) =>
      current.includes(venueId) ? current.filter((id) => id !== venueId) : [...current, venueId],
    )
  }

  const saveReview = (review: Review) => {
    setReviews((current) => ({ ...current, [review.venueId]: review }))
    setReviewVenue(null)
  }

  const resetDeck = () => {
    setDecisions({})
    setLastDecision(null)
  }

  const navigate = (next: View) => {
    setView(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={`app app--${view}`}>
      <TopBar view={view} onNavigate={navigate} onOpenFilters={() => setShowFilters(true)} activeFilters={activeFilters} />

      <main>
        <AnimatePresence mode="wait">
          {view === 'home' && <Landing key="home" onStart={() => navigate('discover')} />}
          {view === 'discover' && (
            <Discover
              key="discover"
              deck={filteredVenues}
              totalRemaining={venues.filter((venue) => !decisions[venue.id]).length}
              likedCount={likedVenues.length}
              lastDecision={lastDecision}
              filters={filters}
              onDecide={decide}
              onUndo={undo}
              onMenu={setMenuVenue}
              onDetails={setDetailVenue}
              onFilters={() => setShowFilters(true)}
              onFinale={() => setShowFinale(true)}
              onReset={resetDeck}
            />
          )}
          {view === 'saved' && (
            <Saved
              key="saved"
              venues={likedVenues}
              favorites={favorites}
              reviews={reviews}
              onFavorite={toggleFavorite}
              onReview={setReviewVenue}
              onDetails={setDetailVenue}
              onDiscover={() => navigate('discover')}
              onFinale={() => setShowFinale(true)}
            />
          )}
          {view === 'profile' && (
            <Profile
              key="profile"
              decisions={decisions}
              reviews={reviews}
              favorites={favorites}
              onReset={resetDeck}
              onReport={() => setShowReport(true)}
            />
          )}
        </AnimatePresence>
      </main>

      {view !== 'home' && <BottomNav view={view} onNavigate={navigate} likedCount={likedVenues.length} />}

      <AnimatePresence>
        {showFilters && (
          <FilterSheet filters={filters} onChange={setFilters} onClose={() => setShowFilters(false)} />
        )}
        {menuVenue && <MenuSheet venue={menuVenue} onClose={() => setMenuVenue(null)} />}
        {detailVenue && (
          <VenueDetails
            venue={detailVenue}
            liked={decisions[detailVenue.id] === 'liked'}
            favorite={favorites.includes(detailVenue.id)}
            review={reviews[detailVenue.id]}
            onClose={() => setDetailVenue(null)}
            onLike={() => decide(detailVenue, 'liked')}
            onFavorite={() => toggleFavorite(detailVenue.id)}
            onMenu={() => {
              setDetailVenue(null)
              setMenuVenue(detailVenue)
            }}
            onReview={() => {
              setDetailVenue(null)
              setReviewVenue(detailVenue)
            }}
          />
        )}
        {reviewVenue && (
          <ReviewSheet
            venue={reviewVenue}
            initial={reviews[reviewVenue.id]}
            onSave={saveReview}
            onClose={() => setReviewVenue(null)}
          />
        )}
        {showFinale && (
          <Finale venues={likedVenues} onClose={() => setShowFinale(false)} onDiscover={() => {
            setShowFinale(false)
            navigate('discover')
          }} />
        )}
        {showReport && (
          <ReportSheet
            onClose={() => setShowReport(false)}
            onSubmit={(report) => setReports((current) => [...current, report])}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <button className={`logo ${compact ? 'logo--compact' : ''}`} aria-label="RULL forside">
      <span className="logo__mark">R</span>
      <span className="logo__word">RULL</span>
      {!compact && <span className="logo__dot" />}
    </button>
  )
}

function TopBar({
  view,
  onNavigate,
  onOpenFilters,
  activeFilters,
}: {
  view: View
  onNavigate: (view: View) => void
  onOpenFilters: () => void
  activeFilters: number
}) {
  return (
    <header className={`topbar ${view === 'home' ? 'topbar--home' : ''}`}>
      <div className="topbar__inner">
        <div onClick={() => onNavigate('home')}><Logo compact={view !== 'home'} /></div>
        <nav className="desktop-nav" aria-label="Hovedmeny">
          <button className={view === 'discover' ? 'is-active' : ''} onClick={() => onNavigate('discover')}>Sveip</button>
          <button className={view === 'saved' ? 'is-active' : ''} onClick={() => onNavigate('saved')}>Mine ruller</button>
          <button className={view === 'profile' ? 'is-active' : ''} onClick={() => onNavigate('profile')}>Min smak</button>
        </nav>
        <div className="topbar__actions">
          {view === 'discover' && (
            <button className="icon-button filter-button" onClick={onOpenFilters} aria-label="Åpne filtre">
              <SlidersHorizontal size={19} />
              {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}
            </button>
          )}
          <span className="preview-pill"><span /> Kildekontrollert</span>
        </div>
      </div>
    </header>
  )
}

function Landing({ onStart }: { onStart: () => void }) {
  const featured = venues.find((venue) => venue.name === 'Tåsen Cafebar') ?? venues[0]
  return (
    <motion.div className="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="landing__glow landing__glow--one" />
      <div className="landing__glow landing__glow--two" />
      <section className="hero shell">
        <div className="hero__copy">
          <div className="eyebrow"><span /> Oslos kebabguide</div>
          <h1>Oslo har mange kebaber.<br /><em>Du trenger bare én.</em></h1>
          <p className="hero__lead">Sveip deg gjennom byen, lagre fristelsene og la RULL velge kveldens kebab.</p>
          <div className="hero__buttons">
            <button className="primary-cta" onClick={onStart}>
              Start å sveipe <ArrowRight size={20} />
            </button>
            <button className="text-cta" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>
              Se hvordan <ChevronDown size={18} />
            </button>
          </div>
          <div className="hero__proof">
            <div><strong>{venues.length}</strong><span>kildekontrollerte steder</span></div>
            <div><strong>15+1</strong><span>bydeler og Sentrum</span></div>
            <div><strong>100%</strong><span>ekte menyer og bilder</span></div>
          </div>
        </div>

        <div className="hero__visual" aria-label="Forhåndsvisning av swipekort">
          <motion.div className="floating-chip floating-chip--rating" animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <Star size={16} fill="currentColor" /> {featured.woltScore?.toFixed(1).replace('.', ',')} <span>Wolt</span>
          </motion.div>
          <motion.div className="floating-chip floating-chip--open" animate={{ y: [0, 7, 0] }} transition={{ duration: 4.8, repeat: Infinity }}>
            <span className="status-dot" /> Kontrollert 17. juli
          </motion.div>
          <motion.div className="hero-card" initial={{ rotate: 4, y: 30 }} animate={{ rotate: 2, y: 0 }} transition={{ type: 'spring', stiffness: 100 }}>
            <img src={featured.images[0]} alt={featured.imageAlt[0]} />
            <div className="hero-card__shade" />
            <div className="hero-card__progress"><span /><span /><span /></div>
            <div className="hero-card__label">
              <span className="micro-label">Kildekontrollert i {featured.district}</span>
              <h2>{featured.name}</h2>
              <p><MapPin size={15} /> {featured.address} {featured.priceFrom > 0 && <><span>•</span> fra {featured.priceFrom} kr</>}</p>
              <div className="tag-row">{featured.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
          </motion.div>
          <motion.div className="hero-swipe hero-swipe--no" animate={{ rotate: [-9, -6, -9] }} transition={{ duration: 3, repeat: Infinity }}>NESTE</motion.div>
          <motion.div className="hero-swipe hero-swipe--yes" animate={{ rotate: [8, 5, 8] }} transition={{ duration: 3.2, repeat: Infinity }}>RULL!</motion.div>
        </div>
      </section>

      <section className="how shell" id="how">
        <div className="section-heading">
          <span className="eyebrow"><span /> Så enkelt er det</span>
          <h2>Fra sulten til bestemt<br />på under ett minutt.</h2>
        </div>
        <div className="steps-grid">
          <article><span className="step-number">01</span><div className="step-icon"><ListFilter /></div><h3>Velg humør</h3><p>Sett bydel, budsjett og hva du har lyst på akkurat nå.</p></article>
          <article><span className="step-number">02</span><div className="step-icon"><Flame /></div><h3>Sveip løs</h3><p>Se maten, åpne menyen og lagre stedene som frister.</p></article>
          <article><span className="step-number">03</span><div className="step-icon"><Sparkles /></div><h3>La RULL velge</h3><p>Finalerunden finner den beste kandidaten for kvelden.</p></article>
        </div>
      </section>

      <section className="landing-cta shell">
        <div className="landing-cta__wrap">
          <div><span className="eyebrow eyebrow--dark"><span /> Klar?</span><h2>Ikke tenk.<br />Bare RULL.</h2></div>
          <button className="dark-cta" onClick={onStart}>Finn kveldens kebab <ArrowRight /></button>
        </div>
      </section>

      <footer className="footer shell">
        <Logo compact />
        <p>Laget for kebabbyen Oslo.</p>
        <span>Restaurantdata: Wolt · Bydelsgrenser: © OpenStreetMap-bidragsytere · kontrollert 17. juli 2026</span>
      </footer>
    </motion.div>
  )
}

function Discover({
  deck,
  totalRemaining,
  likedCount,
  lastDecision,
  filters,
  onDecide,
  onUndo,
  onMenu,
  onDetails,
  onFilters,
  onFinale,
  onReset,
}: {
  deck: Venue[]
  totalRemaining: number
  likedCount: number
  lastDecision: { id: string; decision: SwipeDecision } | null
  filters: Filters
  onDecide: (venue: Venue, decision: SwipeDecision) => void
  onUndo: () => void
  onMenu: (venue: Venue) => void
  onDetails: (venue: Venue) => void
  onFilters: () => void
  onFinale: () => void
  onReset: () => void
}) {
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const current = deck[0]
  const next = deck[1]

  const decideWithDirection = (venue: Venue, decision: SwipeDecision) => {
    setDirection(decision === 'liked' ? 'right' : 'left')
    onDecide(venue, decision)
  }

  return (
    <motion.section className="discover" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="discover__heading shell-narrow">
        <div>
          <span className="discover__kicker"><span className="status-dot" /> {totalRemaining} usette i Oslo</span>
          <h1>Hva frister?</h1>
        </div>
        <button className="mobile-filter" onClick={onFilters}><SlidersHorizontal size={19} /> Filtre</button>
      </div>

      <div className="filter-summary shell-narrow">
        <button onClick={onFilters}><LocateFixed size={15} /> {filters.district}</button>
        <button onClick={onFilters}>Under {filters.maxPrice} kr</button>
      </div>

      <div className="deck-area">
        {current ? (
          <div className="card-stack">
            {next && <div className="swipe-card swipe-card--behind"><img src={next.images[0]} alt="" /></div>}
            <AnimatePresence mode="popLayout" custom={direction}>
              <SwipeCard
                key={current.id}
                venue={current}
                onDecision={(decision) => decideWithDirection(current, decision)}
                onMenu={() => onMenu(current)}
                onDetails={() => onDetails(current)}
              />
            </AnimatePresence>
          </div>
        ) : (
          <EmptyDeck totalRemaining={totalRemaining} onFilters={onFilters} onReset={onReset} />
        )}
      </div>

      {current && (
        <div className="swipe-actions" aria-label="Sveipehandlinger">
          <button className="swipe-action swipe-action--undo" onClick={onUndo} disabled={!lastDecision} aria-label="Angre"><RotateCcw /></button>
          <button className="swipe-action swipe-action--pass" onClick={() => decideWithDirection(current, 'passed')} aria-label="Neste"><X /></button>
          <button className="swipe-action swipe-action--menu" onClick={() => onMenu(current)} aria-label="Se meny"><BookOpen /></button>
          <button className="swipe-action swipe-action--like" onClick={() => decideWithDirection(current, 'liked')} aria-label="Lagre"><Heart fill="currentColor" /></button>
        </div>
      )}

      <p className="gesture-hint"><ArrowLeft size={14} /> Dra kortet for å sveipe <ArrowRight size={14} /></p>

      {likedCount >= 3 && (
        <button className="finale-fab" onClick={onFinale}><Sparkles size={18} /> Finalerunden <span>{likedCount}</span></button>
      )}
    </motion.section>
  )
}

function SwipeCard({
  venue,
  onDecision,
  onMenu,
  onDetails,
}: {
  venue: Venue
  onDecision: (decision: SwipeDecision) => void
  onMenu: () => void
  onDetails: () => void
}) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const [imageFailed, setImageFailed] = useState(false)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-260, 260], [-13, 13])
  const yesOpacity = useTransform(x, [30, 130], [0, 1])
  const noOpacity = useTransform(x, [-130, -30], [1, 0])

  const changePhoto = (direction: -1 | 1) => {
    setImageFailed(false)
    setPhotoIndex((current) => Math.min(Math.max(current + direction, 0), venue.images.length - 1))
  }

  return (
    <motion.article
      className="swipe-card"
      style={{ x, rotate }}
      variants={{
        exit: (exitDirection: 'left' | 'right') => ({
          x: exitDirection === 'left' ? -520 : 520,
          opacity: 0,
          rotate: exitDirection === 'left' ? -18 : 18,
          transition: { duration: 0.25 },
        }),
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.72}
      whileTap={{ cursor: 'grabbing' }}
      initial={{ scale: 0.96, opacity: 0, y: 15 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit="exit"
      onDragEnd={(_, info) => {
        if (info.offset.x > 105 || info.velocity.x > 650) onDecision('liked')
        else if (info.offset.x < -105 || info.velocity.x < -650) onDecision('passed')
      }}
    >
      <div className={`swipe-card__media ${imageFailed ? 'is-fallback' : ''}`}>
        {!imageFailed && <img src={venue.images[photoIndex]} alt={venue.imageAlt[photoIndex]} onError={() => setImageFailed(true)} draggable={false} />}
        {imageFailed && <div className="image-fallback"><Flame /><span>Bilde kommer</span></div>}
        <div className="swipe-card__gradient" />
        <div className="photo-progress">
          {venue.images.map((_, index) => <span key={index} className={index === photoIndex ? 'is-active' : index < photoIndex ? 'is-seen' : ''} />)}
        </div>
        <button className="photo-zone photo-zone--left" onClick={(event) => { event.stopPropagation(); changePhoto(-1) }} disabled={photoIndex === 0} aria-label="Forrige bilde" />
        <button className="photo-zone photo-zone--right" onClick={(event) => { event.stopPropagation(); changePhoto(1) }} disabled={photoIndex === venue.images.length - 1} aria-label="Neste bilde" />
        {photoIndex > 0 && <button className="photo-arrow photo-arrow--left" onClick={() => changePhoto(-1)}><ChevronLeft /></button>}
        {photoIndex < venue.images.length - 1 && <button className="photo-arrow photo-arrow--right" onClick={() => changePhoto(1)}><ChevronRight /></button>}
        <motion.div className="decision-stamp decision-stamp--yes" style={{ opacity: yesOpacity }}>RULL!</motion.div>
        <motion.div className="decision-stamp decision-stamp--no" style={{ opacity: noOpacity }}>NESTE</motion.div>
        <div className="swipe-card__topline">
          <span className="open-badge"><BadgeCheck size={14} /> Kontrollert {venue.dataCheckedAt}</span>
          <button className="info-button" onClick={(event) => { event.stopPropagation(); onDetails() }}><Info size={18} /></button>
        </div>
        <div className="swipe-card__content">
          <div className="rating-line">{venue.woltScore ? <><span><Star size={14} fill="currentColor" /> {venue.woltScore.toFixed(1)} / 10</span><small>Wolt · {venue.reviewCount.toLocaleString('nb-NO')} vurderinger</small></> : <small>Ingen publisert vurdering</small>}</div>
          <h2>{venue.name}</h2>
          <p className="location-line"><MapPin size={16} /> {venue.district} <span>•</span> {venue.address}</p>
          <div className="card-tags">{venue.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
          <button className="menu-peek" onClick={(event) => { event.stopPropagation(); onMenu() }}>
            <span><Utensils size={18} /><strong>Se hele menyen</strong><small>{venue.priceFrom > 0 ? `fra ${venue.priceFrom} kr` : 'sjekk pris hos kilden'}</small></span><ChevronRight />
          </button>
        </div>
      </div>
    </motion.article>
  )
}

function EmptyDeck({ totalRemaining, onFilters, onReset }: { totalRemaining: number; onFilters: () => void; onReset: () => void }) {
  return (
    <motion.div className="empty-deck" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
      <div className="empty-deck__icon"><Flame /></div>
      <h2>{totalRemaining > 0 ? 'Ingen treff med disse filtrene' : 'Du har rullet gjennom hele Oslo!'}</h2>
      <p>{totalRemaining > 0 ? 'Prøv en annen bydel eller et litt romsligere budsjett.' : 'Ta en titt på de du likte, eller start kortstokken på nytt.'}</p>
      <div>{totalRemaining > 0 && <button className="primary-small" onClick={onFilters}>Endre filtre</button>}<button className="secondary-small" onClick={onReset}>Start på nytt</button></div>
    </motion.div>
  )
}

function FilterSheet({ filters, onChange, onClose }: { filters: Filters; onChange: (filters: Filters) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(filters)
  const types = ['Alt', 'Kebab', 'Döner', 'Shawarma', 'Falafel', 'Tallerken']
  return (
    <ModalShell className="filter-sheet" onClose={onClose}>
      <div className="sheet-header"><div><span className="sheet-kicker">Finn riktig rull</span><h2>Filtre</h2></div><button className="close-button" onClick={onClose}><X /></button></div>
      <div className="filter-content">
        <label className="field-label">Bydel</label>
        <div className="select-wrap"><MapPin size={18} /><select value={draft.district} onChange={(event) => setDraft({ ...draft, district: event.target.value })}>{districts.map((district) => <option key={district}>{district}</option>)}</select><ChevronDown size={18} /></div>

        <div className="filter-row-title"><label className="field-label">Makspris</label><strong>{draft.maxPrice} kr</strong></div>
        <input className="range" type="range" min="80" max="400" step="10" value={draft.maxPrice} onChange={(event) => setDraft({ ...draft, maxPrice: Number(event.target.value) })} />
        <div className="range-labels"><span>80 kr</span><span>400 kr</span></div>

        <label className="field-label">Jeg har lyst på</label>
        <div className="choice-grid">{types.map((type) => <button key={type} className={draft.type === type ? 'is-selected' : ''} onClick={() => setDraft({ ...draft, type })}>{type}</button>)}</div>

        <label className="field-label">Minimum Wolt-score</label>
        <div className="rating-choices">{[0, 7, 8, 9].map((rating) => <button key={rating} className={draft.minRating === rating ? 'is-selected' : ''} onClick={() => setDraft({ ...draft, minRating: rating })}>{rating === 0 ? 'Alle' : <><Star size={14} fill="currentColor" /> {rating.toFixed(1)} / 10</>}</button>)}</div>

        <div className="filter-row-title verified-row"><div><label className="field-label">Kun verifiserte menyer</label><p className="field-help">Skjuler eksempelmenyer og ukontrollerte priser</p></div><button className={`toggle ${draft.verifiedMenu ? 'is-on' : ''}`} onClick={() => setDraft({ ...draft, verifiedMenu: !draft.verifiedMenu })}><span /></button></div>
      </div>
      <div className="sheet-footer"><button className="reset-button" onClick={() => setDraft(defaultFilters)}>Nullstill</button><button className="apply-button" onClick={() => { onChange(draft); onClose() }}>Vis steder <ArrowRight size={18} /></button></div>
    </ModalShell>
  )
}

function MenuSheet({ venue, onClose }: { venue: Venue; onClose: () => void }) {
  const [menu, setMenu] = useState<MenuSection[] | null>(venue.menuVerified ? null : [])

  useEffect(() => {
    if (!venue.menuVerified) return
    let active = true
    fetch(venue.menuPath)
      .then((response) => {
        if (!response.ok) throw new Error('Menu unavailable')
        return response.json() as Promise<MenuSection[]>
      })
      .then((data) => { if (active) setMenu(data) })
      .catch(() => { if (active) setMenu([]) })
    return () => { active = false }
  }, [venue.menuPath, venue.menuVerified])

  return (
    <ModalShell className="menu-sheet" onClose={onClose}>
      <div className="sheet-header menu-sheet__header"><div><span className="sheet-kicker">{venue.shortName}</span><h2>Hele menyen</h2></div><button className="close-button" onClick={onClose}><X /></button></div>
      <div className={`menu-status ${venue.menuVerified ? 'is-verified' : ''}`}>
        {venue.menuVerified ? <BadgeCheck /> : <Info />}
        <div><strong>{venue.menuVerified ? 'Meny hentet fra Wolt' : 'Meny ikke tilgjengelig i datakilden'}</strong><span>{venue.menuVerified ? `Kontrollert ${venue.menuUpdated}. Prisene er publiserte leveringspriser og kan endres.` : 'Åpne kilden for siste tilgjengelige pris.'}</span></div>
      </div>
      <div className="menu-content">
        {menu === null && <div className="menu-loading"><span className="spinner" /> Henter hele menyen…</div>}
        {menu?.length === 0 && <div className="menu-loading">Menyen kunne ikke lastes her. Bruk Wolt-lenken for å kontrollere siste versjon.</div>}
        {menu?.map((section) => (
          <section className="menu-section" key={section.title}>
            <h3>{section.title}<span>{section.items.length}</span></h3>
            {section.items.map((item) => (
              <div className="menu-item" key={item.name}>
                <div><strong>{item.name} {item.popular && <span className="popular-tag"><Flame size={11} /> Populær</span>}</strong>{item.description && <p>{item.description}</p>}</div>
                <span>{item.fromPrice ? 'fra ' : ''}{item.price} kr</span>
              </div>
            ))}
          </section>
        ))}
      </div>
      <div className="sheet-footer menu-footer"><a className="google-review-link" href={venue.sourceUrl} target="_blank" rel="noreferrer">Kontroller hos Wolt</a><a className="apply-button" href={venue.googleMapsUrl} target="_blank" rel="noreferrer">Se på Google <Navigation size={18} /></a></div>
    </ModalShell>
  )
}

function Saved({
  venues: savedVenues,
  favorites,
  reviews,
  onFavorite,
  onReview,
  onDetails,
  onDiscover,
  onFinale,
}: {
  venues: Venue[]
  favorites: string[]
  reviews: Record<string, Review>
  onFavorite: (id: string) => void
  onReview: (venue: Venue) => void
  onDetails: (venue: Venue) => void
  onDiscover: () => void
  onFinale: () => void
}) {
  const [tab, setTab] = useState<'all' | 'favorites' | 'visited'>('all')
  const shown = savedVenues.filter((venue) => tab === 'all' || (tab === 'favorites' ? favorites.includes(venue.id) : Boolean(reviews[venue.id])))
  return (
    <motion.section className="saved-page shell" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="page-heading"><div><span className="eyebrow"><span /> Din kebabliste</span><h1>Mine ruller</h1><p>Stedene du ikke klarte å sveipe forbi.</p></div>{savedVenues.length >= 3 && <button className="finale-button" onClick={onFinale}><Sparkles /> Start finalerunden</button>}</div>
      <div className="saved-tabs"><button className={tab === 'all' ? 'is-active' : ''} onClick={() => setTab('all')}>Vil prøve <span>{savedVenues.length}</span></button><button className={tab === 'favorites' ? 'is-active' : ''} onClick={() => setTab('favorites')}>Favoritter <span>{favorites.length}</span></button><button className={tab === 'visited' ? 'is-active' : ''} onClick={() => setTab('visited')}>Har spist <span>{Object.keys(reviews).length}</span></button></div>
      {shown.length > 0 ? (
        <div className="saved-grid">{shown.map((venue) => <SavedCard key={venue.id} venue={venue} favorite={favorites.includes(venue.id)} review={reviews[venue.id]} onFavorite={() => onFavorite(venue.id)} onReview={() => onReview(venue)} onDetails={() => onDetails(venue)} />)}</div>
      ) : (
        <div className="saved-empty"><div><Heart /></div><h2>{savedVenues.length === 0 ? 'Ingen ruller ennå' : 'Ingen steder i denne listen'}</h2><p>Sveip til høyre når noe ser godt ut. Vi passer på resten.</p><button className="primary-small" onClick={onDiscover}>Start å sveipe</button></div>
      )}
    </motion.section>
  )
}

function SavedCard({ venue, favorite, review, onFavorite, onReview, onDetails }: { venue: Venue; favorite: boolean; review?: Review; onFavorite: () => void; onReview: () => void; onDetails: () => void }) {
  const personalAverage = review ? (review.meat + review.sauce + review.bread + review.portion + review.value) / 5 : null
  return (
    <motion.article className="saved-card" layout whileHover={{ y: -4 }}>
      <button className="saved-card__image" onClick={onDetails}><img src={venue.images[0]} alt={venue.imageAlt[0]} /><span className="open-badge"><BadgeCheck size={13} /> {venue.sourceLabel}</span></button>
      <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={onFavorite} aria-label="Favoritt"><Heart fill={favorite ? 'currentColor' : 'none'} /></button>
      <div className="saved-card__body"><div className="saved-card__rating"><span><Star size={14} fill="currentColor" /> {venue.woltScore ? `${venue.woltScore.toFixed(1)} / 10` : '–'}</span><small>{venue.district}</small></div><h3 onClick={onDetails}>{venue.name}</h3><p><MapPin size={14} /> {venue.address} {venue.priceFrom > 0 && <><span>•</span> fra {venue.priceFrom} kr</>}</p>{personalAverage ? <div className="personal-score"><span>Din score</span><strong>{personalAverage.toFixed(1).replace('.', ',')}</strong><Star size={14} fill="currentColor" /></div> : <button className="review-prompt" onClick={onReview}><MessageSquareText size={16} /> Har du spist her? Vurder stedet</button>}</div>
    </motion.article>
  )
}

function ReviewSheet({ venue, initial, onSave, onClose }: { venue: Venue; initial?: Review; onSave: (review: Review) => void; onClose: () => void }) {
  const [scores, setScores] = useState({ meat: initial?.meat ?? 3, sauce: initial?.sauce ?? 3, bread: initial?.bread ?? 3, portion: initial?.portion ?? 3, value: initial?.value ?? 3 })
  const [note, setNote] = useState(initial?.note ?? '')
  const categories: { key: keyof typeof scores; label: string; emoji: string }[] = [
    { key: 'meat', label: 'Kjøtt', emoji: '🥩' }, { key: 'sauce', label: 'Saus', emoji: '🥣' }, { key: 'bread', label: 'Brød', emoji: '🫓' }, { key: 'portion', label: 'Mengde', emoji: '💪' }, { key: 'value', label: 'Verdi', emoji: '💸' },
  ]
  return (
    <ModalShell className="review-sheet" onClose={onClose}>
      <div className="sheet-header"><div><span className="sheet-kicker">Bare for deg</span><h2>Vurder {venue.shortName}</h2></div><button className="close-button" onClick={onClose}><X /></button></div>
      <div className="private-note"><Info size={17} /><span>Denne vurderingen lagres privat på enheten din.</span></div>
      <div className="review-content">
        {categories.map((category) => <div className="score-row" key={category.key}><div><span>{category.emoji}</span><strong>{category.label}</strong></div><div className="score-buttons">{[1, 2, 3, 4, 5].map((score) => <button key={score} className={scores[category.key] >= score ? 'is-filled' : ''} onClick={() => setScores({ ...scores, [category.key]: score })}><Star fill="currentColor" /></button>)}</div></div>)}
        <label className="note-label">Privat notat<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Hva bestilte du? Hvordan var den sterke sausen?" maxLength={320} /><span>{note.length}/320</span></label>
      </div>
      <div className="sheet-footer"><a className="google-review-link" href={venue.googleReviewUrl} target="_blank" rel="noreferrer">Skriv på Google</a><button className="apply-button" onClick={() => onSave({ venueId: venue.id, ...scores, note, visitedAt: new Date().toISOString() })}>Lagre privat <Check size={18} /></button></div>
    </ModalShell>
  )
}

function VenueDetails({ venue, liked, favorite, review, onClose, onLike, onFavorite, onMenu, onReview }: { venue: Venue; liked: boolean; favorite: boolean; review?: Review; onClose: () => void; onLike: () => void; onFavorite: () => void; onMenu: () => void; onReview: () => void }) {
  const [photo, setPhoto] = useState(0)
  return (
    <motion.div className="detail-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="venue-detail" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}>
        <div className="detail-hero"><img src={venue.images[photo]} alt={venue.imageAlt[photo]} /><div className="detail-hero__shade" /><button className="back-button" onClick={onClose}><ArrowLeft /></button><button className={`detail-favorite ${favorite ? 'is-favorite' : ''}`} onClick={onFavorite}><Heart fill={favorite ? 'currentColor' : 'none'} /></button><div className="detail-photo-dots">{venue.images.map((_, index) => <button key={index} className={index === photo ? 'is-active' : ''} onClick={() => setPhoto(index)} />)}</div></div>
        <div className="detail-body"><div className="detail-status"><span className="open-text"><BadgeCheck size={14} /> Kontrollert {venue.dataCheckedAt}</span><span>{venue.sourceLabel}</span></div><h2>{venue.name}</h2><p className="detail-address"><MapPin size={16} /> {venue.address}, {venue.district}</p><div className="detail-stats"><div><Star fill="currentColor" /><strong>{venue.woltScore ? `${venue.woltScore.toFixed(1)} / 10` : '–'}</strong><span>{venue.reviewCount.toLocaleString('nb-NO')} Wolt-vurderinger</span></div><div><MapPin /><strong>{venue.district}</strong><span>adresse kontrollert</span></div><div><span className="price-symbol">kr</span><strong>{venue.priceFrom > 0 ? `Fra ${venue.priceFrom}` : 'Se meny'}</strong><span>publisert leveringspris</span></div></div><p className="detail-description">{venue.description}</p><div className="feature-list">{venue.features.map((feature) => <span key={feature}><Check size={14} /> {feature}</span>)}</div><div className="detail-actions"><button onClick={onMenu}><BookOpen /> Se meny</button><a href={venue.googleMapsUrl} target="_blank" rel="noreferrer"><Navigation /> Google / veibeskrivelse</a></div>{liked ? <button className="review-wide" onClick={onReview}><MessageSquareText /> {review ? 'Endre din private vurdering' : 'Har du spist her? Legg til privat vurdering'}<ChevronRight /></button> : <button className="like-wide" onClick={onLike}><Heart fill="currentColor" /> Lagre i Mine ruller</button>}<p className="data-disclaimer"><Info size={14} /> Navn, adresse, meny, priser, bilder og Wolt-score er hentet fra restaurantens aktive Wolt-oppføring. Google-knappen åpner den levende Google-profilen; RULL viser ikke et Google-tall uten Places-integrasjon.</p></div>
      </motion.div>
    </motion.div>
  )
}

function Finale({ venues: liked, onClose, onDiscover }: { venues: Venue[]; onClose: () => void; onDiscover: () => void }) {
  const candidates = useMemo(() => [...liked].sort((a, b) => (b.woltScore ?? 0) - (a.woltScore ?? 0) || a.priceFrom - b.priceFrom).slice(0, 3), [liked])
  const [winner, setWinner] = useState<Venue | null>(null)
  const [isChoosing, setIsChoosing] = useState(false)
  const choose = () => {
    if (candidates.length === 0) return
    setIsChoosing(true)
    window.setTimeout(() => {
      const weighted = candidates.flatMap((venue, index) => Array(Math.max(1, candidates.length - index)).fill(venue)) as Venue[]
      setWinner(weighted[Math.floor(Math.random() * weighted.length)])
      setIsChoosing(false)
    }, 1300)
  }
  return (
    <motion.div className="finale-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="finale" initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0 }}>
        <button className="finale-close" onClick={onClose}><X /></button>
        {!winner ? <><div className="finale-icon"><Sparkles /></div><span className="sheet-kicker">Kveldens avgjørelse</span><h2>Finalerunden</h2><p>{candidates.length >= 3 ? 'Tre steder er igjen. Kildekontrollert Wolt-score, menypris og litt skjebne avgjør.' : 'Du trenger minst tre lagrede steder før finalen kan starte.'}</p>{candidates.length >= 3 ? <><div className={`finalists ${isChoosing ? 'is-choosing' : ''}`}>{candidates.map((venue, index) => <div className="finalist" key={venue.id} style={{ '--i': index } as React.CSSProperties}><img src={venue.images[0]} alt="" /><span>{venue.shortName}</span></div>)}</div><button className="choose-button" onClick={choose} disabled={isChoosing}>{isChoosing ? <><span className="spinner" /> Ruller...</> : <>Bare velg for meg <Zap fill="currentColor" /></>}</button></> : <button className="choose-button" onClick={onDiscover}>Finn flere steder <ArrowRight /></button>}</> : <motion.div className="winner" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}><span className="winner__kicker">DET BLIR RULL HOS</span><div className="winner__image"><img src={winner.images[0]} alt={winner.imageAlt[0]} /><span><Flame fill="currentColor" /></span></div><h2>{winner.name}</h2><p><Star size={15} fill="currentColor" /> {winner.woltScore ? `${winner.woltScore.toFixed(1)} / 10 på Wolt` : 'Ingen publisert score'} <span>•</span> {winner.district} {winner.priceFrom > 0 && <><span>•</span> fra {winner.priceFrom} kr</>}</p><div className="winner__actions"><a href={winner.googleMapsUrl} target="_blank" rel="noreferrer"><Navigation /> Dra dit</a><button onClick={() => setWinner(null)}><RotateCcw /> Velg igjen</button></div></motion.div>}
      </motion.div>
    </motion.div>
  )
}

function Profile({ decisions, reviews, favorites, onReset, onReport }: { decisions: Record<string, SwipeDecision>; reviews: Record<string, Review>; favorites: string[]; onReset: () => void; onReport: () => void }) {
  const liked = Object.values(decisions).filter((decision) => decision === 'liked').length
  const passed = Object.values(decisions).filter((decision) => decision === 'passed').length
  const avg = Object.values(reviews).length ? Object.values(reviews).reduce((total, review) => total + review.meat + review.sauce + review.bread + review.portion + review.value, 0) / (Object.values(reviews).length * 5) : 0
  return (
    <motion.section className="profile-page shell" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="profile-hero"><div className="profile-avatar"><Flame fill="currentColor" /></div><span className="eyebrow"><span /> Din kebabprofil</span><h1>Min smak</h1><p>Jo mer du ruller og vurderer, desto bedre kan RULL velge for deg.</p></div>
      <div className="profile-stats"><article><Heart /><strong>{liked}</strong><span>lagret</span></article><article><X /><strong>{passed}</strong><span>sendt videre</span></article><article><Star /><strong>{avg ? avg.toFixed(1).replace('.', ',') : '–'}</strong><span>snittscore</span></article><article><Flame /><strong>{favorites.length}</strong><span>favoritter</span></article></div>
      <div className="taste-card"><div><span className="sheet-kicker">Smaksprofil</span><h2>Fortsatt under utvikling</h2><p>Vurder minst tre besøk, så finner vi ut om du er sausjeger, kjøttpurist eller porsjonsmester.</p></div><div className="taste-meter"><span style={{ width: `${Math.min(100, Object.keys(reviews).length * 33)}%` }} /></div><small>{Object.keys(reviews).length} av 3 vurderinger</small></div>
      <div className="profile-settings"><h2>Innstillinger</h2><button><MapPin /><span><strong>Standardområde</strong><small>Hele Oslo</small></span><ChevronRight /></button><button onClick={onReport}><Store /><span><strong>Mangler et sted?</strong><small>Send inn navn og adresse til kontroll</small></span><ChevronRight /></button><button onClick={() => { if (window.confirm('Vil du gjøre alle stedene tilgjengelige for sveiping igjen?')) onReset() }}><RotateCcw /><span><strong>Nullstill kortstokken</strong><small>Beholder favoritter og private vurderinger</small></span><ChevronRight /></button></div>
      <div className="preview-explainer"><Info /><div><strong>Kildekontrollert restaurantdatabase</strong><p>RULL inneholder {venues.length} aktive Wolt-oppføringer i alle 15 bydeler og Sentrum. Menyer, priser og bilder ble kontrollert 17. juli 2026. Opplysninger kan endres hos restauranten.</p></div></div>
    </motion.section>
  )
}

function ReportSheet({ onClose, onSubmit }: { onClose: () => void; onSubmit: (report: MissingPlaceReport) => void }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [link, setLink] = useState('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const valid = name.trim().length >= 2 && address.trim().length >= 3

  const submit = () => {
    if (!valid) return
    onSubmit({
      id: crypto.randomUUID(),
      name: name.trim(),
      address: address.trim(),
      link: link.trim(),
      note: note.trim(),
      createdAt: new Date().toISOString(),
    })
    setSubmitted(true)
  }

  return (
    <ModalShell className="report-sheet" onClose={onClose}>
      <div className="sheet-header"><div><span className="sheet-kicker">Hjelp oss dekke hele Oslo</span><h2>Mangler et sted?</h2></div><button className="close-button" onClick={onClose}><X /></button></div>
      {!submitted ? (
        <>
          <div className="report-content">
            <p>Send inn stedet, så kan det kontrolleres før det legges i kortstokken.</p>
            <label>Navn på stedet<input value={name} onChange={(event) => setName(event.target.value)} placeholder="For eksempel Alna Kebab" /></label>
            <label>Adresse<input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Gateadresse eller bydel" /></label>
            <label>Google Maps eller nettside <small>valgfritt</small><input value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://" inputMode="url" /></label>
            <label>Ekstra informasjon <small>valgfritt</small><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Hva slags kebab har de?" maxLength={400} /></label>
          </div>
          <div className="sheet-footer"><button className="apply-button report-submit" disabled={!valid} onClick={submit}>Send til kontroll <ArrowRight size={18} /></button></div>
        </>
      ) : (
        <div className="report-success"><div><Check /></div><h3>Takk! Stedet er registrert.</h3><p>Innsendingen ligger lokalt i forhåndsvisningen og kan sendes til administrasjonssystemet når databasen kobles til.</p><button className="primary-small" onClick={onClose}>Ferdig</button></div>
      )}
    </ModalShell>
  )
}

function ModalShell({ className, onClose, children }: { className: string; onClose: () => void; children: React.ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    document.body.classList.add('modal-open')
    const handleKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleKey)
    return () => { document.body.classList.remove('modal-open'); window.removeEventListener('keydown', handleKey) }
  }, [onClose])
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <motion.div ref={panelRef} className={`sheet ${className}`} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 280 }}>{children}</motion.div>
    </motion.div>
  )
}

function BottomNav({ view, onNavigate, likedCount }: { view: View; onNavigate: (view: View) => void; likedCount: number }) {
  return (
    <nav className="bottom-nav" aria-label="Mobilmeny">
      <button className={view === 'home' ? 'is-active' : ''} onClick={() => onNavigate('home')}><Home /><span>Hjem</span></button>
      <button className={view === 'discover' ? 'is-active' : ''} onClick={() => onNavigate('discover')}><Flame fill={view === 'discover' ? 'currentColor' : 'none'} /><span>Sveip</span></button>
      <button className={view === 'saved' ? 'is-active' : ''} onClick={() => onNavigate('saved')}><Heart fill={view === 'saved' ? 'currentColor' : 'none'} />{likedCount > 0 && <b>{likedCount}</b>}<span>Lagret</span></button>
      <button className={view === 'profile' ? 'is-active' : ''} onClick={() => onNavigate('profile')}><UserRound /><span>Min smak</span></button>
    </nav>
  )
}

export default App
