// Data map for Zambia demo metrics
// style_stops computed from hex_areas_itezhitezhi.geojson (31 features)

export const zambiaDataMap = {
	population: {
		data_info: {
			min: 2,
			max: 298,
			style_stops: [2, 10, 20, 60, 298]
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
			min: -0.895,
			max: 0.082,
			style_stops: [-0.895, -0.766, -0.5, -0.261, 0.082]
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
			min: 0.107,
			max: 0.116,
			style_stops: [0.107, 0.109, 0.111, 0.114, 0.116]
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
			min: 7.4,
			max: 7.8,
			style_stops: [7.4, 7.5, 7.6, 7.7, 7.8]
		},
		meta_info: {
			name: 'Female Education (years)',
			data_name: 'female_educational_attainment_mean',
			hover_text: 'Mean years of female education',
			unit: ' yrs',
			color_scale: 'blues',
			reverse_color_scale: false,
			legend_labels: ['Fewer Years', 'More Years']
		}
	},
	male_educational_attainment_mean: {
		data_info: {
			min: 8.1,
			max: 8.4,
			style_stops: [8.1, 8.15, 8.2, 8.3, 8.4]
		},
		meta_info: {
			name: 'Male Education (years)',
			data_name: 'male_educational_attainment_mean',
			hover_text: 'Mean years of male education',
			unit: ' yrs',
			color_scale: 'blues',
			reverse_color_scale: false,
			legend_labels: ['Fewer Years', 'More Years']
		}
	},
	travel_time_health_centers: {
		data_info: {
			min: 8,
			max: 881,
			style_stops: [8, 160, 277, 551, 881]
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
			min: 579,
			max: 1450,
			style_stops: [579, 693, 759, 1080, 1450]
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
			min: 8,
			max: 881,
			style_stops: [8, 160, 311, 551, 881]
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
			min: 12,
			max: 885,
			style_stops: [12, 164, 297, 555, 885]
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
	time_delta_no_sites_health_centers: {
		data_info: {
			min: 0,
			max: 62,
			style_stops: [0, 10, 20, 40, 62]
		},
		meta_info: {
			name: 'Impact: Health Centers',
			data_name: 'time_delta_no_sites_health_centers',
			hover_text: 'Travel time saved by bridges for health centers (minutes)',
			unit: ' min',
			color_scale: 'modernimpact',
			reverse_color_scale: false,
			legend_labels: ['Less Impact', 'More Impact']
		}
	},
	time_delta_no_sites_major_roads: {
		data_info: {
			min: 0,
			max: 192,
			style_stops: [0, 40, 83, 142, 192]
		},
		meta_info: {
			name: 'Impact: Major Roads',
			data_name: 'time_delta_no_sites_major_roads',
			hover_text: 'Travel time saved by bridges for major roads (minutes)',
			unit: ' min',
			color_scale: 'modernimpact',
			reverse_color_scale: false,
			legend_labels: ['Less Impact', 'More Impact']
		}
	}
};
