for (let i = 0; i < Math.min(10, eventElements.length); i++) {
    const element = eventElements[i];
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
        // Skip this event if parsing fails
        continue;
    }
}
