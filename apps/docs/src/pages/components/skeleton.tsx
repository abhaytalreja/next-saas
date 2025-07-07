import { Skeleton, SkeletonText } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'

const examples = [
  {
    title: 'Basic Skeleton',
    code: `<div className="space-y-2">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
</div>`,
    component: (
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    ),
  },
  {
    title: 'Skeleton Variants',
    code: `<div className="space-y-4">
  <Skeleton variant="text" />
  <Skeleton variant="circular" width={40} height={40} />
  <Skeleton variant="rectangular" width={200} height={100} />
  <Skeleton variant="rounded" width={200} height={100} />
</div>`,
    component: (
      <div className="space-y-4">
        <Skeleton variant="text" />
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="rectangular" width={200} height={100} />
        <Skeleton variant="rounded" width={200} height={100} />
      </div>
    ),
  },
  {
    title: 'Skeleton Text',
    code: `<div className="space-y-4">
  <SkeletonText lines={1} />
  <SkeletonText lines={3} />
  <SkeletonText lines={5} spacing="lg" />
</div>`,
    component: (
      <div className="space-y-4">
        <SkeletonText lines={1} />
        <SkeletonText lines={3} />
        <SkeletonText lines={5} spacing="lg" />
      </div>
    ),
  },
  {
    title: 'Card Skeleton',
    code: `<div className="border rounded-lg p-4 space-y-3">
  <div className="flex items-center space-x-4">
    <Skeleton variant="circular" width={40} height={40} />
    <div className="space-y-2">
      <Skeleton className="h-4 w-[120px]" />
      <Skeleton className="h-3 w-[80px]" />
    </div>
  </div>
  <SkeletonText lines={3} />
</div>`,
    component: (
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
        </div>
        <SkeletonText lines={3} />
      </div>
    ),
  },
]

export default function SkeletonPage() {
  return (
    <ComponentLayout
      title="Skeleton"
      description="Use to show a placeholder while content is loading."
      examples={examples}
    />
  )
}