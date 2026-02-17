// Data map for Zambia demo metrics
// style_stops matched to main impact map cutoff values

export const zambiaDataMap = {
	population: {
		data_info: {
			min: 2,
			max: 298,
			style_stops: [7, 21, 48, 179, 873]
		},
		meta_info: {
			name: 'Population',
			data_name: 'population',
			hover_text: 'Population',
			unit: '',
			color_scale: 'sage',
			reverse_color_scale: false,
			legend_labels: ['Less People', 'More People']
		}
	},
	rwi: {
		data_info: {
			min: -1.397,
			max: 1.89,
			style_stops: [-0.778, -0.389, 0, 0.166, 0.332]
		},
		meta_info: {
			name: 'Relative Wealth Index',
			data_name: 'rwi',
			hover_text: 'Relative Wealth Index',
			unit: '',
			color_scale: 'rdylgn',
			reverse_color_scale: false,
			legend_labels: ['Less Wealthy', 'More Wealthy']
		}
	},
	underweight: {
		data_info: {
			min: 0.044,
			max: 0.486,
			style_stops: [0.106, 0.128, 0.156, 0.213, 0.298]
		},
		meta_info: {
			name: 'Underweight',
			data_name: 'underweight',
			hover_text: 'Underweight prevalence',
			unit: '%',
			color_scale: 'reds',
			reverse_color_scale: false,
			legend_labels: ['Lower', 'Higher']
		}
	},
	female_educational_attainment_mean: {
		data_info: {
			min: 0.1,
			max: 11.8,
			style_stops: [2.6, 4.0, 5.3, 7.0, 9.0]
		},
		meta_info: {
			name: 'Female Education (years)',
			data_name: 'female_educational_attainment_mean',
			hover_text: 'Mean years of female education',
			unit: ' yrs',
			color_scale: 'rdylgn',
			reverse_color_scale: false,
			legend_labels: ['Fewer Years', 'More Years']
		}
	},
	male_educational_attainment_mean: {
		data_info: {
			min: 0.5,
			max: 12.4,
			style_stops: [2.6, 4.0, 5.3, 7.0, 9.0]
		},
		meta_info: {
			name: 'Male Education (years)',
			data_name: 'male_educational_attainment_mean',
			hover_text: 'Mean years of male education',
			unit: ' yrs',
			color_scale: 'rdylgn',
			reverse_color_scale: false,
			legend_labels: ['Fewer Years', 'More Years']
		}
	},
	travel_time_health_centers: {
		data_info: {
			min: 0,
			max: 2868,
			style_stops: [15, 45, 90, 120, 150]
		},
		meta_info: {
			name: 'Travel Time: Health Centers',
			data_name: 'travel_time_health_centers',
			hover_text: 'Walking time to nearest health center (minutes)',
			unit: ' min',
			color_scale: 'rdylgn',
			reverse_color_scale: true,
			legend_labels: ['Closer', 'Further']
		}
	},
	travel_time_major_roads: {
		data_info: {
			min: 0,
			max: 2851,
			style_stops: [15, 60, 105, 150, 210]
		},
		meta_info: {
			name: 'Travel Time: Major Roads',
			data_name: 'travel_time_major_roads',
			hover_text: 'Walking time to nearest major road (minutes)',
			unit: ' min',
			color_scale: 'rdylgn',
			reverse_color_scale: true,
			legend_labels: ['Closer', 'Further']
		}
	},
	travel_time_all_health: {
		data_info: {
			min: 0,
			max: 2868,
			style_stops: [15, 45, 90, 120, 150]
		},
		meta_info: {
			name: 'Travel Time: All Health',
			data_name: 'travel_time_all_health',
			hover_text: 'Walking time to nearest health facility (minutes)',
			unit: ' min',
			color_scale: 'rdylgn',
			reverse_color_scale: true,
			legend_labels: ['Closer', 'Further']
		}
	},
	travel_time_all_education: {
		data_info: {
			min: 0,
			max: 2880,
			style_stops: [15, 30, 45, 60, 90]
		},
		meta_info: {
			name: 'Travel Time: All Education',
			data_name: 'travel_time_all_education',
			hover_text: 'Walking time to nearest education facility (minutes)',
			unit: ' min',
			color_scale: 'rdylgn',
			reverse_color_scale: true,
			legend_labels: ['Closer', 'Further']
		}
	},
	impact: {
		data_info: {
			min: 0,
			max: 200,
			style_stops: [0, 1, 15, 30, 45]
		},
		meta_info: {
			name: 'Bridge Impact',
			data_name: 'impact_combined',
			hover_text: 'Total travel time saved by bridges (minutes)',
			unit: ' min',
			color_scale: 'impact_green',
			reverse_color_scale: false,
			legend_labels: ['Less Impact', 'More Impact'],
			combined_fields: [
				'time_delta_no_sites_all_health',
				'time_delta_no_sites_all_education'
			]
		}
	}
};
