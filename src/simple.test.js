// Simple test to check if Jest works
describe('Simple Test', () => {
  it('should pass basic math', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle strings', () => {
    expect('hello' + ' ' + 'world').toBe('hello world');
  });
});