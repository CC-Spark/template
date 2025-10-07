import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
    lookupCustomerByEmail,
    isRegisteredCustomer,
    getCurrentCustomer,
    customerLookup,
    extractNameFromEmail,
} from './customer';
// Removed unused commerceClient import
import { getAuth } from '@/middlewares/auth.client';
import createClient from '@/lib/scapi';
import type { ActionFunctionArgs } from 'react-router';

// Define proper types for the mock client
interface MockShopperCustomersClient {
    getCustomer: ReturnType<typeof vi.fn>;
}

interface MockCreateClientReturn {
    ShopperCustomers: MockShopperCustomersClient;
}

// Mock the dependencies
vi.mock('@/middlewares/auth.client');
vi.mock('@/lib/scapi');

const mockContext = {} as ActionFunctionArgs['context'];

describe('Customer API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('lookupCustomerByEmail', () => {
        test('should return invalid result for malformed email', async () => {
            const result = await lookupCustomerByEmail(mockContext, 'invalid-email');

            expect(result.isRegistered).toBe(false);
            expect(result.error).toBe('Invalid email format');
        });

        test('should return guest result for empty email', async () => {
            const result = await lookupCustomerByEmail(mockContext, '');

            expect(result.isRegistered).toBe(false);
            expect(result.error).toBe('Invalid email format');
        });

        test('should check current user email when logged in as registered user', async () => {
            const mockSession = {
                userType: 'registered',
                customer_id: 'cust123',
                access_token: 'token',
                access_token_expiry: Date.now() + 10000,
            };

            const mockCustomer = {
                login: 'test@example.com',
                customerId: 'cust123',
            };

            const mockClient = {
                getCustomer: vi.fn().mockResolvedValue(mockCustomer),
            };

            vi.mocked(getAuth).mockReturnValue(mockSession);
            vi.mocked(createClient).mockReturnValue({
                ShopperCustomers: mockClient,
            } as MockCreateClientReturn);

            const result = await lookupCustomerByEmail(mockContext, 'test@example.com');

            expect(result.isRegistered).toBe(true);
            expect(result.customer).toEqual(mockCustomer);
            expect(result.requiresLogin).toBe(false);
            expect(mockClient.getCustomer).toHaveBeenCalledWith({
                parameters: { customerId: 'cust123' },
            });
        });

        test('should handle case mismatch in email comparison', async () => {
            const mockSession = {
                userType: 'registered',
                customer_id: 'cust123',
            };

            const mockCustomer = {
                login: 'Test@Example.COM',
                customerId: 'cust123',
            };

            const mockClient = {
                getCustomer: vi.fn().mockResolvedValue(mockCustomer),
            };

            vi.mocked(getAuth).mockReturnValue(mockSession);
            vi.mocked(createClient).mockReturnValue({
                ShopperCustomers: mockClient,
            } as MockCreateClientReturn);

            const result = await lookupCustomerByEmail(mockContext, 'test@example.com');

            expect(result.isRegistered).toBe(true);
            expect(result.customer).toEqual(mockCustomer);
        });

        test('should return guest result when current user email does not match', async () => {
            const mockSession = {
                userType: 'registered',
                customer_id: 'cust123',
            };

            const mockCustomer = {
                login: 'different@example.com',
                customerId: 'cust123',
            };

            const mockClient = {
                getCustomer: vi.fn().mockResolvedValue(mockCustomer),
            };

            vi.mocked(getAuth).mockReturnValue(mockSession);
            vi.mocked(createClient).mockReturnValue({
                ShopperCustomers: mockClient,
            } as MockCreateClientReturn);

            const result = await lookupCustomerByEmail(mockContext, 'test@example.com');

            expect(result.isRegistered).toBe(false);
            expect(result.requiresLogin).toBe(false);
        });

        test('should handle API errors gracefully', async () => {
            const mockSession = {
                userType: 'registered',
                customer_id: 'cust123',
            };

            const mockClient = {
                getCustomer: vi.fn().mockRejectedValue(new Error('API Error')),
            };

            vi.mocked(getAuth).mockReturnValue(mockSession);
            vi.mocked(createClient).mockReturnValue({
                ShopperCustomers: mockClient,
            } as MockCreateClientReturn);

            const result = await lookupCustomerByEmail(mockContext, 'test@example.com');

            expect(result.isRegistered).toBe(false);
            expect(result.requiresLogin).toBe(false);
        });

        test('should return guest result for guest session', async () => {
            const mockSession = {
                userType: 'guest',
            };

            vi.mocked(getAuth).mockReturnValue(mockSession);

            const result = await lookupCustomerByEmail(mockContext, 'test@example.com');

            expect(result.isRegistered).toBe(false);
            expect(result.requiresLogin).toBe(false);
        });
    });

    describe('isRegisteredCustomer', () => {
        test('should return true for valid registered user session', () => {
            const mockSession = {
                userType: 'registered',
                customer_id: 'cust123',
                access_token: 'token',
                access_token_expiry: Date.now() + 10000,
            };

            vi.mocked(getAuth).mockReturnValue(mockSession);

            const result = isRegisteredCustomer(mockContext);
            expect(result).toBe(true);
        });

        test('should return false for guest user', () => {
            const mockSession = {
                userType: 'guest',
            };

            vi.mocked(getAuth).mockReturnValue(mockSession);

            const result = isRegisteredCustomer(mockContext);
            expect(result).toBe(false);
        });

        test('should return false for expired token', () => {
            const mockSession = {
                userType: 'registered',
                customer_id: 'cust123',
                access_token: 'token',
                access_token_expiry: Date.now() - 10000, // Expired
            };

            vi.mocked(getAuth).mockReturnValue(mockSession);

            const result = isRegisteredCustomer(mockContext);
            expect(result).toBe(false);
        });

        test('should return false for missing customer_id', () => {
            const mockSession = {
                userType: 'registered',
                access_token: 'token',
                access_token_expiry: Date.now() + 10000,
            };

            vi.mocked(getAuth).mockReturnValue(mockSession);

            const result = isRegisteredCustomer(mockContext);
            expect(result).toBe(false);
        });
    });

    describe('getCurrentCustomer', () => {
        test('should return customer for valid registered user', async () => {
            const mockSession = {
                userType: 'registered',
                customer_id: 'cust123',
                access_token: 'token',
                access_token_expiry: Date.now() + 10000,
            };

            const mockCustomer = {
                customerId: 'cust123',
                login: 'test@example.com',
            };

            const mockClient = {
                getCustomer: vi.fn().mockResolvedValue(mockCustomer),
            };

            vi.mocked(getAuth).mockReturnValue(mockSession);
            vi.mocked(createClient).mockReturnValue({
                ShopperCustomers: mockClient,
            } as MockCreateClientReturn);

            const result = await getCurrentCustomer(mockContext);

            expect(result).toEqual(mockCustomer);
            expect(mockClient.getCustomer).toHaveBeenCalledWith({
                parameters: { customerId: 'cust123' },
            });
        });

        test('should return null for guest user', async () => {
            const mockSession = {
                userType: 'guest',
            };

            vi.mocked(getAuth).mockReturnValue(mockSession);

            const result = await getCurrentCustomer(mockContext);
            expect(result).toBeNull();
        });

        test('should return null on API error', async () => {
            const mockSession = {
                userType: 'registered',
                customer_id: 'cust123',
                access_token: 'token',
                access_token_expiry: Date.now() + 10000,
            };

            const mockClient = {
                getCustomer: vi.fn().mockRejectedValue(new Error('API Error')),
            };

            vi.mocked(getAuth).mockReturnValue(mockSession);
            vi.mocked(createClient).mockReturnValue({
                ShopperCustomers: mockClient,
            } as MockCreateClientReturn);

            const result = await getCurrentCustomer(mockContext);
            expect(result).toBeNull();
        });
    });

    describe('customerLookup', () => {
        test('should return current_user recommendation for matching email', async () => {
            const mockSession = {
                userType: 'registered',
                customer_id: 'cust123',
            };

            const mockCustomer = {
                login: 'test@example.com',
                customerId: 'cust123',
            };

            const mockClient = {
                getCustomer: vi.fn().mockResolvedValue(mockCustomer),
            };

            vi.mocked(getAuth).mockReturnValue(mockSession);
            vi.mocked(createClient).mockReturnValue({
                ShopperCustomers: mockClient,
            } as MockCreateClientReturn);

            const result = await customerLookup(mockContext, 'test@example.com');

            expect(result.recommendation).toBe('current_user');
            expect(result.message).toBe('Using your account information');
            expect(result.isRegistered).toBe(true);
        });

        test('should return guest recommendation for unknown email', async () => {
            const mockSession = {
                userType: 'guest',
            };

            vi.mocked(getAuth).mockReturnValue(mockSession);

            const result = await customerLookup(mockContext, 'unknown@example.com');

            expect(result.recommendation).toBe('guest');
            expect(result.message).toBe('Continuing as guest. You can login later if you have an account.');
            expect(result.isRegistered).toBe(false);
        });

        test('should handle invalid email gracefully', async () => {
            const result = await customerLookup(mockContext, 'invalid-email');

            expect(result.recommendation).toBe('guest');
            expect(result.isRegistered).toBe(false);
        });
    });

    describe('extractNameFromEmail', () => {
        describe('basic separator patterns', () => {
            test('should extract names separated by dots', () => {
                const result = extractNameFromEmail('john.doe@example.com');
                expect(result).toEqual({ firstName: 'John', lastName: 'Doe' });
            });

            test('should extract names separated by underscores', () => {
                const result = extractNameFromEmail('jane_smith@company.org');
                expect(result).toEqual({ firstName: 'Jane', lastName: 'Smith' });
            });

            test('should extract names separated by hyphens', () => {
                const result = extractNameFromEmail('bob-wilson@startup.io');
                expect(result).toEqual({ firstName: 'Bob', lastName: 'Wilson' });
            });
        });

        describe('number suffix handling', () => {
            test('should remove number suffixes', () => {
                const result = extractNameFromEmail('alice.cooper123@email.com');
                expect(result).toEqual({ firstName: 'Alice', lastName: 'Cooper' });
            });

            test('should handle multiple digits', () => {
                const result = extractNameFromEmail('mike.jones99@domain.net');
                expect(result).toEqual({ firstName: 'Mike', lastName: 'Jones' });
            });

            test('should preserve numbers in the middle', () => {
                const result = extractNameFromEmail('user2.admin3@test.com');
                expect(result).toEqual({ firstName: 'User2', lastName: 'Admin' });
            });
        });

        describe('camelCase pattern recognition', () => {
            test('should detect camelCase and split properly', () => {
                const result = extractNameFromEmail('johnDoe@example.com');
                expect(result).toEqual({ firstName: 'John', lastName: 'Doe' });
            });

            test('should handle complex camelCase', () => {
                const result = extractNameFromEmail('maryJane@website.org');
                expect(result).toEqual({ firstName: 'Mary', lastName: 'Jane' });
            });

            test('should not split single uppercase letter', () => {
                const result = extractNameFromEmail('testA@domain.com');
                expect(result).toEqual({ firstName: 'Testa', lastName: 'User' });
            });
        });

        describe('capitalization normalization', () => {
            test('should capitalize all lowercase names', () => {
                const result = extractNameFromEmail('john.doe@company.com');
                expect(result).toEqual({ firstName: 'John', lastName: 'Doe' });
            });

            test('should normalize all uppercase names', () => {
                const result = extractNameFromEmail('JOHN.DOE@COMPANY.COM');
                expect(result).toEqual({ firstName: 'John', lastName: 'Doe' });
            });

            test('should normalize mixed case names', () => {
                const result = extractNameFromEmail('MixedCase.Username@domain.org');
                expect(result).toEqual({ firstName: 'Mixedcase', lastName: 'Username' });
            });
        });

        describe('single name fallbacks', () => {
            test('should use single name as firstName with User lastName', () => {
                const result = extractNameFromEmail('admin@company.com');
                expect(result).toEqual({ firstName: 'Admin', lastName: 'User' });
            });

            test('should handle single name with numbers', () => {
                const result = extractNameFromEmail('support123@help.org');
                expect(result).toEqual({ firstName: 'Support', lastName: 'User' });
            });

            test('should capitalize single names', () => {
                const result = extractNameFromEmail('manager@business.net');
                expect(result).toEqual({ firstName: 'Manager', lastName: 'User' });
            });
        });

        describe('edge cases and error handling', () => {
            test('should handle empty string', () => {
                const result = extractNameFromEmail('');
                expect(result).toEqual({ firstName: 'Guest', lastName: 'User' });
            });

            test('should handle null input', () => {
                // Test null input by casting to the expected string type
                const result = extractNameFromEmail(null as unknown as string);
                expect(result).toEqual({ firstName: 'Guest', lastName: 'User' });
            });

            test('should handle undefined input', () => {
                // Test undefined input by casting to the expected string type
                const result = extractNameFromEmail(undefined as unknown as string);
                expect(result).toEqual({ firstName: 'Guest', lastName: 'User' });
            });

            test('should handle non-string input', () => {
                // Test non-string input by casting to the expected string type
                const result = extractNameFromEmail(123 as unknown as string);
                expect(result).toEqual({ firstName: 'Guest', lastName: 'User' });
            });

            test('should handle malformed email (no @)', () => {
                const result = extractNameFromEmail('notanemail');
                expect(result).toEqual({ firstName: 'Notanemail', lastName: 'User' });
            });

            test('should handle email with no username', () => {
                const result = extractNameFromEmail('@domain.com');
                expect(result).toEqual({ firstName: 'Guest', lastName: 'User' });
            });

            test('should handle email ending with @', () => {
                const result = extractNameFromEmail('test@');
                expect(result).toEqual({ firstName: 'Test', lastName: 'User' });
            });
        });

        describe('multiple separators', () => {
            test('should prioritize dots over underscores', () => {
                const result = extractNameFromEmail('first.middle_last@domain.com');
                expect(result).toEqual({ firstName: 'First', lastName: 'Middle_last' });
            });

            test('should handle consecutive separators', () => {
                const result = extractNameFromEmail('test..multiple@domain.com');
                expect(result).toEqual({ firstName: 'Test', lastName: 'Multiple' });
            });

            test('should filter out empty parts', () => {
                const result = extractNameFromEmail('first._last@domain.com');
                expect(result).toEqual({ firstName: 'First', lastName: '_last' });
            });
        });

        describe('real-world email patterns', () => {
            test('should handle common corporate emails', () => {
                const result = extractNameFromEmail('john.smith@company.com');
                expect(result).toEqual({ firstName: 'John', lastName: 'Smith' });
            });

            test('should handle personal emails with numbers', () => {
                const result = extractNameFromEmail('sarah.connor85@email.com');
                expect(result).toEqual({ firstName: 'Sarah', lastName: 'Connor' });
            });

            test('should handle professional emails', () => {
                const result = extractNameFromEmail('dr.watson@medical.org');
                expect(result).toEqual({ firstName: 'Dr', lastName: 'Watson' });
            });

            test('should handle modern naming patterns', () => {
                const result = extractNameFromEmail('alex-morgan@startup.io');
                expect(result).toEqual({ firstName: 'Alex', lastName: 'Morgan' });
            });

            test('should handle international naming', () => {
                const result = extractNameFromEmail('marie-claire@company.fr');
                expect(result).toEqual({ firstName: 'Marie', lastName: 'Claire' });
            });
        });
    });
});
