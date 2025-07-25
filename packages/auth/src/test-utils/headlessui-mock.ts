// Mock for @headlessui/react
import React from 'react'

export const Tab = {
  Group: ({ children, selectedIndex = 0, onChange = () => {}, ...props }: any) =>
    React.createElement('div', {
      'data-testid': 'tab-group',
      'data-selected-index': selectedIndex,
      ...props
    }, typeof children === 'function' ? children({ selectedIndex }) : children),

  List: ({ children, ...props }: any) =>
    React.createElement('div', {
      'data-testid': 'tab-list',
      role: 'tablist',
      ...props
    }, children),

  Tab: ({ children, className, disabled, ...props }: any) => {
    const isSelected = typeof className === 'function' ? 
      className({ selected: true }).includes('bg-white') : false
    
    return React.createElement('button', {
      'data-testid': 'tab',
      role: 'tab',
      className: isSelected ? 'selected' : 'unselected',
      disabled,
      ...props
    }, typeof children === 'function' ? children({ selected: isSelected }) : children)
  },

  Panels: ({ children, ...props }: any) =>
    React.createElement('div', {
      'data-testid': 'tab-panels',
      ...props
    }, children),

  Panel: ({ children, ...props }: any) =>
    React.createElement('div', {
      'data-testid': 'tab-panel',
      ...props
    }, children)
}

export const Disclosure = {
  Disclosure: ({ children, ...props }: any) =>
    React.createElement('div', {
      'data-testid': 'disclosure',
      ...props
    }, typeof children === 'function' ? children({ open: false }) : children),

  Button: ({ children, ...props }: any) =>
    React.createElement('button', {
      'data-testid': 'disclosure-button',
      ...props
    }, typeof children === 'function' ? children({ open: false }) : children),

  Panel: ({ children, ...props }: any) =>
    React.createElement('div', {
      'data-testid': 'disclosure-panel',
      ...props
    }, children)
}

export default { Tab, Disclosure }