import { facilityTour } from './about'

const tourUrl = new URL(facilityTour.src)
tourUrl.searchParams.set('initload', '0')
tourUrl.searchParams.set('thumbs', '-1')
tourUrl.searchParams.set('inst', '0')
tourUrl.searchParams.set('info', '0')
tourUrl.searchParams.set('logo', '-1')

export const siteTourEmbedSrc = tourUrl.toString()

export const siteTourPage = {
  seoTitle: 'OmniContact Virtual Site Tour | Explore Our Operations',
  seoDescription:
    'Explore OmniContact’s operational environment through an immersive 360° virtual site tour.',
  tour: {
    ...facilityTour,
    startLabel: 'Play',
    src: siteTourEmbedSrc,
  },
}
