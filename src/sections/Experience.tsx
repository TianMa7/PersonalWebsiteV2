import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
    CURRENT_TERM,
    PROJECTS,
    TERMS,
    WORK,
} from '../data/experience.ts';
import type { ProjectEntry, Term, WorkEntry } from '../data/experience.ts';
import './Experience.css';

type Side = 'projects' | 'work';
type RailState = 'start' | 'through' | 'end';

interface Branch {
    entry: ProjectEntry | WorkEntry;
    side: Side;
    startIndex: number;
    endIndex: number;
    ongoing: boolean;
    slotIndex: number;
}

interface TermRow {
    key: string;
    term: Term;
    index: number;
    isFirst: boolean;
    isLast: boolean;
    isCurrent: boolean;
    projects: ProjectEntry[];
    work: WorkEntry[];
    projectBranch: Branch | null;
    workBranch: Branch | null;
    projectState: RailState | null;
    workState: RailState | null;
    hasEnd: boolean;
}

const LAST_TERM_INDEX = TERMS.length - 1;
const LAST_TERM = TERMS[LAST_TERM_INDEX];
const TERM_INDEX = new Map<Term, number>(
    TERMS.map((term, index) => [term, index]),
);

const SEASON_LABELS = {
    F: 'Fall',
    W: 'Winter',
    S: 'Spring',
} as const;

function termLongLabel(term: Term): string {
    const season = term.charAt(0) as keyof typeof SEASON_LABELS;
    return `${SEASON_LABELS[season]} 20${term.slice(1)}`;
}

function rangeLabel(entry: ProjectEntry | WorkEntry): string {
    return `${entry.startTerm} → ${entry.endTerm ?? 'now'}`;
}

function makeBranch(entry: ProjectEntry | WorkEntry, side: Side): Branch {
    const startIndex = TERM_INDEX.get(entry.startTerm) ?? 0;
    const endIndex = Math.max(
        startIndex,
        entry.endTerm
            ? (TERM_INDEX.get(entry.endTerm) ?? startIndex)
            : LAST_TERM_INDEX,
    );
    const ongoing = entry.endTerm === undefined;
    const span = endIndex - startIndex;
    // Cards live in a real term row; the measurement pass moves each entry to
    // the vertical midpoint of its branch, including half-row odd spans.
    const slotIndex = startIndex + Math.floor(span / 2);

    return { entry, side, startIndex, endIndex, ongoing, slotIndex };
}

const projectBranches = PROJECTS.map((entry) => makeBranch(entry, 'projects'));
const workBranches = WORK.map((entry) => makeBranch(entry, 'work'));
const allBranches = [...projectBranches, ...workBranches];

if (import.meta.env.DEV) {
    for (const branch of allBranches) {
        if (branch.entry.endTerm && branch.endIndex <= branch.startIndex) {
            console.warn(
                `[Experience] "${branch.entry.id}" has an endTerm that is not later than its startTerm.`,
            );
        }
    }

    const warnAboutOverlaps = (branches: Branch[], label: string) => {
        const sorted = [...branches].sort((a, b) => a.startIndex - b.startIndex);
        for (let index = 1; index < sorted.length; index += 1) {
            const previous = sorted[index - 1];
            const current = sorted[index];
            if (current.startIndex <= previous.endIndex) {
                console.warn(
                    `[Experience] ${label} branches "${previous.entry.id}" and "${current.entry.id}" overlap. Keep one active branch per side.`,
                );
            }
        }
    };

    warnAboutOverlaps(projectBranches, 'Project');
    warnAboutOverlaps(workBranches, 'Work');
}

function pushToMap<T>(map: Map<number, T[]>, key: number, value: T) {
    const current = map.get(key);
    if (current) {
        current.push(value);
    } else {
        map.set(key, [value]);
    }
}

const projectTermCards = new Map<number, ProjectEntry[]>();
const workTermCards = new Map<number, WorkEntry[]>();

for (const branch of projectBranches) {
    pushToMap(
        projectTermCards,
        branch.slotIndex,
        branch.entry as ProjectEntry,
    );
}

for (const branch of workBranches) {
    pushToMap(workTermCards, branch.slotIndex, branch.entry as WorkEntry);
}

function stateForTerm(branch: Branch, index: number): RailState {
    if (index === branch.startIndex) {
        return 'start';
    }
    if (!branch.ongoing && index === branch.endIndex) {
        return 'end';
    }
    return 'through';
}

const rows: TermRow[] = [];

for (let index = 0; index < TERMS.length; index += 1) {
    const term = TERMS[index];
    const projectBranch =
        projectBranches.find(
            (branch) => index >= branch.startIndex && index <= branch.endIndex,
        ) ?? null;
    const workBranch =
        workBranches.find(
            (branch) => index >= branch.startIndex && index <= branch.endIndex,
        ) ?? null;
    const projectState = projectBranch
        ? stateForTerm(projectBranch, index)
        : null;
    const workState = workBranch ? stateForTerm(workBranch, index) : null;

    rows.push({
        key: `term-${term}`,
        term,
        index,
        isFirst: index === 0,
        isLast: index === LAST_TERM_INDEX,
        isCurrent: term === CURRENT_TERM,
        projects: projectTermCards.get(index) ?? [],
        work: workTermCards.get(index) ?? [],
        projectBranch,
        workBranch,
        projectState,
        workState,
        hasEnd: projectState === 'end' || workState === 'end',
    });
}

const ARM_PATHS: Record<Side, Record<'start' | 'end', string>> = {
    projects: {
        start: 'M112 0 L15.588 55.663 Q0 64.663 0 82.663',
        end: 'M0 0 Q0 18 15.588 27 L112 82.663',
    },
    work: {
        start: 'M0 0 L96.412 55.663 Q112 64.663 112 82.663',
        end: 'M112 0 Q112 18 96.412 27 L0 82.663',
    },
};

function PinIcon() {
    return (
        <svg className="icon" viewBox="0 0 16 16" aria-hidden="true">
            <path
                d="M8 15s5-4.6 5-8A5 5 0 0 0 3 7c0 3.4 5 8 5 8Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
            />
            <circle cx="8" cy="7" r="1.7" fill="currentColor" />
        </svg>
    );
}

function GitHubIcon() {
    return (
        <svg className="icon" viewBox="0 0 16 16" aria-hidden="true">
            <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
            />
        </svg>
    );
}

function ArrowIcon() {
    return (
        <svg
            className="icon icon--arrow"
            viewBox="0 0 16 16"
            aria-hidden="true"
        >
            <path
                d="M5.5 10.5 10.5 5.5M6.5 5.5h4v4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function BranchArm({ side, type }: { side: Side; type: 'start' | 'end' }) {
    return (
        <svg
            className="rail__arm"
            viewBox="0 0 112 82.663"
            aria-hidden="true"
        >
            <path d={ARM_PATHS[side][type]} />
        </svg>
    );
}

function BranchRail({
    side,
    state,
    ongoing,
    shifted,
}: {
    side: Side;
    state: RailState;
    ongoing: boolean;
    shifted: boolean;
}) {
    const classes = [
        'rail',
        side === 'projects' ? 'rail--projects' : 'rail--work',
        `rail--${state}`,
    ];

    if (ongoing) {
        classes.push('rail--ongoing');
    }
    if (shifted) {
        classes.push('rail--start-shifted');
    }

    return (
        <div className={classes.join(' ')} aria-hidden="true">
            {state === 'start' || state === 'end' ? (
                <BranchArm side={side} type={state} />
            ) : null}
        </div>
    );
}

function ImageStrip({ entry }: { entry: ProjectEntry | WorkEntry }) {
    if (!entry.images || entry.images.length === 0) {
        return null;
    }

    return (
        <div
            className={`card__media${
                entry.images.length === 1 ? ' card__media--single' : ''
            }`}
        >
            {entry.images.map((image, index) => (
                <img
                    className="card__image"
                    key={`${entry.id}-${index}`}
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                />
            ))}
        </div>
    );
}

function ProjectCard({
    entry,
    shift,
}: {
    entry: ProjectEntry;
    shift: number;
}) {
    const titleId = `project-${entry.id}`;
    const shiftStyle = {
        '--mid-shift': `${shift}px`,
    } as CSSProperties;

    return (
        <div
            className="entry entry--project entry--align"
            data-entry-id={entry.id}
            style={shiftStyle}
        >
            <article className="card card--project" aria-labelledby={titleId}>
                <div className="card__topline">
                    <span className="card__kind">Project</span>
                    <span className="card__span">{rangeLabel(entry)}</span>
                </div>
                <h3 className="card__title" id={titleId}>
                    {entry.name}
                </h3>
                <p className="card__focus">{entry.focus}</p>
                <p className="card__meta">
                    <PinIcon />
                    {entry.location}
                </p>
                <p className="card__description">{entry.description}</p>
                <ImageStrip entry={entry} />
                {entry.repoUrl ? (
                    <a
                        className="card__repo"
                        href={entry.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View the ${entry.name} repository in a new tab`}
                    >
                        <GitHubIcon />
                        View repository
                        <ArrowIcon />
                    </a>
                ) : null}
            </article>
            <span className="entry__node" data-entry-node aria-hidden="true" />
        </div>
    );
}

function WorkCard({ entry, shift }: { entry: WorkEntry; shift: number }) {
    const titleId = `work-${entry.id}`;
    const shiftStyle = {
        '--mid-shift': `${shift}px`,
    } as CSSProperties;

    return (
        <div
            className="entry entry--work entry--align"
            data-entry-id={entry.id}
            style={shiftStyle}
        >
            <article className="card card--work" aria-labelledby={titleId}>
                <div className="card__topline">
                    <span className="card__kind">Work</span>
                    <span className="card__span">{rangeLabel(entry)}</span>
                </div>
                <h3 className="card__title" id={titleId}>
                    {entry.position}
                </h3>
                <p className="card__company">{entry.company}</p>
                <p className="card__meta">
                    <PinIcon />
                    {entry.location}
                </p>
                <p className="card__description">{entry.description}</p>
                <ImageStrip entry={entry} />
            </article>
            <span className="entry__node" data-entry-node aria-hidden="true" />
        </div>
    );
}

function Experience() {
    const graphRef = useRef<HTMLDivElement>(null);
    const [shifts, setShifts] = useState<Record<string, number>>({});
    const shiftsRef = useRef<Record<string, number>>({});

    const measure = useCallback(() => {
        const graph = graphRef.current;
        if (!graph) {
            return;
        }

        const isCompact = window.matchMedia('(max-width: 900px)').matches;
        if (isCompact) {
            if (Object.keys(shiftsRef.current).length > 0) {
                shiftsRef.current = {};
                setShifts({});
            }
            return;
        }

        const axisNodes = new Map<string, HTMLElement>();
        graph
            .querySelectorAll<HTMLElement>('[data-axis-node]')
            .forEach((node) => {
                if (node.dataset.axisNode) {
                    axisNodes.set(node.dataset.axisNode, node);
                }
            });

        const entryElements = new Map<string, HTMLElement>();
        graph
            .querySelectorAll<HTMLElement>('[data-entry-id]')
            .forEach((element) => {
                if (element.dataset.entryId) {
                    entryElements.set(element.dataset.entryId, element);
                }
            });

        let lastRowBottom: number | null = null;
        graph
            .querySelectorAll<HTMLElement>('[data-term-row]')
            .forEach((row) => {
                if (row.dataset.termRow === LAST_TERM) {
                    lastRowBottom = row.getBoundingClientRect().bottom;
                }
            });

        const nextShifts: Record<string, number> = {};
        let changed = false;

        for (const branch of allBranches) {
            const entryElement = entryElements.get(branch.entry.id);
            const startNode = axisNodes.get(branch.entry.startTerm);
            const cardNode = entryElement?.querySelector<HTMLElement>(
                '[data-entry-node]',
            );

            if (!entryElement || !startNode || !cardNode) {
                continue;
            }

            const startRect = startNode.getBoundingClientRect();
            const startCenter = startRect.top + startRect.height / 2;

            let endCenter: number | null = null;
            if (branch.ongoing) {
                endCenter = lastRowBottom;
            } else if (branch.entry.endTerm) {
                const endNode = axisNodes.get(branch.entry.endTerm);
                if (endNode) {
                    const endRect = endNode.getBoundingClientRect();
                    endCenter = endRect.top + endRect.height / 2;
                }
            }

            if (endCenter === null) {
                continue;
            }

            const target = (startCenter + endCenter) / 2;
            const currentShift =
                Number.parseFloat(
                    entryElement.style.getPropertyValue('--mid-shift'),
                ) || 0;
            const nodeRect = cardNode.getBoundingClientRect();
            const baseCenter = nodeRect.top + nodeRect.height / 2 - currentShift;
            const nextShift = Math.round((target - baseCenter) * 1000) / 1000;

            nextShifts[branch.entry.id] = nextShift;

            if (
                Math.abs(
                    (shiftsRef.current[branch.entry.id] ?? 0) - nextShift,
                ) > 0.1
            ) {
                changed = true;
            }
        }

        if (
            Object.keys(nextShifts).length !==
            Object.keys(shiftsRef.current).length
        ) {
            changed = true;
        }

        if (changed) {
            shiftsRef.current = nextShifts;
            setShifts(nextShifts);
        }
    }, []);

    useLayoutEffect(() => {
        measure();

        const graph = graphRef.current;
        if (!graph) {
            return undefined;
        }

        const observer = new ResizeObserver(() => measure());
        observer.observe(graph);

        const handleResize = () => measure();
        window.addEventListener('resize', handleResize);

        let cancelled = false;
        document.fonts?.ready
            .then(() => {
                if (!cancelled) {
                    measure();
                }
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [measure]);

    return (
        <section
            className="experience"
            id="experience"
            aria-labelledby="experience-heading"
        >
            <div className="experience__header">
                <h2 className="experience__title" id="experience-heading">
                    Experience
                </h2>
                <ul
                    className="experience__legend"
                    aria-label="Timeline branch colors"
                >
                    <li>
                        <span className="key key--school" aria-hidden="true" />
                        School
                    </li>
                    <li>
                        <span
                            className="key key--projects"
                            aria-hidden="true"
                        />
                        Projects
                    </li>
                    <li>
                        <span className="key key--work" aria-hidden="true" />
                        Work
                    </li>
                </ul>
            </div>

            <div className="experience__graph" ref={graphRef}>
                <ol
                    className="experience__timeline"
                    aria-label="School terms with project and work branches"
                >
                    {rows.map((row, rowIndex) => {
                        const rowClasses = ['term'];
                        if (row.isFirst) {
                            rowClasses.push('term--first');
                        }
                        if (row.isLast) {
                            rowClasses.push('term--last');
                        }
                        if (row.hasEnd) {
                            rowClasses.push('term--merge');
                        }
                        if (rows[rowIndex + 1]?.hasEnd) {
                            rowClasses.push('term--next-merge');
                        }

                        return (
                            <li
                                key={row.key}
                                className={rowClasses.join(' ')}
                                data-term-row={row.term}
                            >
                                <div
                                    className={[
                                        'axis',
                                        row.isFirst ? 'axis--first' : '',
                                        row.isLast ? 'axis--last' : '',
                                        row.hasEnd ? 'axis--merge' : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                >
                                    <span
                                        className={[
                                            'axis__node',
                                            row.isCurrent
                                                ? 'axis__node--current'
                                                : '',
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                        data-axis-node={row.term}
                                        aria-hidden="true"
                                    />
                                    <span
                                        className={[
                                            'axis__label',
                                            row.isCurrent
                                                ? 'axis__label--current'
                                                : '',
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                        title={termLongLabel(row.term)}
                                    >
                                        {row.term}
                                    </span>
                                    <span className="sr-only">
                                        {termLongLabel(row.term)}
                                    </span>
                                    {row.isCurrent ? (
                                        <span className="axis__now">now</span>
                                    ) : null}
                                </div>

                                {row.projects.length > 0 ? (
                                    <div className="cards cards--projects has-entries">
                                        {row.projects.map((entry) => (
                                            <ProjectCard
                                                key={entry.id}
                                                entry={entry}
                                                shift={shifts[entry.id] ?? 0}
                                            />
                                        ))}
                                    </div>
                                ) : null}

                                {row.work.length > 0 ? (
                                    <div className="cards cards--work has-entries">
                                        {row.work.map((entry) => (
                                            <WorkCard
                                                key={entry.id}
                                                entry={entry}
                                                shift={shifts[entry.id] ?? 0}
                                            />
                                        ))}
                                    </div>
                                ) : null}

                                {row.projectBranch && row.projectState ? (
                                    <BranchRail
                                        side="projects"
                                        state={row.projectState}
                                        ongoing={
                                            row.projectBranch.ongoing &&
                                            row.isLast
                                        }
                                        shifted={
                                            row.projectState === 'start' &&
                                            row.hasEnd
                                        }
                                    />
                                ) : null}

                                {row.workBranch && row.workState ? (
                                    <BranchRail
                                        side="work"
                                        state={row.workState}
                                        ongoing={
                                            row.workBranch.ongoing &&
                                            row.isLast
                                        }
                                        shifted={
                                            row.workState === 'start' &&
                                            row.hasEnd
                                        }
                                    />
                                ) : null}
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}

export default Experience;
