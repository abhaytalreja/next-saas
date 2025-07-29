'use client'

import { OrganizationDetails } from '@nextsaas/admin'

interface PageProps {
  params: {
    id: string
  }
}

export default function OrganizationDetailsPage({ params }: PageProps) {
  return <OrganizationDetails organizationId={params.id} />
}