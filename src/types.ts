import { LogicalFilter, FieldFilter } from '@directus/shared/types';

export type Filter = LogicalFilter | FieldFilter | CondtionalFilter;

type CondtionalFilter = CondtionalIfFilter | CondtionalElseIfFilter | CondtionalElseFilter | CondtionalThenFilter;

export type CondtionalIfFilter = {
	_if: Filter[];
};

export type CondtionalElseIfFilter = {
	_elseIf: Filter[];
};

export type CondtionalElseFilter = {
	_else: Filter[];
};

type CondtionalThenFilter = {
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
			itThen: false;
	  };
