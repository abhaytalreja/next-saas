'use client'

import { UserDetails } from '@nextsaas/admin/components/users/UserDetails'

interface PageProps {
  params: {
    id: string
  }
}

export default function UserDetailsPage({ params }: PageProps) {
  return <UserDetails userId={params.id} />
}