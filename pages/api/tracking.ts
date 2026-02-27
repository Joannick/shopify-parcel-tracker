import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer, { Browser } from 'puppeteer';

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

let browser: Browser | null = null;

async function getBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
            ],
        });
    }
    return browser;
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
    const browserInstance = await getBrowser();
    const page = await browserInstance.newPage();

    try {
        const url = `https://parcelsapp.com/fr/tracking/${trackingNumber}`;

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });

        // Wait for content to load
        await page.waitForTimeout(2000);

        const data = await page.evaluate(() => {
            // Extract status
            const statusElement =
                document.querySelector('[class*="status"]') ||
                document.querySelector('h2') ||
                document.querySelector('strong');
            const status = statusElement?.textContent?.trim() || '';

            // Extract location
            const locationElements = document.querySelectorAll('*');
            let location = '';
            for (const el of locationElements) {
                const text = el.textContent || '';
                if (text.includes('location') || text.includes('Location')) {
                    location = text;
                    break;
                }
            }

            // Extract carrier
            const carrierImg = document.querySelector('img[alt]');
            const carrier = carrierImg?.getAttribute('alt') || '';

            // Extract EDD (Estimated Delivery Date)
            const eddElements = document.querySelectorAll('*');
            let edd = '';
            for (const el of eddElements) {
                const text = el.textContent || '';
                if (
                    text.includes('Livraison') ||
                    text.includes('Delivery') ||
                    text.includes('Arrive')
                ) {
                    edd = text.substring(0, 100);
                    break;
                }
            }

            // Extract events/timeline
            const events: Array<{ date: string; description: string; location: string }> = [];
            const eventElements = document.querySelectorAll(
                'ul > li, table tbody tr, [class*="event"], ol > li'
            );

            eventElements.forEach((el, idx) => {
                if (idx >= 10) return; // Max 10 events

                const eventText = el.textContent?.trim() || '';
                if (eventText.length > 0) {
                    events.push({
                        date: new Date().toLocaleDateString('fr-FR'),
                        description: eventText.substring(0, 150),
                        location: '',
                    });
                }
            });

            return {
                status: status || 'Statut indisponible',
                location: location || 'Localisation inconnue',
                carrier: carrier || 'Transporteur inconnu',
                estimatedDelivery: edd || 'Date non disponible',
                events: events,
            };
        });

        return {
            trackingNumber,
            status: data.status,
            location: data.location,
            carrier: data.carrier,
            estimatedDelivery: data.estimatedDelivery,
            events: data.events,
            lastUpdate: new Date().toISOString(),
        };
    } finally {
        await page.close();
    }
}
