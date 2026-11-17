import { aramsLanding, aramsSeo } from '@/features/solutions/data/arams'
import { dataAnnotationLanding, dataAnnotationSeo } from '@/features/solutions/data/dataAnnotation'
import { maasLanding, maasSeo } from '@/features/solutions/data/maas'

// Service pages with hand-written landing copy. Every other page is built
// from its data by buildLanding.js.
export const customLandings = {
  'marketing-as-a-service': maasLanding,
  'data-annotation-labelling': dataAnnotationLanding,
  arams: aramsLanding,
}

export const customSeo = {
  'marketing-as-a-service': maasSeo,
  'data-annotation-labelling': dataAnnotationSeo,
  arams: aramsSeo,
}
