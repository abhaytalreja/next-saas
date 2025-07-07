import { DatePicker } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'

const BasicExample = () => {
  const [date, setDate] = useState<Date>()

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      placeholder="Select a date"
    />
  )
}

const DateTimeExample = () => {
  const [dateTime, setDateTime] = useState<Date>()

  return (
    <DatePicker
      value={dateTime}
      onChange={setDateTime}
      format="datetime"
      placeholder="Select date and time"
    />
  )
}

const TimeOnlyExample = () => {
  const [time, setTime] = useState<Date>()

  return (
    <DatePicker
      value={time}
      onChange={setTime}
      format="time"
      placeholder="Select time"
    />
  )
}

const WithConstraintsExample = () => {
  const [date, setDate] = useState<Date>()
  const today = new Date()
  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      minDate={today}
      maxDate={nextWeek}
      placeholder="Select date (next 7 days only)"
    />
  )
}

const DisabledDatesExample = () => {
  const [date, setDate] = useState<Date>()
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const dayAfter = new Date()
  dayAfter.setDate(today.getDate() + 2)

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      disabledDates={[tomorrow, dayAfter]}
      placeholder="Select date (some dates disabled)"
    />
  )
}

const examples = [
  {
    title: 'Basic Date Picker',
    code: `const [date, setDate] = useState<Date>()

<DatePicker
  value={date}
  onChange={setDate}
  placeholder="Select a date"
/>`,
    component: <BasicExample />,
  },
  {
    title: 'Date and Time Picker',
    code: `const [dateTime, setDateTime] = useState<Date>()

<DatePicker
  value={dateTime}
  onChange={setDateTime}
  format="datetime"
  placeholder="Select date and time"
/>`,
    component: <DateTimeExample />,
  },
  {
    title: 'Time Only Picker',
    code: `const [time, setTime] = useState<Date>()

<DatePicker
  value={time}
  onChange={setTime}
  format="time"
  placeholder="Select time"
/>`,
    component: <TimeOnlyExample />,
  },
  {
    title: 'With Date Constraints',
    code: `const [date, setDate] = useState<Date>()
const today = new Date()
const nextWeek = new Date()
nextWeek.setDate(today.getDate() + 7)

<DatePicker
  value={date}
  onChange={setDate}
  minDate={today}
  maxDate={nextWeek}
  placeholder="Select date (next 7 days only)"
/>`,
    component: <WithConstraintsExample />,
  },
  {
    title: 'With Disabled Dates',
    code: `const [date, setDate] = useState<Date>()
const disabledDates = [
  // Array of Date objects to disable
]

<DatePicker
  value={date}
  onChange={setDate}
  disabledDates={disabledDates}
  placeholder="Select date (some dates disabled)"
/>`,
    component: <DisabledDatesExample />,
  },
]

export default function DatePickerPage() {
  return (
    <ComponentLayout
      title="Date Picker"
      description="A flexible date and time picker component with calendar interface, constraints, and multiple format support."
      examples={examples}
    />
  )
}