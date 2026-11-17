// Fields of the OmniContact "Lead Gen" forms in Zoho Forms (MaaS, ARAMS and
// Data Labelling all share this layout). Field names and option values must
// match the Zoho form exactly, because the site posts them straight to Zoho.

export const zohoIndustries = [
  'Agriculture & Agribusiness',
  'Automotive & Mobility',
  'Banking & Financial Services',
  'Construction & Real Estate',
  'Education & Training',
  'Energy & Utilities',
  'Financial Technology (Fintech)',
  'Government & Public Sector',
  'Healthcare & HealthTech',
  'Hospitality & Tourism',
  'Insurance',
  'Logistics & Transportation',
  'Manufacturing & Industrial',
  'Media & Entertainment',
  'Mining & Natural Resources',
  'Non-Profit & NGOs',
  'Professional & Business Services',
  'Retail & E-commerce',
  'Technology & Software',
  'Telecommunications',
  'Other',
]

export const zohoBudgetRanges = [
  'Less than $2,000',
  '$2,000 – $5,000',
  '$5,001 – $10,000',
  '$10,001 – $20,000',
  '$20,001 – $40,000',
  '$40,001 – $60,000',
  '$60,001 – $80,000',
  '$80,001 – $100,000',
  'More than $100,000',
]

// Which Zoho field holds the contact details, for forms that are sent through
// the site's own backend instead of straight to Zoho.
export const zohoContactFields = {
  firstName: 'SingleLine1',
  lastName: 'SingleLine2',
  email: 'Email',
  company: 'SingleLine',
}

export function zohoLeadFields({
  emailPlaceholder = 'you@company.com',
  companyLabel = 'Company Name',
  companyPlaceholder = 'Your company',
  jobTitlePlaceholder = 'e.g. Operations Manager',
} = {}) {
  return [
    { name: 'SingleLine1', label: 'First Name', required: true, placeholder: 'First name' },
    { name: 'SingleLine2', label: 'Last Name', required: true, placeholder: 'Last name' },
    { name: 'Email', label: 'Work Email', type: 'email', required: true, placeholder: emailPlaceholder },
    { name: 'SingleLine', label: companyLabel, required: true, placeholder: companyPlaceholder },
    { name: 'SingleLine3', label: 'Job Title', required: true, placeholder: jobTitlePlaceholder },
    { name: 'Dropdown', label: 'Industry', type: 'select', required: true, placeholder: 'Please select', options: zohoIndustries },
    { name: 'Dropdown1', label: 'Budget Range', type: 'select', required: true, placeholder: 'Please select', options: zohoBudgetRanges },
    {
      name: 'MultiLine',
      label: 'Your business challenges',
      type: 'textarea',
      required: true,
      placeholder: 'Briefly describe your business challenges and what support you need',
    },
  ]
}
