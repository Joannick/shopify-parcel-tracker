import Head from 'next/head';
import { TrackingWidget } from '@/components/TrackingWidget';

export default function Home() {
    return (
        <>
            <Head>
                <title>Shopify Parcel Tracker - Suivi de colis</title>
                <meta name="description" content="Track your parcels with Shopify Parcel Tracker" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <TrackingWidget />
            </main>
        </>
    );
}
