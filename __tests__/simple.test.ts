describe('Simple Math Test', () => {
  test('should add two numbers correctly', () => {
    const add = (a: number, b: number) => a + b;
    expect(add(2, 3)).toBe(5);
  });

  test('should multiply two numbers correctly', () => {
    const multiply = (a: number, b: number) => a * b;
    expect(multiply(4, 5)).toBe(20);
  });

  test('should validate string length', () => {
    const validateLength = (str: string, minLength: number) => str.length >= minLength;
    expect(validateLength('hello', 3)).toBe(true);
    expect(validateLength('hi', 5)).toBe(false);
  });
}); 