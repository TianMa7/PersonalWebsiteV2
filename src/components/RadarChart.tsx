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
import './RadarChart.css';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const data: ChartData<"radar"> = {
    labels: [
        'skill1',
        'skill2',
        'skill3',
        'skill4',
        'skill5',
        'skill6',
    ],
    datasets: [
        {
            label: 'QQuote',
            data: [1,5,3,5,6,7],

            fill: true,
            backgroundColor: 'rgba(225,99,132,0.2)',
            borderColor: 'rgba(225,99,132,1)',
            pointBackgroundColor: 'rgba(225,99,132,1)',
            pointBorderColor: 'rgba(225,99,132,1)',
            pointHoverBackgroundColor: 'rgba(225,99,132,1)',
            pointHoverBorderColor: 'rgba(225,99,132,1)',
            borderWidth: 1,
        },
        {
            label: 'TKMS',
            data: [1,5,3,9,0,8],

            fill: true,
            backgroundColor: 'rgba(225,99,132,0.2)',
            borderColor: 'rgba(225,99,132,1)',
            pointBackgroundColor: 'rgba(225,99,132,1)',
            pointBorderColor: 'rgba(225,99,132,1)',
            pointHoverBackgroundColor: 'rgba(225,99,132,1)',
            pointHoverBorderColor: 'rgba(225,99,132,1)',
            borderWidth: 1,
        },
    ],
};

const options: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,

    scales: {
        r: {
            min: 0,
            max: 10,

            ticks: {
                stepSize: 2,
                display: false,
            },

            grid: {
                color: "rgba(100, 116, 139, 0.3)",
            },
            angleLines: {
                color: "rgba(100, 116, 139, 0.3)",
            },
            pointLabels: {
                color: "#172033",
                font: {
                    size: 13,
                    weight: 600,
                },
            },
        },
    },
    plugins: {
        legend: {
            display: false
        },

        tooltip: {
            enabled: false,
        },
    },
};

function RadarChart(){
    return (
        <figure className="radar-chart">
            <div className="radar-chart__canvas">
                <Radar data={data} options={options} />
            </div>
        </figure>
    )
}

export default RadarChart;
