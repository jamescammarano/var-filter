import { defineInterface } from '@directus/extensions-sdk';
import PannelVarFilter from './filter.vue';

export default defineInterface({
	id: 'var-filter',
	name: 'Variable Filter',
	icon: 'box',
	description: 'filter on variables',
	component: PannelVarFilter,
	options: null,
	types: ['json'],
});
