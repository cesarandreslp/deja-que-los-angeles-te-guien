import { Metadata } from 'next'
import MembershipPlans from '@/components/MembershipPlans'

export const metadata: Metadata = {
  title: 'Planes de Membresía - Oráculo Angelical',
  description: 'Accede a contenido exclusivo, consultas especializadas y beneficios premium con nuestros planes de membresía',
  keywords: 'membresía, premium, consultas angelicales, oráculo, suscripción',
}

export default function MembershipsPage() {
  return (
    <MembershipPlans />
  )
}