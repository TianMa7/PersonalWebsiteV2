import qquoteLogo from '../assets/qquote.svg';
import tkmsLogo from '../assets/tkms.svg';
import novaLogo from '../assets/nova.svg';
import hexaLogo from '../assets/hexa.svg';

/** Stat axes rendered by the radar chart. */
export const RADAR_LABELS = [
    'Coding',
    'Design',
    'Leadership',
    'Communication',
    'Analysis',
    'Impact',
] as const;

export interface Job {
    /** Stable identifier used to match a legend block with a dataset. */
    id: string;
    company: string;
    location: string;
    title: string;
    /** Local logo asset (imported SVG). */
    logo: string;
    /** Base theme colour for the radar dataset. */
    color: string;
    /** One value per axis in RADAR_LABELS (scale 0–10). */
    values: number[];
}

/**
 * Placeholder companies used to demonstrate the radar legend.
 * QQuote and TKMS are the original datasets; the rest are invented
 * so the 4–6 block legend is exercised.
 */
export const jobs: Job[] = [
    {
        id: 'qquote',
        company: 'QQuote',
        location: 'Toronto, Canada',
        title: 'Software Engineer',
        logo: qquoteLogo,
        color: '#e16384',
        values: [7, 5, 6, 4, 8, 6],
    },
    {
        id: 'tkms',
        company: 'TKMS',
        location: 'Kiel, Germany',
        title: 'Embedded Developer',
        logo: tkmsLogo,
        color: '#4f8ef7',
        values: [5, 8, 7, 6, 5, 7],
    },
    {
        id: 'nova',
        company: 'Nova Labs',
        location: 'Berlin, Germany',
        title: 'Full-Stack Engineer',
        logo: novaLogo,
        color: '#3ecf8e',
        values: [9, 6, 5, 7, 8, 6],
    },
    {
        id: 'hexa',
        company: 'Hexa Games',
        location: 'Montreal, Canada',
        title: 'Gameplay Developer',
        logo: hexaLogo,
        color: '#f7a94f',
        values: [8, 9, 6, 5, 7, 8],
    },
];
