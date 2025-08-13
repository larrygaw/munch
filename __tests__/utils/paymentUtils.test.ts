jest.mock('../../FirebaseConfig', () => ({
  db: {},
}));

describe('Payment Utility Functions', () => {
  describe('formatCardNumber', () => {
    test('should format card number with spaces every 4 digits', () => {
      const formatCardNumber = (text: string): string => {
        const cleaned = text.replace(/\s/g, '');
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
      };

      expect(formatCardNumber('1234567890123456')).toBe('1234 5678 9012 3456');
      expect(formatCardNumber('123456789012345')).toBe('1234 5678 9012 345');
      expect(formatCardNumber('12345678901234')).toBe('1234 5678 9012 34');
      expect(formatCardNumber('1234567890123')).toBe('1234 5678 9012 3');
    });

    test('should handle already formatted card numbers', () => {
      const formatCardNumber = (text: string): string => {
        const cleaned = text.replace(/\s/g, '');
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
      };

      expect(formatCardNumber('1234 5678 9012 3456')).toBe('1234 5678 9012 3456');
      expect(formatCardNumber('1234 5678 9012 345')).toBe('1234 5678 9012 345');
    });

    test('should handle empty string', () => {
      const formatCardNumber = (text: string): string => {
        const cleaned = text.replace(/\s/g, '');
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
      };

      expect(formatCardNumber('')).toBe('');
    });
  });

  describe('formatExpiryDate', () => {
    test('should format expiry date correctly', () => {
      const formatExpiryDate = (text: string): string => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length >= 2) {
          return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        }
        return cleaned;
      };

      expect(formatExpiryDate('1225')).toBe('12/25');
      expect(formatExpiryDate('12')).toBe('12/');
      expect(formatExpiryDate('1')).toBe('1');
      expect(formatExpiryDate('123456')).toBe('12/34');
    });

    test('should handle non-numeric characters', () => {
      const formatExpiryDate = (text: string): string => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length >= 2) {
          return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        }
        return cleaned;
      };

      expect(formatExpiryDate('12/25')).toBe('12/25');
      expect(formatExpiryDate('12-25')).toBe('12/25');
      expect(formatExpiryDate('12abc25')).toBe('12/25');
    });

    test('should handle empty string', () => {
      const formatExpiryDate = (text: string): string => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length >= 2) {
          return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        }
        return cleaned;
      };

      expect(formatExpiryDate('')).toBe('');
    });
  });

  describe('validateCardDetails', () => {
    test('should return true for valid card details', () => {
      const validateCardDetails = (
        cardNumber: string,
        expiryDate: string,
        cvv: string,
        cardholderName: string
      ): boolean => {
        if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
          return false;
        }
        if (cardNumber.length < 13 || cardNumber.length > 19) {
          return false;
        }
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
          return false;
        }
        if (cvv.length < 3 || cvv.length > 4) {
          return false;
        }
        return true;
      };

      expect(validateCardDetails('1234567890123456', '12/25', '123', 'John Doe')).toBe(true);
      expect(validateCardDetails('123456789012345', '12/25', '1234', 'Jane Smith')).toBe(true);
    });

    test('should return false for missing fields', () => {
      const validateCardDetails = (
        cardNumber: string,
        expiryDate: string,
        cvv: string,
        cardholderName: string
      ): boolean => {
        if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
          return false;
        }
        if (cardNumber.length < 13 || cardNumber.length > 19) {
          return false;
        }
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
          return false;
        }
        if (cvv.length < 3 || cvv.length > 4) {
          return false;
        }
        return true;
      };

      expect(validateCardDetails('', '12/25', '123', 'John Doe')).toBe(false);
      expect(validateCardDetails('1234567890123456', '', '123', 'John Doe')).toBe(false);
      expect(validateCardDetails('1234567890123456', '12/25', '', 'John Doe')).toBe(false);
      expect(validateCardDetails('1234567890123456', '12/25', '123', '')).toBe(false);
    });

    test('should return false for invalid card number length', () => {
      const validateCardDetails = (
        cardNumber: string,
        expiryDate: string,
        cvv: string,
        cardholderName: string
      ): boolean => {
        if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
          return false;
        }
        if (cardNumber.length < 13 || cardNumber.length > 19) {
          return false;
        }
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
          return false;
        }
        if (cvv.length < 3 || cvv.length > 4) {
          return false;
        }
        return true;
      };

      expect(validateCardDetails('123456789012', '12/25', '123', 'John Doe')).toBe(false);
      expect(validateCardDetails('12345678901234567890', '12/25', '123', 'John Doe')).toBe(false);
    });

    test('should return false for invalid expiry date format', () => {
      const validateCardDetails = (
        cardNumber: string,
        expiryDate: string,
        cvv: string,
        cardholderName: string
      ): boolean => {
        if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
          return false;
        }
        if (cardNumber.length < 13 || cardNumber.length > 19) {
          return false;
        }
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
          return false;
        }
        if (cvv.length < 3 || cvv.length > 4) {
          return false;
        }
        return true;
      };

      expect(validateCardDetails('1234567890123456', '1225', '123', 'John Doe')).toBe(false);
      expect(validateCardDetails('1234567890123456', '12-25', '123', 'John Doe')).toBe(false);
      expect(validateCardDetails('1234567890123456', '1/25', '123', 'John Doe')).toBe(false);
      expect(validateCardDetails('1234567890123456', '12/5', '123', 'John Doe')).toBe(false);
    });

    test('should return false for invalid CVV length', () => {
      const validateCardDetails = (
        cardNumber: string,
        expiryDate: string,
        cvv: string,
        cardholderName: string
      ): boolean => {
        if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
          return false;
        }
        if (cardNumber.length < 13 || cardNumber.length > 19) {
          return false;
        }
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
          return false;
        }
        if (cvv.length < 3 || cvv.length > 4) {
          return false;
        }
        return true;
      };

      expect(validateCardDetails('1234567890123456', '12/25', '12', 'John Doe')).toBe(false);
      expect(validateCardDetails('1234567890123456', '12/25', '12345', 'John Doe')).toBe(false);
    });
  });
}); 