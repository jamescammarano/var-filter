import { LogicalFilter, FieldFilter } from '@directus/shared/types';

export type Filter = LogicalFilter | FieldFilter | CondtionalFilter;

type CondtionalFilter = CondtionalWhenFilter | CondtionalThenFilter;

export type CondtionalWhenFilter = {
	_when: Filter[];
};

export type CondtionalThenFilter = {
	_then: Filter[];
};

export type FilterInfo =
	| {
			id: number;
			isField: true;
			name: string;
			node: Filter;
			field: string;
			comparator: string;
	  }
	| {
			id: number;
			isField: false;
			name: string;
			node: Filter;
			isLogic: boolean;
	  };
