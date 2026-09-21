import { C } from '$/constants';
import { describe, expect, it } from 'vitest';
import { getContactSalesUrl, MCBaseURL } from './util';

describe('getContactSalesUrl', () => {
  it('builds the mermaid.ai contact-sales URL with campaign params', () => {
    const url = new URL(getContactSalesUrl());

    expect(url.origin + url.pathname).toBe(`${MCBaseURL}/contact-us`);
    expect(url.searchParams.get('contactSubject')).toBe('contactSales');
    expect(url.searchParams.get('utm_source')).toBe(C.utmSource);
    expect(url.searchParams.get('utm_medium')).toBe('button');
    expect(url.searchParams.get('utm_campaign')).toBe('contact_sales');
  });
});
