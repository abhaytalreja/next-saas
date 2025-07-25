import { 
  ContextMenu, 
  ContextMenuTrigger, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuSeparator 
} from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'

const BasicExample = () => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="p-8 bg-gray-100 rounded-lg text-center cursor-context-menu">
          <p className="text-gray-600">Right-click anywhere in this area</p>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => console.log('Cut')}>
          Cut
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => console.log('Copy')}>
          Copy
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => console.log('Paste')}>
          Paste
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => console.log('Delete')}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

const examples = [
  {
    title: 'Basic Context Menu',
    code: `<ContextMenu>
  <ContextMenuTrigger>
    <div className="p-8 bg-gray-100 rounded-lg text-center">
      <p>Right-click anywhere in this area</p>
    </div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onSelect={() => console.log('Cut')}>
      Cut
    </ContextMenuItem>
    <ContextMenuItem onSelect={() => console.log('Copy')}>
      Copy
    </ContextMenuItem>
    <ContextMenuItem onSelect={() => console.log('Paste')}>
      Paste
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem onSelect={() => console.log('Delete')}>
      Delete
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
    component: <BasicExample />,
  },
]

export default function ContextMenuPage() {
  return (
    <ComponentLayout
      title="Context Menu"
      description="A right-click menu component that provides contextual actions for specific elements."
      examples={examples}
    />
  )
}