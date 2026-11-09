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

// import lumenEditor from '../assets/experience/lumen-editor.png';

export const PROJECTS: ProjectEntry[] = [
    {
        id: 'lumen',
        startTerm: 'F25',
        endTerm: 'S26',
        name: 'Lumen',
        location: 'Waterloo, ON',
        focus: 'WebGL · real-time rendering',
        description:
            'A browser-based lighting sandbox for real-time scene studies. Drag light sources and materials, then watch the render update without a build step.',
        // images: [{ src: lumenEditor, alt: 'Lumen lighting editor' }],
        repoUrl: 'https://github.com/',
    },
    {
        id: 'tempo',
        startTerm: 'F26',
        name: 'Tempo',
        location: 'Toronto, ON',
        focus: 'FastAPI · Postgres · scheduling',
        description:
            'An API that turns shared calendars into focused practice blocks for a 40-person club. Ships with a small admin view for managing availability.',
    },
];

export const WORK: WorkEntry[] = [
    {
        id: 'acme-labs',
        startTerm: 'W26',
        endTerm: 'S26',
        position: 'Software Engineering Intern',
        company: 'Acme Labs',
        location: 'Toronto, ON',
        description:
            'Worked on the event ingestion pipeline and cut backfill time by 38%. Shipped a dashboard that lets on-call engineers replay failed jobs.',
    },
    {
        id: 'uw-research',
        startTerm: 'F26',
        position: 'Undergraduate Research Assistant',
        company: 'University of Waterloo',
        location: 'Waterloo, ON',
        description:
            'Exploring efficient attention kernels for edge devices. Built the benchmarking harness used for weekly model comparisons.',
    },
];
