// Chart.js utilities for consistent styling across the impact map application
export const CHART_COLORS = {
	education: '#C88534',
	health: '#A64535',
	market: '#6E3A86',
	bridge: '#FF6B6B',
	primary: '#009149',
	secondary: '#161345',
	accent: '#66C3E3'
};

export const CHART_FONTS = {
	family: 'Kumbh Sans, sans-serif',
	size: 12,
	weight: 'normal'
};

// Default chart configuration matching B2P theme
export const getDefaultChartConfig = () => ({
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			labels: {
				font: CHART_FONTS,
				color: '#374151'
			}
		},
		tooltip: {
			titleFont: { ...CHART_FONTS, weight: 'bold' },
			bodyFont: CHART_FONTS,
			backgroundColor: 'rgba(255, 255, 255, 0.95)',
			borderColor: '#E5E7EB',
			borderWidth: 1,
			titleColor: '#111827',
			bodyColor: '#374151'
		}
	},
	scales: {
		r: {
			angleLines: {
				color: '#E5E7EB'
			},
			grid: {
				color: '#F3F4F6'
			},
			pointLabels: {
				font: CHART_FONTS,
				color: '#374151'
			},
			ticks: {
				font: { ...CHART_FONTS, size: 10 },
				color: '#6B7280',
				backdropColor: 'transparent'
			}
		}
	}
});

// Create radar/spider chart configuration for access times
export const createAccessTimeRadarConfig = (data) => {
	// Extract before and after travel times with additional debugging
	const beforeEducation = parseFloat(data.travel_time_no_sites_all_education) || 0;
	const afterEducation = parseFloat(data.travel_time_all_education) || 0;
	const beforeHealth = parseFloat(data.travel_time_no_sites_all_health) || 0;
	const afterHealth = parseFloat(data.travel_time_all_health) || 0;
	const beforeMarket = parseFloat(data.travel_time_no_sites_major_roads) || 0;
	const afterMarket = parseFloat(data.travel_time_major_roads) || 0;

	// Log the parsed values for debugging
	console.log('=== PARSED RADAR CHART VALUES ===');
	console.log('beforeEducation:', beforeEducation);
	console.log('afterEducation:', afterEducation);
	console.log('beforeHealth:', beforeHealth);
	console.log('afterHealth:', afterHealth);
	console.log('beforeMarket:', beforeMarket);
	console.log('afterMarket:', afterMarket);

	// Calculate max value for scaling
	const maxValue = Math.max(
		beforeEducation,
		afterEducation,
		beforeHealth,
		afterHealth,
		beforeMarket,
		afterMarket
	);

	// Ensure we have a minimum scale even if all values are 0
	const scaledMaxValue = maxValue > 0 ? maxValue * 1.05 : 100;

	console.log('Max value for scaling:', maxValue);
	console.log('Scaled max value:', scaledMaxValue);

	const beforeData = [beforeEducation, beforeHealth, beforeMarket];
	const afterData = [afterEducation, afterHealth, afterMarket];

	console.log('=== CHART DATA ARRAYS ===');
	console.log('beforeData (without bridges):', beforeData);
	console.log('afterData (with bridges):', afterData);

	return {
		type: 'radar',
		data: {
			labels: ['Education', 'Health', 'Market'],
			datasets: [
				{
					label: 'With Bridges (minutes)',
					data: afterData,
					backgroundColor: 'rgba(117, 117, 117, 0.3)',
					borderColor: 'rgb(48, 159, 242, 0.3)',
					borderCapStyle: 'round',
					tension: '-0.1',
					borderWidth: 4,
					pointBorderColor: 'rgb(48, 159, 242, 0.5)',
					pointBackgroundColor: 'rgb(48, 159, 242, 0.5)',
					pointHoverBackgroundColor: '#fff',
					pointHoverBorderColor: 'rgb(227, 63, 41, 1)',
					// pointRadius: 0,
					// pointHoverRadius: 0,
					// pointBorderWidth: 0
				},
				{
					label: 'Without Bridges (minutes)',
					data: beforeData,
					backgroundColor: 'rgba(206, 97, 96, 0.5)',
					borderColor: 'rgb(227, 63, 41, 0.5)',
					borderCapStyle: 'round',
					tension: '-0.1',
					borderWidth: 4,
					pointBorderColor: 'rgb(227, 63, 41, 0.5)',
					pointBackgroundColor: 'rgb(227, 63, 41, 0.5)',
					pointHoverBackgroundColor: '#fff',
					pointHoverBorderColor: 'rgb(227, 63, 41, 1)',
					// pointRadius: 0,
					// pointHoverRadius: 0,
					// pointBorderWidth: 0
				}
			]
		},
		options: {
			...getDefaultChartConfig(),
			responsive: true,
			maintainAspectRatio: false,
			layout: {
				padding: {
					top: 0,
					bottom: 0,
					left: 0,
					right: 0
				}
			},
			scales: {
				r: {
					...getDefaultChartConfig().scales.r,
					beginAtZero: true,
					max: scaledMaxValue,
					pointLabels: {
						font: { ...CHART_FONTS, size: 9, weight: 'bold' },
						color: '#374151',
						padding: 2,
						display: true
					},
					angleLines: {
						color: 'rgba(0, 0, 0, 0.08)',
						lineWidth: 1
					},
					grid: {
						color: 'rgba(0, 0, 0, 0.03)',
						lineWidth: 1
					},
					ticks: {
						font: { ...CHART_FONTS, size: 8 },
						color: '#9CA3AF',
						backdropColor: 'transparent',
						stepSize: Math.ceil(scaledMaxValue / 3),
						maxTicksLimit: 4,
						display: false,
						callback: function (value) {
							return Math.round(value) + 'm';
						}
					}
				}
			},
			plugins: {
				...getDefaultChartConfig().plugins,
				title: {
					display: false
				},
				legend: {
					...getDefaultChartConfig().plugins.legend,
					position: 'bottom',
					align: 'center',
					labels: {
						...getDefaultChartConfig().plugins.legend.labels,
						usePointStyle: true,
						padding: 8,
						boxWidth: 8,
						boxHeight: 8,
						font: { ...CHART_FONTS, size: 9 }
					}
				},
				tooltip: {
					...getDefaultChartConfig().plugins.tooltip,
					callbacks: {
						label: function (context) {
							return `${context.dataset.label}: ${context.raw} minutes`;
						}
					}
				}
			}
		}
	};
};

// Create bar chart configuration for population demographics
export const createDemographicsBarConfig = (data) => {
	const population = parseInt(data.population) || 0;
	const births = parseInt(data.births) || 0;
	const pregnancies = parseInt(data.pregnancies) || 0;
	const femaleEducation = parseFloat(data.female_educational_attainment_mean) || 0;
	const maleEducation = parseFloat(data.male_educational_attainment_mean) || 0;

	return {
		type: 'bar',
		data: {
			labels: [
				'Population',
				'Births/Year',
				'Pregnancies/Year',
				'Female Edu (years)',
				'Male Edu (years)'
			],
			datasets: [
				{
					label: 'Count/Value',
					data: [population, births, pregnancies, femaleEducation, maleEducation],
					backgroundColor: [
						CHART_COLORS.primary,
						CHART_COLORS.accent,
						CHART_COLORS.secondary,
						'rgba(220, 38, 127, 0.7)', // Female education - pinkish
						'rgba(59, 130, 246, 0.7)' // Male education - blue
					],
					borderColor: [
						CHART_COLORS.primary,
						CHART_COLORS.accent,
						CHART_COLORS.secondary,
						'rgba(220, 38, 127, 1)',
						'rgba(59, 130, 246, 1)'
					],
					borderWidth: 1
				}
			]
		},
		options: {
			...getDefaultChartConfig(),
			scales: {
				y: {
					beginAtZero: true,
					ticks: {
						font: CHART_FONTS,
						color: '#6B7280'
					},
					grid: {
						color: '#F3F4F6'
					}
				},
				x: {
					ticks: {
						font: CHART_FONTS,
						color: '#374151',
						maxRotation: 45,
						minRotation: 45
					},
					grid: {
						display: false
					}
				}
			},
			plugins: {
				...getDefaultChartConfig().plugins,
				title: {
					display: true,
					text: 'Demographics & Education Overview',
					font: { ...CHART_FONTS, size: 14, weight: 'bold' },
					color: '#111827'
				},
				legend: {
					display: false
				}
			}
		}
	};
};

// Create doughnut chart for infrastructure usage
export const createInfrastructureUsageConfig = (data) => {
	const usageData = [];
	const labels = [];
	const colors = [];

	// Extract infrastructure usage data from bridge arrays
	const healthBridges = data.bridges_used_for_health_centers_optimal?.length || 0;
	const eduBridges = data.bridges_used_for_all_education_facilities_fixed?.length || 0;
	const marketBridges = data.bridges_used_for_major_roads_optimal?.length || 0;

	if (healthBridges > 0) {
		labels.push('Health Access');
		usageData.push(healthBridges);
		colors.push(CHART_COLORS.health);
	}

	if (eduBridges > 0) {
		labels.push('Education Access');
		usageData.push(eduBridges);
		colors.push(CHART_COLORS.education);
	}

	if (marketBridges > 0) {
		labels.push('Market Access');
		usageData.push(marketBridges);
		colors.push(CHART_COLORS.market);
	}

	return {
		type: 'doughnut',
		data: {
			labels,
			datasets: [
				{
					data: usageData,
					backgroundColor: colors,
					borderColor: colors,
					borderWidth: 2,
					hoverBorderWidth: 3
				}
			]
		},
		options: {
			...getDefaultChartConfig(),
			plugins: {
				...getDefaultChartConfig().plugins,
				title: {
					display: true,
					text: 'Infrastructure Usage',
					font: { ...CHART_FONTS, size: 14, weight: 'bold' },
					color: '#111827'
				}
			}
		}
	};
};

// Utility to format chart data numbers
export const formatChartValue = (value, type = 'number') => {
	if (value == null || value === undefined) return 'N/A';

	switch (type) {
		case 'time':
			return `${value} min`;
		case 'percent':
			return `${value}%`;
		case 'currency':
			return `$${value.toLocaleString()}`;
		case 'people':
			return value >= 1000 ? `${(value / 1000).toFixed(1)}K people` : `${value} people`;
		case 'births/yr':
			return `${value} births/yr`;
		case 'pregnancies/yr':
			return `${value} pregnancies/yr`;
		case 'years':
			return `${value} years`;
		case 'percentile':
			return `${(value * 100).toFixed(1)}%`;
		case '':
			return value.toFixed(3); // For RWI and other unitless values
		default:
			return value.toLocaleString();
	}
};

// Calculate which percentile a value falls into (returns 1-5 for quintiles)
export const calculatePercentile = (value, dataType, impactDataMap) => {
	if (value == null || value === undefined) return 0;

	const dataInfo = impactDataMap[dataType];
	if (!dataInfo || !dataInfo.data_info || !dataInfo.data_info.quantiles) return 0;

	const quantiles = dataInfo.data_info.quantiles;
	// quantiles array has 9 values representing 10th, 20th, 30th, 40th, 50th, 60th, 70th, 80th, 90th percentiles
	// We need to map these to 5 quintiles (20th, 40th, 60th, 80th, 100th)
	const quintileThresholds = [
		quantiles[1], // 20th percentile
		quantiles[3], // 40th percentile
		quantiles[5], // 60th percentile
		quantiles[7] // 80th percentile
	];

	// Count how many thresholds the value exceeds
	let activatedBars = 1; // Start with 1 bar minimum
	for (const threshold of quintileThresholds) {
		if (value > threshold) {
			activatedBars++;
		} else {
			break;
		}
	}

	// Cap at 5 bars maximum
	return Math.min(5, activatedBars);
};
