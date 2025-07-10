import axios from 'axios'

export class MailinatorAPI {
  private readonly baseURL = 'https://api.mailinator.com/v2'
  private readonly token: string

  constructor() {
    this.token = process.env.MAILINATOR_API_TOKEN || ''
    if (!this.token) {
      console.warn('MAILINATOR_API_TOKEN not set. Some E2E tests may fail.')
    }
  }

  /**
   * Wait for an email to arrive in the specified inbox
   * @param inbox - The inbox name (part before @mailinator.com)
   * @param subject - Expected email subject (partial match)
   * @param timeoutMs - Max wait time in milliseconds
   * @returns Promise<string> - Email content as HTML
   */
  async waitForEmail(inbox: string, subject: string, timeoutMs: number = 30000): Promise<string> {
    const startTime = Date.now()
    const pollInterval = 2000 // Check every 2 seconds

    while (Date.now() - startTime < timeoutMs) {
      try {
        const messages = await this.getMessages(inbox)
        
        for (const message of messages) {
          if (message.subject && message.subject.includes(subject)) {
            const content = await this.getMessageContent(inbox, message.id)
            return content
          }
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      } catch (error) {
        console.error('Error polling for email:', error)
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }
    }

    throw new Error(`Timeout waiting for email with subject "${subject}" in inbox "${inbox}"`)
  }

  /**
   * Get all messages in an inbox
   * @param inbox - The inbox name
   * @returns Promise<Message[]> - Array of messages
   */
  async getMessages(inbox: string): Promise<Message[]> {
    if (!this.token) {
      // Fallback for tests without API token
      return this.getMockMessages(inbox)
    }

    try {
      const response = await axios.get(`${this.baseURL}/domains/mailinator.com/inboxes/${inbox}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })

      return response.data.msgs || []
    } catch (error) {
      console.error('Error fetching messages:', error)
      return []
    }
  }

  /**
   * Get the content of a specific message
   * @param inbox - The inbox name
   * @param messageId - The message ID
   * @returns Promise<string> - Message content as HTML
   */
  async getMessageContent(inbox: string, messageId: string): Promise<string> {
    if (!this.token) {
      // Fallback for tests without API token
      return this.getMockMessageContent(inbox, messageId)
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/domains/mailinator.com/inboxes/${inbox}/messages/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        }
      )

      return response.data.parts?.[0]?.body || ''
    } catch (error) {
      console.error('Error fetching message content:', error)
      return ''
    }
  }

  /**
   * Delete all messages in an inbox
   * @param inbox - The inbox name
   */
  async deleteInbox(inbox: string): Promise<void> {
    if (!this.token) {
      console.log(`Mock: Would delete inbox ${inbox}`)
      return
    }

    try {
      await axios.delete(`${this.baseURL}/domains/mailinator.com/inboxes/${inbox}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })
    } catch (error) {
      console.error('Error deleting inbox:', error)
    }
  }

  /**
   * Mock messages for testing without API token
   */
  private getMockMessages(inbox: string): Message[] {
    // Return mock verification email for test users
    if (inbox.includes('next-saas-e2e-')) {
      return [
        {
          id: 'mock-message-id',
          subject: 'Verify your email address',
          from: 'noreply@nextsaas.com',
          time: Date.now(),
          to: `${inbox}@mailinator.com`
        }
      ]
    }
    return []
  }

  /**
   * Mock message content for testing without API token
   */
  private getMockMessageContent(inbox: string, messageId: string): string {
    return `
      <html>
        <body>
          <h2>Verify your email address</h2>
          <p>Click the link below to verify your email:</p>
          <a href="http://localhost:3000/auth/verify-email?token=mock-verification-token">
            Verify Email
          </a>
        </body>
      </html>
    `
  }
}

export interface Message {
  id: string
  subject: string
  from: string
  time: number
  to: string
}

export default MailinatorAPI