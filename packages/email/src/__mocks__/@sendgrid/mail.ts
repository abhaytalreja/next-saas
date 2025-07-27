/**
 * Mock implementation of SendGrid Mail for testing
 */

export const setApiKey = jest.fn();

export const send = jest.fn().mockResolvedValue([{
  statusCode: 202,
  headers: {
    'x-message-id': 'mock-sendgrid-message-id',
  },
}]);

export default {
  setApiKey,
  send,
};