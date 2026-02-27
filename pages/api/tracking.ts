import { NextApiRequest, NextApiResponse } from 'next';
import { JSDOM } from 'jsdom';

interface TrackingResponse {
    trackingNumber: string;
    status: string;
    location: string;
    carrier: string;
    estimatedDelivery: string;
    events: Array<{
        date: string;
        description: string;
        location: string;
    }>;
    lastUpdate: string;
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<TrackingResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            trackingNumber: '',
            status: '',
            location: '',
            carrier: '',
            estimatedDelivery: '',
            events: [],
            lastUpdate: '',
            error: 'Method not allowed',
        });
    }

    const { trackingNumber } = req.body;

    if (!trackingNumber || typeof trackingNumber !== 'string' || !trackingNumber.trim()) {
        return res.status(400).json({
            trackingNumber: '',
            status: '',
            location: '',
            carrier: '',
            estimatedDelivery: '',
            events: [],
            lastUpdate: '',
            error: 'Tracking number is required',
        });
    }

    try {
        const tracking = await scrapeTracking(trackingNumber.trim().toUpperCase());
        return res.status(200).json(tracking);
    } catch (error) {
        console.error('[Tracking Error]', error);
        return res.status(500).json({
            trackingNumber: trackingNumber.trim(),
            status: '',
            location: '',
            carrier: '',
            estimatedDelivery: '',
            events: [],
            lastUpdate: '',
            error: 'Failed to fetch tracking information. Please check the tracking number.',
        });
    }
}

async function scrapeTracking(trackingNumber: string): Promise<TrackingResponse> {
    const url = `https://parcelsapp.com/fr/tracking/${trackingNumber}`;

    const response = await fetch(url, {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Parcelsapp not reachable`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const status = extractText(doc, [
        'h2',
        '[class*="status"]',
        'strong',
        '[class*="parcel-status"]',
    ]);

    const location = extractText(doc, [
        '[class*="location"]',
        '[class*="city"]',
        '[class*="current-location"]',
    ]);

    const carrier = extractText(doc, [
        '[class*="carrier"]',
        '[alt*="logo"]',
        'img[alt]',
        '[class*="shipping"]',
    ]);

    const edd = extractText(doc, [
        '[class*="delivery"]',
        '[class*="arrive"]',
        '[class*="edd"]',
    ]);

    const events = extractEvents(doc);

    return {
        trackingNumber,
        status: status || 'Statut indisponible',
        location: location || 'Localisation inconnue',
        carrier: carrier || 'Transporteur inconnu',
        estimatedDelivery: edd || 'Date non disponible',
        events: events,
        lastUpdate: new Date().toISOString(),
    };
}

function extractText(doc: Document, selectors: string[]): string {
    for (const selector of selectors) {
        try {
            const elements = doc.querySelectorAll(selector);

            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                const text = element.textContent?.trim();

                if (text && text.length > 0 && text.length < 200) {
                    return text;
                }
            }
        } catch (e) {
            continue;
        }
    }

    return '';
}

function extractEvents(doc: Document) {
    const events: Array<{
        date: string;
        description: string;
        location: string;
    }> = [];

    const eventSelectors = [
        'ul > li',
        'table tbody tr',
        '[class*="event"]',
        '[class*="timeline"] > div',
        'ol > li',
        '.events li',
    ];

    let eventElements: Element[] = [];

    for (const selector of eventSelectors) {
        try {
            const elements = Array.from(doc.querySelectorAll(selector));
            if (elements.length > 0) {
                eventElements = elements;
                break;
            }
        } catch (e) {
            continue;
        }
    }

    for (let idx = 0; idx < Math.min(10, eventElements.length); idx++) {
        const element = eventElements[idx];

        try {
            const dateText = (() => {
                const dateSelectors = [
                    '[class*="date"]',
                    'td:nth-child(1)',
                    '.date',
                    'span:first-child',
                ];

                for (const sel of dateSelectors) {
                    try {
                        const text = element.querySelector(sel)?.textContent?.trim();
                        if (text) return text;
                    } catch {}
                }
                return '';
            })();

            const description = (() => {
                const descSelectors = [
                    '[class*="desc"]',
                    'td:nth-child(2)',
                    '.description',
                    'span:nth-child(2)',
                ];

                for (const sel of descSelectors) {
                    try {
                        const text = element.querySelector(sel)?.textContent?.trim();
                        if (text) return text;
                    } catch {}
                }

                const text = element.textContent?.trim() || '';
                return text.substring(0, 150);
            })();

            const locationText = (() => {
                const locSelectors = [
                    '[class*="location"]',
                    'td:nth-child(3)',
                    '.location',
                ];

                for (const sel of locSelectors) {
                    try {
                        const text = element.querySelector(sel)?.textContent?.trim();
                        if (text) return text;
                    } catch {}
                }
                return '';
            })();

            if (description && description.length > 0) {
                events.push({
                    date: dateText || 'Date inconnue',
                    description: description.substring(0, 150),
                    location: locationText || '',
                });
            }
        } catch (e) {
            continue;
        }
    }

    return events;
}
