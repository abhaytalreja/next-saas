import { NextRequest, NextResponse } from 'next/server'

// Mock invoices for testing
const mockInvoices = [
  {
    id: 'in_test_invoice_1',
    number: 'INV-001',
    amount_paid: 2900,
    amount_due: 0,
    currency: 'usd',
    status: 'paid',
    created: Date.now() - 7 * 24 * 60 * 60 * 1000,
    due_date: Date.now() - 7 * 24 * 60 * 60 * 1000,
    hosted_invoice_url: 'https://invoice.stripe.com/i/test',
    invoice_pdf: 'https://invoice.stripe.com/i/test/pdf'
  }
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const customerId = searchParams.get('customer_id')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID required' },
        { status: 400 }
      )
    }

    // Return mock invoices
    return NextResponse.json({
      invoices: mockInvoices.slice(0, limit)
    })
  } catch (error) {
    console.error('Invoice fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}