/**
 * EXPERIENCE CONTENT
 *
 * This is the only file you need to edit to add, remove, or reorder projects
 * and work entries.
 *
 * - `startTerm` is where the branch splits from the school timeline.
 * - `endTerm` is where it merges back into the timeline. Omit `endTerm` while
 *   an entry is ongoing; its rail fades out at the current end of the graph.
 * - Both terms must be one of TERMS. `endTerm` must be later than `startTerm`.
 * - Cards are automatically centered on the midpoint of their branch.
 * - Keep at most one active project branch and one active work branch at a
 *   time. Branch intervals on the same side must not overlap.
 * - `id` must be unique; use letters, numbers, and dashes only.
 * - Descriptions are not truncated. Aim for one to three sentences.
 * - Images are optional. Import a file near the top of this file, then add:
 *       images: [{ src: projectScreenshot, alt: 'Screenshot description' }]
 * - `repoUrl` is optional and only appears on project cards.
 *
 * To extend the timeline, append the next term to TERMS and move CURRENT_TERM.
 * The current sample content is fictional placeholder copy; replace it with
 * your own.
 */

export const TERMS = ['F25', 'W26', 'S26', 'F26'] as const;
export type Term = (typeof TERMS)[number];
export const CURRENT_TERM: Term = 'F26';

export interface ExperienceImage {
    src: string;
    alt: string;
}

export interface ProjectEntry {
    id: string;
    startTerm: Term;
    endTerm?: Term;
    name: string;
    location: string;
    focus: string;
    description: string;
    images?: ExperienceImage[];
    repoUrl?: string;
}

export interface WorkEntry {
    id: string;
    startTerm: Term;
    endTerm?: Term;
    position: string;
    company: string;
    location: string;
    description: string;
    images?: ExperienceImage[];
}

import cardDealer from '../assets/cardDealer.png';
import groupPlane from '../assets/groupPlane.jpeg';

export const PROJECTS: ProjectEntry[] = [
    {
        id: 'card',
        startTerm: 'F25',
        endTerm: 'W26',
        name: 'Autonomous Card Dealer',
        location: 'Waterloo, ON',
        focus: 'Robotics · C++ · Path-Planning',
        description:
            'Faster than humans. Cooler than the competition. A VEX-based autonomous card dealer built for the biggest parties.',
        images: [{ src: cardDealer, alt: 'Card Dealer' }],
        repoUrl: 'https://github.com/TianMa7/CardDealingRobot',
    },
    {
        id: 'plane',
        startTerm: 'W26',
        endTerm: 'S26',
        name: 'RC Plane',
        location: 'Oakville, ON',
        focus: 'RTOS · Control Algorithms · Mech Design',
        description:
            'Questionable takeoff. Impeccable learning. A custom-built RC plane that proved engineering success is not always measured in altitude.',
        images: [{ src: groupPlane, alt: 'Team with Plane'}],
        repoUrl: 'https://github.com/TianMa7/RC_PLANE'
    },
];

export const WORK: WorkEntry[] = [
    {
        id: 'tkms',
        startTerm: 'W26',
        endTerm: 'S26',
        position: 'Mechanical Design',
        company: 'TK Modular',
        location: 'Oakville, ON',
        description:
            'Designed, drafted, and helped build biopharmaceutical process superskids to make the world a healthier place.',
    },
    {
        id: 'uwfe',
        startTerm: 'S26',
        endTerm: 'F26',
        position: 'Composite R&D',
        company: 'UW Formula Electic',
        location: 'Waterloo, ON',
        description:
            'Less weight. Less cost. More speed. Rethinking carbon-fibre airfoils through lightweight, coreless construction.'
    },
    {
        id: 'qquote',
        startTerm: 'F26',
        position: 'Product R&D',
        company: 'QQuote',
        location: 'Toronto, ON',
        description:
            'Catching what eyes can miss. Building a tire health scanner that detects hidden wear before it puts drivers at risk.',
    },
];
