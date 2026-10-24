import { describe, expect, it } from 'vitest'
import * as api from './index'

describe('public API', () => {
  it('exports the color-mode entry points from the package root', () => {
    expect(typeof api.useColorMode).toBe('function')
    expect(typeof api.ColorModeScript).toBe('function')
  })

  it('exports every component', () => {
    const expected = [
      'Accordion',
      'Alert',
      'Avatar',
      'Badge',
      'Breadcrumb',
      'Button',
      'Card',
      'Checkbox',
      'Collapsible',
      'CollapsibleContent',
      'CollapsibleTrigger',
      'ColorModeScript',
      'Combobox',
      'DataList',
      'DatePicker',
      'Drawer',
      'DropdownMenu',
      'EmptyState',
      'Field',
      'FieldDescription',
      'FieldError',
      'FieldLabel',
      'FileUpload',
      'IconButton',
      'InlineMessage',
      'Input',
      'Kbd',
      'Link',
      'Meter',
      'Modal',
      'NumberInput',
      'Pagination',
      'Popover',
      'Progress',
      'Radio',
      'SegmentedControl',
      'Select',
      'Separator',
      'Skeleton',
      'Slider',
      'Spinner',
      'Stepper',
      'Switch',
      'Table',
      'Tabs',
      'Tag',
      'Textarea',
      'Toast',
      'ToastProvider',
      'ToggleGroup',
      'Tooltip',
      'Wizard',
      'AppShell',
      'DashboardLayout',
      'DocsSiteLayout',
      'FormLayout',
      'MarketingSiteLayout',
      'Navbar',
      'Sidebar',
      'computePosition',
      'useDismissable',
      'useFieldControlProps',
      'useFocusTrap',
      'useToast',
    ]
    const missing = expected.filter((name) => !(name in api))
    expect(missing).toEqual([])
  })

  it('does not leak internal helpers', () => {
    expect('cx' in api).toBe(false)
  })
})
