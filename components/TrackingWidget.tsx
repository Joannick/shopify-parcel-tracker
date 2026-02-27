'use client';

import { useState } from 'react';
import styles from './TrackingWidget.module.css';

interface TrackingData {
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

interface TrackingWidgetProps {
    onTrackingFound?: (data: TrackingData) => void;
}

export function TrackingWidget({ onTrackingFound }: TrackingWidgetProps) {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [data, setData] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmed = trackingNumber.trim();
        if (!trimmed) {
            setError('Veuillez entrer un numéro de suivi');
            return;
        }

        setLoading(true);
        setError('');
        setData(null);

        try {
            const response = await fetch('/api/tracking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackingNumber: trimmed,
                }),
            });

            const result: TrackingData = await response.json();

            if (!response.ok || result.error) {
                setError(result.error || 'Erreur lors de la recherche');
                return;
            }

            setData(result);
            onTrackingFound?.(result);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Erreur lors de la récupération du suivi'
            );
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string): string => {
        const lower = status.toLowerCase();

        if (lower.includes('livré') || lower.includes('delivered')) {
            return styles.statusDelivered;
        }
        if (
            lower.includes('livraison') ||
            lower.includes('transit') ||
            lower.includes('en cours')
        ) {
            return styles.statusInTransit;
        }
        if (lower.includes('exception') || lower.includes('problème') || lower.includes('failed')) {
            return styles.statusException;
        }

        return styles.statusUnknown;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>📦 Suivi de colis</h1>
                <p className={styles.subtitle}>Suivez votre colis en temps réel</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className={styles.searchForm}>
                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        placeholder="Numéro de suivi (ex: 1Z999AA10123456784)"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className={styles.input}
                        disabled={loading}
                        autoComplete="off"
                    />
                    <button type="submit" disabled={loading} className={styles.button}>
                        {loading ? (
                            <>
                                <span className={styles.spinner}>⏳</span> Recherche...
                            </>
                        ) : (
                            <>
                                <span>🔍</span> Chercher
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Error Message */}
            {error && (
                <div className={styles.errorBox}>
                    <span className={styles.errorIcon}>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Results */}
            {data && !data.error && (
                <div className={styles.results}>
                    {/* Header Section */}
                    <div className={styles.resultHeader}>
                        <div className={styles.trackingInfo}>
                            <span className={styles.label}>Numéro de suivi</span>
                            <code className={styles.trackingCode}>{data.trackingNumber}</code>
                        </div>
                        <div className={`${styles.statusBadge} ${getStatusColor(data.status)}`}>
                            {data.status}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailCard}>
                            <span className={styles.detailIcon}>🚚</span>
                            <div className={styles.detailContent}>
                                <span className={styles.detailLabel}>Transporteur</span>
                                <span className={styles.detailValue}>{data.carrier}</span>
                            </div>
                        </div>

                        <div className={styles.detailCard}>
                            <span className={styles.detailIcon}>📍</span>
                            <div className={styles.detailContent}>
                                <span className={styles.detailLabel}>Localisation</span>
                                <span className={styles.detailValue}>{data.location}</span>
                            </div>
                        </div>

                        <div className={styles.detailCard}>
                            <span className={styles.detailIcon}>📅</span>
                            <div className={styles.detailContent}>
                                <span className={styles.detailLabel}>Livraison estimée</span>
                                <span className={styles.detailValue}>{data.estimatedDelivery}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    {data.events && data.events.length > 0 && (
                        <div className={styles.timeline}>
                            <h3 className={styles.timelineTitle}>Historique du suivi</h3>

                            <div className={styles.eventsList}>
                                {data.events.map((event, idx) => (
                                    <div key={idx} className={styles.event}>
                                        <div className={styles.eventDot}></div>

                                        <div className={styles.eventContent}>
                                            <div className={styles.eventDate}>{event.date}</div>
                                            <div className={styles.eventDescription}>
                                                {event.description}
                                            </div>
                                            {event.location && (
                                                <div className={styles.eventLocation}>
                                                    📍 {event.location}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className={styles.resultFooter}>
                        <small className={styles.lastUpdate}>
                            Mis à jour: {new Date(data.lastUpdate).toLocaleString('fr-FR')}
                        </small>
                    </div>
                </div>
            )}
        </div>
    );
}
