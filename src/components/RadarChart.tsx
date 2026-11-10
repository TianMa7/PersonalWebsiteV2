import { useEffect, useMemo, useState } from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import type { ChartData, ChartOptions } from "chart.js";
import { Radar } from 'react-chartjs-2';
import { jobs, RADAR_LABELS, RADAR_LABEL_TITLES } from '../data/jobs';
import RadarLegend from './RadarLegend';
import './RadarChart.css';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const FALLBACK_POINT_LABEL_COLOR = '#6b6375';

/** Read the current body-text colour from the site palette. */
function readPointLabelColor(): string {
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue('--text')
        .trim();
    return value || FALLBACK_POINT_LABEL_COLOR;
}

/** Convert a #rrggbb colour to an rgba() string with the given alpha. */
function hexToRgba(hex: string, alpha: number): string {
    const value = hex.replace('#', '');
    const r = parseInt(value.substring(0, 2), 16);
    const g = parseInt(value.substring(2, 4), 16);
    const b = parseInt(value.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function RadarChart() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [pointLabelColor, setPointLabelColor] = useState(
        readPointLabelColor,
    );

    useEffect(() => {
        const query = window.matchMedia('(prefers-color-scheme: dark)');
        const updateColor = () => setPointLabelColor(readPointLabelColor());
        query.addEventListener('change', updateColor);
        return () => query.removeEventListener('change', updateColor);
    }, []);

    const options = useMemo<ChartOptions<'radar'>>(
        () => ({
            responsive: true,
            maintainAspectRatio: false,

            /** Leave a little breathing room so point labels never touch the canvas edge. */
            layout: {
                padding: 6,
            },

            scales: {
                r: {
                    min: 0,
                    max: 10,

                    ticks: {
                        stepSize: 2,
                        display: false,
                    },

                    grid: {
                        color: 'rgba(100, 116, 139, 0.3)',
                    },
                    angleLines: {
                        color: 'rgba(100, 116, 139, 0.3)',
                    },
                    pointLabels: {
                        color: pointLabelColor,
                        padding: 6,
                        font: {
                            size: 12,
                            weight: 600,
                        },
                    },
                },
            },
            plugins: {
                legend: {
                    display: false,
                },

                tooltip: {
                    enabled: false,
                },
            },
        }),
        [pointLabelColor],
    );

    const data = useMemo<ChartData<'radar'>>(() => {
        const datasets = jobs.map((job) => {
            const isEmphasised = hoveredId === null || hoveredId === job.id;
            const borderAlpha = isEmphasised ? 1 : 0.35;
            const fillAlpha = isEmphasised ? 0.25 : 0.06;
            const pointAlpha = isEmphasised ? 1 : 0.35;

            return {
                label: job.company,
                data: job.values,
                fill: true,
                backgroundColor: hexToRgba(job.color, fillAlpha),
                borderColor: hexToRgba(job.color, borderAlpha),
                pointBackgroundColor: hexToRgba(job.color, pointAlpha),
                pointBorderColor: hexToRgba(job.color, pointAlpha),
                pointHoverBackgroundColor: hexToRgba(job.color, 1),
                pointHoverBorderColor: hexToRgba(job.color, 1),
                borderWidth: isEmphasised ? 2 : 1,
            };
        });

        return {
            labels: [...RADAR_LABELS],
            datasets,
        };
    }, [hoveredId]);

    const handleHover = (id: string | null) => setHoveredId(id);

    const chartDescription = `Radar chart comparing ${jobs
        .map((job) => job.company)
        .join(', ')} across ${RADAR_LABEL_TITLES.join(', ')}.`;

    return (
        <figure className="radar-chart">
            <div className="radar-chart__body">
                <div
                    className="radar-chart__canvas"
                    role="img"
                    aria-label={chartDescription}
                >
                    <Radar data={data} options={options} />
                </div>
                <RadarLegend
                    jobs={jobs}
                    activeId={hoveredId}
                    onHover={handleHover}
                    onLeave={() => setHoveredId(null)}
                />
            </div>
        </figure>
    );
}

export default RadarChart;
