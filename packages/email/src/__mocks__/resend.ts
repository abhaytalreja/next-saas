/**
 * Mock implementation of Resend for testing
 */

export class Resend {
  public emails: {
    send: jest.MockedFunction<any>;
  };

  constructor(apiKey?: string) {
    this.emails = {
      send: jest.fn().mockResolvedValue({
        data: { id: 'mock-resend-message-id' },
        error: null,
      }),
    };
  }
}

export default Resend;