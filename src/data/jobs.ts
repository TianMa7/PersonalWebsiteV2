import qquoteLogo from '../assets/qquote.png';
import tkmsLogo from '../assets/tkms.jpg';
import uwfeLogo from '../assets/uwfe.jpg';
import walleLogo from '../assets/wall-e.jpg';

/**
 * Stat axes rendered by the radar chart.
 *
 * Chart.js draws these labels inside the canvas, so they have to stay short
 * enough to fit beside the plot. Keep the full discipline names in
 * `RADAR_LABEL_TITLES` for the accessible description.
 */
export const RADAR_LABELS = [
    'Computer Vision',
    'Software',
    'Embedded',
    'Electrical',
    'Mechanical',
    'Prototyping',
] as const;

/** Full names for the shortened axis labels, used as accessible text. */
export const RADAR_LABEL_TITLES = [
    'Computer Vision',
    'Software Development',
    'Embedded Systems',
    'Electrical',
    'Mechanical Design',
    'Manufacturing & Prototyping',
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
        location: 'Toronto, Ontario',
        title: 'Product R&D',
        logo: qquoteLogo,
        color: '#f7a94f',
        values: [8, 4, 4, 3, 5, 8],
    },
    {
        id: 'tkms',
        company: 'TKMS',
        location: 'Oakville, Ontario',
        title: 'Mechanical Design',
        logo: tkmsLogo,
        color: '#4f8ef7',
        values: [0, 0, 0, 0, 9, 5],
    },
    {
        id: 'uwfe',
        company: 'UW Formula Electric',
        location: 'Waterloo, Ontario',
        title: 'Composite R&D',
        logo: uwfeLogo,
        color: '#3ecf8e',
        values: [0, 0, 0, 0, 8, 7],
    },
    {
        id: 'proj',
        company: 'Projects',
        location: 'Living Room, Sorry Dad',
        title: 'Make. Break. Learn.',
        logo: walleLogo,
        color: '#7c3aed',
        values: [3, 8, 8, 4, 8, 6],
    },
];
