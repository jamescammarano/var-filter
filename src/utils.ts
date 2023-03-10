import { get, isPlainObject } from 'lodash';
import { FieldFunction } from '@directus/shared/types';
import { Filter } from './types';

export function getNodeName(node: Filter): string {
	if (!node) return '';
	return Object.keys(node)[0];
}

export function getField(node: Record<string, any>): string {
	const name = getNodeName(node);
	if (name.startsWith('_')) return '';
	if (!isPlainObject(node[name])) return '';

	const subFields = getField(node[name]);
	return subFields !== '' ? `${name}.${subFields}` : name;
}

export function getComparator(node: Record<string, any>, isUnsetVar: boolean = false): string {
	if (isUnsetVar) return '_eq';
	return getNodeName(get(node, getField(node)));
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function fieldToFilter(field: string, operator: string, value: any): Record<string, any> {
	return fieldToFilterR(field.split('.'));

	function fieldToFilterR(sections: string[]): Record<string, any> {
		const section = sections.shift();

		if (section !== undefined) {
			return {
				[section]: fieldToFilterR(sections),
			};
		} else {
			return {
				[operator]: value,
			};
		}
	}
}

export function extractFieldFromFunction(fieldKey: string): { fn: FieldFunction | null; field: string } {
	let functionName;

	if (fieldKey.includes('(') && fieldKey.includes(')')) {
		functionName = fieldKey.split('(')[0] as FieldFunction | undefined;
		fieldKey = fieldKey.match(/\(([^)]+)\)/)![1];
	}

	return { fn: functionName ?? null, field: fieldKey };
}
