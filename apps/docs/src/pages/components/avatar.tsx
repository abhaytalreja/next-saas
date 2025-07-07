import { Avatar, AvatarImage, AvatarFallback } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'

const examples = [
  {
    title: 'Basic Avatar',
    code: `<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>`,
    component: (
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    ),
  },
  {
    title: 'Avatar Sizes',
    code: `<div className="flex items-center space-x-4">
  <Avatar size="xs">
    <AvatarFallback>XS</AvatarFallback>
  </Avatar>
  <Avatar size="sm">
    <AvatarFallback>SM</AvatarFallback>
  </Avatar>
  <Avatar size="default">
    <AvatarFallback>MD</AvatarFallback>
  </Avatar>
  <Avatar size="lg">
    <AvatarFallback>LG</AvatarFallback>
  </Avatar>
  <Avatar size="xl">
    <AvatarFallback>XL</AvatarFallback>
  </Avatar>
  <Avatar size="2xl">
    <AvatarFallback>2XL</AvatarFallback>
  </Avatar>
</div>`,
    component: (
      <div className="flex items-center space-x-4">
        <Avatar size="xs">
          <AvatarFallback>XS</AvatarFallback>
        </Avatar>
        <Avatar size="sm">
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <Avatar size="default">
          <AvatarFallback>MD</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>
        <Avatar size="xl">
          <AvatarFallback>XL</AvatarFallback>
        </Avatar>
        <Avatar size="2xl">
          <AvatarFallback>2XL</AvatarFallback>
        </Avatar>
      </div>
    ),
  },
  {
    title: 'Avatar with Fallback',
    code: `<div className="flex items-center space-x-4">
  <Avatar>
    <AvatarImage src="/broken-image.jpg" alt="Broken" />
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarFallback>AB</AvatarFallback>
  </Avatar>
</div>`,
    component: (
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src="/broken-image.jpg" alt="Broken" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      </div>
    ),
  },
]

export default function AvatarPage() {
  return (
    <ComponentLayout
      title="Avatar"
      description="An image element with a fallback for representing the user."
      examples={examples}
    />
  )
}