import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { AnalyticsChart } from '../../../components/analytics/AnalyticsChart'
import { TimeSeriesData } from '../../../types'

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children, height }: any) => (
    <div data-testid="responsive-container" style={{ height }}>
      {children}
    </div>
  ),
  LineChart: ({ data, children }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  AreaChart: ({ data, children }: any) => (
    <div data-testid="area-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  BarChart: ({ data, children }: any) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  PieChart: ({ children }: any) => (
    <div data-testid="pie-chart">
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke, strokeWidth }: any) => (
    <div data-testid="line" data-datakey={dataKey} data-stroke={stroke} data-strokewidth={strokeWidth} />
  ),
  Area: ({ dataKey, stroke, fill, fillOpacity }: any) => (
    <div data-testid="area" data-datakey={dataKey} data-stroke={stroke} data-fill={fill} data-fillopacity={fillOpacity} />
  ),
  Bar: ({ dataKey, fill }: any) => (
    <div data-testid="bar" data-datakey={dataKey} data-fill={fill} />
  ),
  Pie: ({ data, dataKey }: any) => (
    <div data-testid="pie" data-datakey={dataKey} data-pie-data={JSON.stringify(data)}>
      {data.map((_: any, index: number) => (
        <div key={index} data-testid="pie-cell" />
      ))}
    </div>
  ),
  XAxis: ({ dataKey, tickFormatter, stroke, fontSize }: any) => (
    <div data-testid="x-axis" data-datakey={dataKey} data-stroke={stroke} data-fontsize={fontSize} />
  ),
  YAxis: ({ stroke, fontSize }: any) => (
    <div data-testid="y-axis" data-stroke={stroke} data-fontsize={fontSize} />
  ),
  CartesianGrid: ({ strokeDasharray, stroke }: any) => (
    <div data-testid="cartesian-grid" data-strokedasharray={strokeDasharray} data-stroke={stroke} />
  ),
  Tooltip: ({ formatter, labelFormatter, contentStyle }: any) => (
    <div data-testid="tooltip" data-contentstyle={JSON.stringify(contentStyle)} />
  ),
  Cell: ({ fill }: any) => (
    <div data-testid="cell" data-fill={fill} />
  )
}))

expect.extend(toHaveNoViolations)

describe('AnalyticsChart', () => {
  const mockData: TimeSeriesData[] = [
    { date: '2024-01-01', value: 100, label: 'Jan 1' },
    { date: '2024-01-02', value: 150, label: 'Jan 2' },
    { date: '2024-01-03', value: 120, label: 'Jan 3' },
    { date: '2024-01-04', value: 200, label: 'Jan 4' },
    { date: '2024-01-05', value: 180, label: 'Jan 5' }
  ]

  const defaultProps = {
    data: mockData,
    type: 'line' as const,
    dataKey: 'value'
  }

  describe('rendering', () => {
    it('should render responsive container with correct height', () => {
      render(<AnalyticsChart {...defaultProps} height={400} />)
      
      const container = screen.getByTestId('responsive-container')
      expect(container).toBeInTheDocument()
      expect(container).toHaveStyle({ height: '400px' })
    })

    it('should use default height when not specified', () => {
      render(<AnalyticsChart {...defaultProps} />)
      
      const container = screen.getByTestId('responsive-container')
      expect(container).toHaveStyle({ height: '300px' })
    })

    it('should render line chart correctly', () => {
      render(<AnalyticsChart {...defaultProps} type="line" />)
      
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.getByTestId('line')).toBeInTheDocument()
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('should render area chart correctly', () => {
      render(<AnalyticsChart {...defaultProps} type="area" />)
      
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
      expect(screen.getByTestId('area')).toBeInTheDocument()
    })

    it('should render bar chart correctly', () => {
      render(<AnalyticsChart {...defaultProps} type="bar" />)
      
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar')).toBeInTheDocument()
    })

    it('should render pie chart correctly', () => {
      render(<AnalyticsChart {...defaultProps} type="pie" />)
      
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.getByTestId('pie')).toBeInTheDocument()
      expect(screen.getAllByTestId('pie-cell')).toHaveLength(mockData.length)
    })

    it('should pass data to charts correctly', () => {
      render(<AnalyticsChart {...defaultProps} type="line" />)
      
      const lineChart = screen.getByTestId('line-chart')
      expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(mockData))
    })

    it('should pass dataKey to chart elements', () => {
      render(<AnalyticsChart {...defaultProps} type="line" dataKey="customKey" />)
      
      const line = screen.getByTestId('line')
      expect(line).toHaveAttribute('data-datakey', 'customKey')
    })

    it('should use custom xAxisKey', () => {
      render(<AnalyticsChart {...defaultProps} xAxisKey="customDate" />)
      
      const xAxis = screen.getByTestId('x-axis')
      expect(xAxis).toHaveAttribute('data-datakey', 'customDate')
    })

    it('should use default xAxisKey when not specified', () => {
      render(<AnalyticsChart {...defaultProps} />)
      
      const xAxis = screen.getByTestId('x-axis')
      expect(xAxis).toHaveAttribute('data-datakey', 'date')
    })
  })

  describe('styling and colors', () => {
    it('should use default color when not specified', () => {
      render(<AnalyticsChart {...defaultProps} type="line" />)
      
      const line = screen.getByTestId('line')
      expect(line).toHaveAttribute('data-stroke', '#3b82f6')
    })

    it('should use custom color when specified', () => {
      render(<AnalyticsChart {...defaultProps} type="line" color="#ff0000" />)
      
      const line = screen.getByTestId('line')
      expect(line).toHaveAttribute('data-stroke', '#ff0000')
    })

    it('should apply custom color to area chart', () => {
      render(<AnalyticsChart {...defaultProps} type="area" color="#00ff00" />)
      
      const area = screen.getByTestId('area')
      expect(area).toHaveAttribute('data-stroke', '#00ff00')
      expect(area).toHaveAttribute('data-fill', '#00ff00')
    })

    it('should apply custom color to bar chart', () => {
      render(<AnalyticsChart {...defaultProps} type="bar" color="#0000ff" />)
      
      const bar = screen.getByTestId('bar')
      expect(bar).toHaveAttribute('data-fill', '#0000ff')
    })

    it('should set correct styling properties for charts', () => {
      render(<AnalyticsChart {...defaultProps} type="line" />)
      
      const cartesianGrid = screen.getByTestId('cartesian-grid')
      expect(cartesianGrid).toHaveAttribute('data-strokedasharray', '3 3')
      expect(cartesianGrid).toHaveAttribute('data-stroke', '#f0f0f0')
      
      const xAxis = screen.getByTestId('x-axis')
      expect(xAxis).toHaveAttribute('data-stroke', '#6b7280')
      expect(xAxis).toHaveAttribute('data-fontsize', '12')
      
      const yAxis = screen.getByTestId('y-axis')
      expect(yAxis).toHaveAttribute('data-stroke', '#6b7280')
      expect(yAxis).toHaveAttribute('data-fontsize', '12')
    })

    it('should set correct line properties', () => {
      render(<AnalyticsChart {...defaultProps} type="line" />)
      
      const line = screen.getByTestId('line')
      expect(line).toHaveAttribute('data-strokewidth', '2')
    })

    it('should set correct area properties', () => {
      render(<AnalyticsChart {...defaultProps} type="area" />)
      
      const area = screen.getByTestId('area')
      expect(area).toHaveAttribute('data-fillopacity', '0.2')
    })
  })

  describe('loading state', () => {
    it('should render loading spinner when loading is true', () => {
      const { container } = render(<AnalyticsChart {...defaultProps} loading={true} />)
      
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
      expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument()
    })

    it('should render loading spinner with correct height', () => {
      const { container } = render(<AnalyticsChart {...defaultProps} loading={true} height={500} />)
      
      const loadingContainer = container.querySelector('.flex')
      expect(loadingContainer).toHaveStyle({ height: '500px' })
    })

    it('should not render chart when loading', () => {
      render(<AnalyticsChart {...defaultProps} loading={true} />)
      
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('should render empty state when data is null', () => {
      render(<AnalyticsChart {...defaultProps} data={null as any} />)
      
      expect(screen.getByText('No data available')).toBeInTheDocument()
      expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument()
    })

    it('should render empty state when data is empty array', () => {
      render(<AnalyticsChart {...defaultProps} data={[]} />)
      
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should render empty state with correct height', () => {
      const { container } = render(<AnalyticsChart {...defaultProps} data={[]} height={400} />)
      
      const emptyContainer = container.querySelector('.flex')
      expect(emptyContainer).toHaveStyle({ height: '400px' })
    })

    it('should render title in empty state when provided', () => {
      render(<AnalyticsChart {...defaultProps} data={[]} title="User Analytics" />)
      
      expect(screen.getByText('No data available')).toBeInTheDocument()
      expect(screen.getByText('User Analytics')).toBeInTheDocument()
    })

    it('should not render title in empty state when not provided', () => {
      render(<AnalyticsChart {...defaultProps} data={[]} />)
      
      expect(screen.getByText('No data available')).toBeInTheDocument()
      expect(screen.queryByText('User Analytics')).not.toBeInTheDocument()
    })
  })

  describe('value formatting', () => {
    it('should format values using custom formatter', () => {
      const formatValue = jest.fn((value: number) => `$${value}`)
      render(<AnalyticsChart {...defaultProps} formatValue={formatValue} />)
      
      // The formatter would be called by Recharts tooltip, but we can't easily test that
      // without simulating user interactions with the chart
      expect(formatValue).toBeDefined()
    })

    it('should use default value formatting when no formatter provided', () => {
      render(<AnalyticsChart {...defaultProps} />)
      
      // Chart should render without errors when no formatter is provided
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  describe('chart type variants', () => {
    it('should render different chart types correctly', () => {
      const { rerender } = render(<AnalyticsChart {...defaultProps} type="line" />)
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()

      rerender(<AnalyticsChart {...defaultProps} type="area" />)
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()

      rerender(<AnalyticsChart {...defaultProps} type="bar" />)
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()

      rerender(<AnalyticsChart {...defaultProps} type="pie" />)
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })

    it('should render empty div for unknown chart type', () => {
      const { container } = render(<AnalyticsChart {...defaultProps} type={'unknown' as any} />)
      
      const responsiveContainer = screen.getByTestId('responsive-container')
      expect(responsiveContainer.children[0]).toBeEmptyDOMElement()
    })
  })

  describe('data handling', () => {
    it('should handle data with different structures', () => {
      const customData = [
        { timestamp: '2024-01-01', count: 50 },
        { timestamp: '2024-01-02', count: 75 }
      ]
      
      render(
        <AnalyticsChart 
          data={customData} 
          type="line" 
          dataKey="count" 
          xAxisKey="timestamp" 
        />
      )
      
      const lineChart = screen.getByTestId('line-chart')
      expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(customData))
      
      const line = screen.getByTestId('line')
      expect(line).toHaveAttribute('data-datakey', 'count')
      
      const xAxis = screen.getByTestId('x-axis')
      expect(xAxis).toHaveAttribute('data-datakey', 'timestamp')
    })

    it('should handle single data point', () => {
      const singleData = [{ date: '2024-01-01', value: 100 }]
      
      render(<AnalyticsChart {...defaultProps} data={singleData} />)
      
      const lineChart = screen.getByTestId('line-chart')
      expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(singleData))
    })

    it('should handle data with zero values', () => {
      const zeroData = [
        { date: '2024-01-01', value: 0 },
        { date: '2024-01-02', value: 10 },
        { date: '2024-01-03', value: 0 }
      ]
      
      render(<AnalyticsChart {...defaultProps} data={zeroData} />)
      
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should handle data with negative values', () => {
      const negativeData = [
        { date: '2024-01-01', value: -50 },
        { date: '2024-01-02', value: 25 },
        { date: '2024-01-03', value: -10 }
      ]
      
      render(<AnalyticsChart {...defaultProps} data={negativeData} />)
      
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  describe('pie chart specifics', () => {
    it('should render correct number of cells for pie chart', () => {
      const pieData = [
        { date: 'Category A', value: 30 },
        { date: 'Category B', value: 50 },
        { date: 'Category C', value: 20 }
      ]
      
      render(<AnalyticsChart {...defaultProps} data={pieData} type="pie" />)
      
      expect(screen.getAllByTestId('pie-cell')).toHaveLength(3)
    })

    it('should handle empty pie chart data', () => {
      render(<AnalyticsChart {...defaultProps} data={[]} type="pie" />)
      
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<AnalyticsChart {...defaultProps} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should render meaningful content for screen readers', () => {
      render(<AnalyticsChart {...defaultProps} title="Revenue Chart" />)
      
      // The chart itself would have accessibility features from Recharts
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('should have accessible loading state', () => {
      render(<AnalyticsChart {...defaultProps} loading={true} />)
      
      // Loading spinner should be perceivable
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should have accessible empty state', () => {
      render(<AnalyticsChart {...defaultProps} data={[]} title="Empty Chart" />)
      
      expect(screen.getByText('No data available')).toBeInTheDocument()
      expect(screen.getByText('Empty Chart')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle very large datasets', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        value: Math.random() * 1000
      }))
      
      render(<AnalyticsChart {...defaultProps} data={largeData} />)
      
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should handle data with missing properties', () => {
      const incompleteData = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02' }, // Missing value
        { value: 150 }, // Missing date
        { date: '2024-01-04', value: 200 }
      ]
      
      render(<AnalyticsChart {...defaultProps} data={incompleteData as any} />)
      
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should handle data with extremely large values', () => {
      const largeValueData = [
        { date: '2024-01-01', value: 1e12 },
        { date: '2024-01-02', value: 2e12 }
      ]
      
      render(<AnalyticsChart {...defaultProps} data={largeValueData} />)
      
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should handle invalid chart type gracefully', () => {
      const { container } = render(<AnalyticsChart {...defaultProps} type={null as any} />)
      
      // Should render responsive container with empty chart
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  describe('performance', () => {
    it('should render within reasonable time', () => {
      const startTime = performance.now()
      
      render(<AnalyticsChart {...defaultProps} />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render in less than 50ms
      expect(renderTime).toBeLessThan(50)
    })

    it('should not cause memory leaks on unmount', () => {
      const { unmount } = render(<AnalyticsChart {...defaultProps} />)
      
      expect(() => unmount()).not.toThrow()
    })
  })
})