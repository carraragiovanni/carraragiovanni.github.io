// USER INPUTS
const $ = window.jQuery
let revenue = 200000000;
let grossMargin = 0.3;
let monthlyProductionVolume = 100000;
let scrapRate = 0.03;
let reworkRate = 0.05;
let manufacturingEngineers = 3;
let operators = 30;

// COST OF TULIP
let operatorsPerStation = 2;
let costPerStation = 2400;

// ASSUMPTIONS
let costOfScrapMultiplier = 2;
let costOfReworkMultiplier = 1.5;
let costOfMEFTE = 120000;
let costOfOperatorFTE = 70000;

// CALCULATIONS
let beforeTulip;
let withTulip;
let savings;
let totalSavingsPerYear;

// IMPACT OF TULIP
let reductionInScrap = 0.2;
let reductionInRework = 0.3;
let increaseProductivityEngineers = 0.25;
let increaseProductivityOperators = 0.06 + (0.2 / Math.log(monthlyProductionVolume));

// ROI ATTRIBUTION
let digitalWorkflows;
let quality;
let training;

let revenueValueNode;

let revenueCalc;
let grossCalc;
let scrapCalc;
let reworkCalc;
let engineersCalc;
let operatorsCalc;
let volumeCalc;

$(document).ready(function () {
    revenueCalc = {
        min: 200,
        max: 31623,
        input: document.getElementById('revenueInput'),
        marker: document.getElementById('revenueValue'),
        calculate: i => getRoundNumber(Math.pow(i, 2)),
        format: i => `$${formatNumberShort(i)}`,
    }
    grossCalc = {
        min: 10,
        max: 70,
        input: document.getElementById('grossMarginInput'),
        marker: document.getElementById('grossMarginValue'),
        calculate: i => i / 100,
        format: i => `${Math.round(100 * i)}%`,
    }
    scrapCalc = {
        min: 1,
        max: 40,
        input: document.getElementById('scrapRateInput'),
        marker: document.getElementById('scrapRateValue'),
        calculate: i => i / 100,
        format: i => `$${Math.round(100 * i)}%`,
    }
    reworkCalc = {
        min: 1,
        max: 70,
        input: document.getElementById('reworkRateInput'),
        marker: document.getElementById('reworkRateValue'),
        calculate: i => i / 100,
        format: i => `$${Math.round(100 * i)}%`,
    }
    engineersCalc = {
        min: 1,
        max: 15,
        input: document.getElementById('manufacturingEngineersInput'),
        marker: document.getElementById('manufacturingEngineersValue'),
    }
    operatorsCalc = {
        min: 2,
        max: 150,
        input: document.getElementById('operatorsInput'),
        marker: document.getElementById('operatorsValue'),
    }
    volumeCalc = {
        min: 1,
        max: 1000,
        input: document.getElementById('monthlyProductionVolumeInput'),
        marker: document.getElementById('monthlyProductionVolumeValue'),
        calculate: i => Math.max(1, getRoundNumber(Math.pow(i, 2))),
        format: i => formatNumberShort(i),
    }
    
    updateUserInputs();
    calculateCosts();
    ROIattribution();
    writeResults();
    populateChart();
    
    const update = () => {
        updateUserInputs();
        calculateCosts();
        ROIattribution();
        writeResults();
        populateChart();
    }
    
    $("input").on("input", function () {
        updateUserInputs();
        calculateCosts();
        ROIattribution();
        writeResults();
        populateChart();
    });
});

function calcIncreaseProductivityOperators() {
    increaseProductivityOperators = 0.06 + (0.2 / (Math.log10(monthlyProductionVolume)));
    return increaseProductivityOperators;
}

function calculateCosts() {
    beforeTulip = {
        costOfScrap: scrapRate * revenue * (1 - grossMargin) * costOfScrapMultiplier,
        costOfRework: reworkRate * revenue * (1 - grossMargin) * costOfReworkMultiplier,
        costOfME: manufacturingEngineers * costOfMEFTE,
        costOfOperators: operators * costOfOperatorFTE,
        costOfTulip: 0
    }
    
    withTulip = {
        costOfScrap: beforeTulip.costOfScrap / (1 + reductionInScrap),
        costOfRework: beforeTulip.costOfRework / (1 + reductionInRework),
        costOfME: beforeTulip.costOfME / (1 + increaseProductivityEngineers),
        costOfOperators: beforeTulip.costOfOperators / (1 + calcIncreaseProductivityOperators()),
        costOfTulip: operators / operatorsPerStation * costPerStation
    }
    
    savings = {
        costOfScrap: beforeTulip.costOfScrap - withTulip.costOfScrap,
        costOfRework: beforeTulip.costOfRework - withTulip.costOfRework,
        costOfME: beforeTulip.costOfME- withTulip.costOfME,
        costOfOperators: beforeTulip.costOfOperators - withTulip.costOfOperators,
        costOfTulip: beforeTulip.costOfTulip - withTulip.costOfTulip
    }
    
    totalSavingsPerYear =
    savings.costOfScrap +
    savings.costOfRework +
    savings.costOfME +
    savings.costOfOperators +
    savings.costOfTulip;
}

const update = ({
    min, max, input, marker, calculate, format,
}) => {
    const val = parseFloat(input.value);
    calcVal = calculate ? calculate(val) : val;
    const para = (val - min) / (max - min);
    marker.innerHTML = format ? format(calcVal) : calcVal;
    marker.style.left = `${(100 * para)}%`;
    marker.style.marginLeft = `-${marker.offsetWidth / 2}px`;
    return calcVal;
}

function updateUserInputs() {
    revenue = update(revenueCalc);
    grossMargin = update(grossCalc);
    scrapRate = update(scrapCalc);
    reworkRate = update(reworkCalc);
    manufacturingEngineers = update(engineersCalc);
    operators = update(operatorsCalc);
    monthlyProductionVolume = update(volumeCalc);
}

function ROIattribution() {
    let roiAttributionBreakDown = {
        digitalWorkflowsBreakDown: {
            quality: 0.6,
            manufacturingEngineers: 0.4,
            operators: 0.4
        },
        qualityBreakDown: {
            quality: 0.4,
            manufacturingEngineers: 0.3,
            operators: 0.3
        },
        trainingBreakDown: {
            quality: 0,
            manufacturingEngineers: 0.3,
            operators: 0.3
        },
    }
    
    digitalWorkflows = (roiAttributionBreakDown.digitalWorkflowsBreakDown.quality * (savings.costOfScrap + savings.costOfRework)) + (roiAttributionBreakDown.digitalWorkflowsBreakDown.manufacturingEngineers * savings.costOfME) + (roiAttributionBreakDown.digitalWorkflowsBreakDown.operators * savings.costOfOperators);
    quality = (roiAttributionBreakDown.qualityBreakDown.quality * (savings.costOfScrap + savings.costOfRework)) + (roiAttributionBreakDown.qualityBreakDown.manufacturingEngineers * savings.costOfME) + (roiAttributionBreakDown.qualityBreakDown.operators * savings.costOfOperators);
    training = (roiAttributionBreakDown.trainingBreakDown.quality * (savings.costOfScrap + savings.costOfRework)) + (roiAttributionBreakDown.trainingBreakDown.manufacturingEngineers * savings.costOfME) + (roiAttributionBreakDown.trainingBreakDown.operators * savings.costOfOperators);
}

function writeResults() {
    $("#totalSavingsPerYear").html(formatCurrency(totalSavingsPerYear));
    
    $("#digitalWorkflows").html(formatCurrency(digitalWorkflows));
    $("#quality").html(formatCurrency(quality));
    $("#training").html(formatCurrency(training));

    $("#costOfTulip").html(formatCurrency(savings.costOfTulip));
}

function clearResults() {
    $(".output").each(function() {
        $(this).html("");
    })
}

function formatCurrency(number) {
    return number.toLocaleString('en-EN', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function formatNumber(number) {
    return number.toLocaleString('en-EN');
}

function getRoundNumber(number) {
    const rounding = Math.floor(Math.log10(number)) - 1;
    const remainder = number % Math.pow(10, rounding);
    return number - remainder;
}

// max four digits
function formatNumberShort(number) {
    if (number < 1000) {
        return number;
    }
    if (number < 1000000) {
        return `${number / 1000}K`;
    }
    if (number < 1000000000) {
        return `${number / 1000000}M`;
    }
    return `${number / 1000000000}B`;
}

function populateChart() {
var ctx = document.getElementById('chart');

var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Y1Q1", "Y1Q2", "Y1Q3", "Y1Q4", "Y2Q1", "Y2Q2", "Y2Q3", "Y2Q4", "Y3Q1", "Y3Q2", "Y3Q3", "Y3Q4"],
        datasets: [{
            data: [withTulip.costOfTulip * 0.25, withTulip.costOfTulip * 0.5, withTulip.costOfTulip * 0.75, withTulip.costOfTulip,
                withTulip.costOfTulip * 1.25, withTulip.costOfTulip * 1.5, withTulip.costOfTulip * 1.75, withTulip.costOfTulip * 2,
                withTulip.costOfTulip * 2.25, withTulip.costOfTulip * 2.5, withTulip.costOfTulip * 2.75, withTulip.costOfTulip * 3],
            type: 'line',
            backgroundColor: [
                'rgba(255, 215, 0, 0.8)',
                'rgba(255, 215, 0, 0.8)',
                'rgba(255, 215, 0, 0.8)',
                'rgba(255, 215, 0, 0.8)',
                'rgba(255, 215, 0, 0.8)',
                'rgba(255, 215, 0, 0.8)',
                'rgba(255, 215, 0, 0.8)',
                'rgba(255, 215, 0, 0.8)',
                'rgba(255, 215, 0, 0.8)',
                'rgba(255, 215, 0, 0.8)',
                'rgba(255, 215, 0, 0.8)',
                'rgba(255, 215, 0, 0.8)']
        }, {
            data: [digitalWorkflows * 0.25, digitalWorkflows * 0.5, digitalWorkflows * 0.75, digitalWorkflows * 1,
                digitalWorkflows * 1.25, digitalWorkflows * 1.5, digitalWorkflows * 1.75, digitalWorkflows * 2, 
                digitalWorkflows * 2.25, digitalWorkflows * 2.5, digitalWorkflows * 2.75, digitalWorkflows * 3 ],
            backgroundColor: [
                '#B8DCFF',
                '#B8DCFF',
                '#B8DCFF',
                '#B8DCFF',
                '#B8DCFF',
                '#B8DCFF',
                '#B8DCFF',
                '#B8DCFF',
                '#B8DCFF',
                '#B8DCFF',
                '#B8DCFF',
                '#B8DCFF'],
        }, {
            data: [quality * 0.25, quality * 0.5, quality * 0.75, quality * 1,
                quality * 1.25, quality * 1.5, quality * 1.75, quality * 2,
                quality * 2.25, quality * 2.5, quality * 2.75, quality * 3],
            backgroundColor: [
                '#CBE6FF',
                '#CBE6FF',
                '#CBE6FF',
                '#CBE6FF',
                '#CBE6FF',
                '#CBE6FF',
                '#CBE6FF',
                '#CBE6FF',
                '#CBE6FF',
                '#CBE6FF',
                '#CBE6FF',
                '#CBE6FF'],
        }, {
            
            data: [training * 0.25, training * 0.5, training * 0.75, training * 1,
                training * 1.25, training * 1.5, training * 1.75, training * 2,
                training * 2.25, training * 2.5, training * 2.75, training * 3
            ],
            backgroundColor: [
                '#E5F2FF',
                '#E5F2FF',
                '#E5F2FF',
                '#E5F2FF',
                '#E5F2FF',
                '#E5F2FF',
                '#E5F2FF',
                '#E5F2FF',
                '#E5F2FF',
                '#E5F2FF',
                '#E5F2FF',
                '#E5F2FF']
        }]
    },
    options: {
        legend: {
            display: false
        },
        tooltips: {
            enabled: false
        },
        scales: {
            xAxes: [{
                stacked: true
            }],
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index, values) {
                        return formatCurrency(value);
                    }
                }
            }]
        },
    }
});
}