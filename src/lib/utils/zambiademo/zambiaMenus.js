// Menu configuration for Zambia demo metric selection

export const zambiaMenus = {
	Demographics: {
		Population: 'population',
		'Relative Wealth Index': 'rwi',
		Underweight: 'underweight',
		'Female Education (years)': 'female_educational_attainment_mean',
		'Male Education (years)': 'male_educational_attainment_mean'
	},
	'Travel Time': {
		'All Health Facilities': 'travel_time_all_health',
		'Health Centers': 'travel_time_health_centers',
		'All Education': 'travel_time_all_education',
		'Major Roads': 'travel_time_major_roads'
	},
	Impact: {
		'Health Centers': 'time_delta_no_sites_health_centers',
		'Major Roads': 'time_delta_no_sites_major_roads'
	}
};
