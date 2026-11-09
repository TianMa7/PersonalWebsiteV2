import type { Job } from '../data/jobs';
import './RadarLegend.css';

interface RadarLegendProps {
    jobs: Job[];
    /** The id of the job currently emphasised, or `null` when none is. */
    activeId: string | null;
    onHover: (id: string | null) => void;
    onLeave: () => void;
}

function RadarLegend({ jobs, activeId, onHover, onLeave }: RadarLegendProps) {
    return (
        <aside className="radar-legend" aria-label="Company stats legend">
            <ul className="radar-legend__list">
                {jobs.map((job) => {
                    const isActive = activeId === job.id;
                    return (
                        <li key={job.id}>
                            <button
                                type="button"
                                className={`radar-legend__block ${isActive ? 'is-active' : ''}`}
                                onMouseEnter={() => onHover(job.id)}
                                onMouseLeave={onLeave}
                            >
                                <span className="radar-legend__logo">
                                    <img src={job.logo} alt={`${job.company} logo`} />
                                </span>
                                <span className="radar-legend__text">
                                    <span className="radar-legend__company">{job.company}</span>
                                    <span className="radar-legend__location">{job.location}</span>
                                    <span className="radar-legend__title">{job.title}</span>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}

export default RadarLegend;
