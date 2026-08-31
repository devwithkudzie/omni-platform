import CmsBlogEditor from '@/features/cms/components/CmsBlogEditor'

export const metadata = {
  title: 'Edit CMS Post | OmniContact',
}

export default async function EditAdminBlogPage({ params }) {
  const { id } = await params
  return <CmsBlogEditor postId={id} />
}
