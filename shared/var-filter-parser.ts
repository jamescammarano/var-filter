// import { getCompareOperators } from './utils';

// takes in a filter with a [[var,val]] section
// To be used in query sections of index.ts

const evaluateCondition = (statement, variables: Record<string, any>): boolean => {
	// getFilterOperatorsFromType validation if fail return false
	const leftVar = Object.keys(statement)[0];
	const leftValue = variables[leftVar];
	let operator = Object.keys(statement[leftVar])[0];
	let rightValue = statement[leftVar][operator];

	if (typeof leftValue !== typeof rightValue) return false;

	switch (operator) {
		case '_eq':
			return leftValue === rightValue;
		case '_neq':
			return leftValue !== rightValue;
		case '_lt':
			return leftValue < rightValue;
		case '_lte':
			return leftValue <= rightValue;
		case '_gt':
			return leftValue > rightValue;
		case '_gte':
			return leftValue >= rightValue;
		case '_null':
			return leftValue === null;
		case '_nnull':
			return leftValue !== null;

		// case 'in':
		// case 'contains':
		// return rightValue.includes(leftValue);
		// case 'nin':
		// case 'ncontains':
		// 	return !rightValue.includes(leftValue);
		// case 'icontains'
		// case 'between'
		// case 'nbetween'
		// case 'empty'
		// case 'nempty'
		// case 'intersects'
		// case 'nintersects'
		// case 'intersects_bbox'
		// case 'nintersects_bbox'
		default:
			return false;
	}
};

const evaluteBranchOfConditions = (
	conditions: Record<string, any>[],
	operator: '_and' | '_or',
	variables: Record<string, any>
) => {
	let i = 0;
	let lastResult = false;
	if (operator === '_or') {
		while (lastResult === false && i < conditions.length) {
			lastResult = evaluateCondition(conditions[0], variables);
			i++;
		}
	} else {
		lastResult = true;
		while (lastResult === true && i < conditions.length) {
			lastResult = evaluateCondition(conditions[i], variables);
			i++;
		}
	}
	return lastResult;
};

const varFilterParser = (filter: Record<string, any>) => {
	const obj: { _and: any[] } = { _and: [] };
	const { _and, variables } = filter;

	for (const branch of _and) {
		if (!branch['_if']) {
			obj['_and'].push(branch);
			continue;
		}

		for (const val of Object.values(branch as Record<string, any>)) {
			if (val['_and'] && evaluteBranchOfConditions(val['_and'], '_and', variables)) {
				obj['_and'].push(val['_then']);
				break;
			} else if (val['_or'] && evaluteBranchOfConditions(val['_or'], '_or', variables)) {
				obj['_and'].push(val['_then']);
				break;
			}
		}
	}

	return obj;
};

export { varFilterParser, evaluateCondition, evaluteBranchOfConditions };
