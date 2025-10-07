import { describe, expect, it } from 'vitest';
import { decodeBase64Url, encodeBase64Url } from '@/lib/url';

const loremIpsum =
    '杰勒艾伊开 艾艾娜屁开 迪勒杰勒艾 娜艾哦 诶开伊哦 西勒艾娜伊西哦伊哦屁艾 诶迪艾艾艾娜西艾艾弗 伊杰艾哦 马屁艾娜马屁伊 艾诶屁西艾比屁娜 伊艾 娜诶艾艾伊艾 吉艾哦诶伊 艾伊杰杰伊艾哦伊娜马屁伊 娜伊开 艾杰诶西伊艾诶哦 艾艾 艾迪 西屁艾娜屁娜 开艾.';

describe('Base64URL codec', () => {
    it('supports simple strings', () => {
        const enc = encodeBase64Url('foo bar 123');
        expect(enc).not.toContain('+');
        expect(enc).not.toContain('/');
        expect(enc).not.toContain('=');
        expect(decodeBase64Url(enc)).toBe('foo bar 123');
    });

    it('supports unicode', () => {
        const enc = encodeBase64Url(loremIpsum);
        expect(enc).not.toContain('+');
        expect(enc).not.toContain('/');
        expect(enc).not.toContain('=');
        expect(decodeBase64Url(enc)).toBe(loremIpsum);
    });

    it('supports emojis', () => {
        const enc = encodeBase64Url('🚀🌍🚢');
        expect(enc).not.toContain('+');
        expect(enc).not.toContain('/');
        expect(enc).not.toContain('=');
        expect(decodeBase64Url(enc)).toBe('🚀🌍🚢');
    });

    it('throws on malformed Base64URL payload', () => {
        expect(() => decodeBase64Url('abc')).toThrow();
    });

    it('throws on invalid UTF-8 sequences', () => {
        // Create an invalid base64url that would decode to invalid UTF-8
        expect(() => decodeBase64Url('gA')).toThrow();
    });
});
