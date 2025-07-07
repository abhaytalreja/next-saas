import { Divider } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'

const examples = [
  {
    title: 'Basic Divider',
    code: `<div>
  <p>Content above</p>
  <Divider />
  <p>Content below</p>
</div>`,
    component: (
      <div>
        <p>Content above</p>
        <Divider />
        <p>Content below</p>
      </div>
    ),
  },
  {
    title: 'Divider with Text',
    code: `<div>
  <p>Content above</p>
  <Divider>OR</Divider>
  <p>Content below</p>
</div>`,
    component: (
      <div>
        <p>Content above</p>
        <Divider>OR</Divider>
        <p>Content below</p>
      </div>
    ),
  },
  {
    title: 'Divider Variants',
    code: `<div className="space-y-4">
  <Divider variant="solid" />
  <Divider variant="dashed" />
  <Divider variant="dotted" />
</div>`,
    component: (
      <div className="space-y-4">
        <Divider variant="solid" />
        <Divider variant="dashed" />
        <Divider variant="dotted" />
      </div>
    ),
  },
  {
    title: 'Divider Thickness',
    code: `<div className="space-y-4">
  <Divider thickness="thin" />
  <Divider thickness="medium" />
  <Divider thickness="thick" />
</div>`,
    component: (
      <div className="space-y-4">
        <Divider thickness="thin" />
        <Divider thickness="medium" />
        <Divider thickness="thick" />
      </div>
    ),
  },
  {
    title: 'Vertical Divider',
    code: `<div className="flex items-center h-20 space-x-4">
  <span>Left</span>
  <Divider orientation="vertical" />
  <span>Center</span>
  <Divider orientation="vertical" />
  <span>Right</span>
</div>`,
    component: (
      <div className="flex items-center h-20 space-x-4">
        <span>Left</span>
        <Divider orientation="vertical" />
        <span>Center</span>
        <Divider orientation="vertical" />
        <span>Right</span>
      </div>
    ),
  },
]

export default function DividerPage() {
  return (
    <ComponentLayout
      title="Divider"
      description="A thin line that groups content in lists and layouts."
      examples={examples}
    />
  )
}