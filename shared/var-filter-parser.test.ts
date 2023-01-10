import { expect, describe, it } from 'vitest';
import { varFilterParser, evaluteBranchOfConditions, evaluateCondition } from './var-filter-parser';

describe('Traversing the Tree', () => {
	const filter = {
		_and: [
			{ field: { _eq: 'test-null-match' } },
			{
				_if: {
					_and: [{ __method__: { __null: true } }],
					_then: {
						field: { _eq: 'test-null-match' },
					},
				},
			},
		],
		variables: { __method__: null },
	};

	it('non-conditional', () => {
		const goal = {
			_and: [{ field: { _eq: 'test-null-match' } }],
		};

		expect(varFilterParser(filter)).toStrictEqual(goal);
	});

	it('_if matches', () => {
		const variables = { __method__: null };

		const goal = {
			_and: [{ field: { _eq: 'test-null-match' } }],
		};

		filter.variables = variables;

		expect(varFilterParser(filter)).toStrictEqual(goal);
	});

	it('_elseIf_1 matches', () => {
		const filter = {
			_and: [
				{
					_if: {
						_and: [{ __method__: { __nnull: true } }],
						_then: {
							field: { _eq: 'test-null-match' },
						},
					},
					_elseIf_1: {
						_and: [{ __tag__: { _eq: 'test-contains-tag' } }],
						_then: {
							field: { _eq: 'test-contains-tag-match' },
						},
					},
				},
			],
			variables: { __tag__: 'test-contains-tag' },
		};

		const goal = {
			_and: [{ field: { _eq: 'test-contains-tag-match' } }],
		};

		expect(varFilterParser(filter)).toStrictEqual(goal);
	});

	it('second _elseIf', () => {
		const filter = {
			_and: [
				{
					_if: {
						_and: [{ __method__: { __nnull: true } }],
						_then: {
							field: { _eq: 'test-null-match' },
						},
					},
					_elseIf_1: {
						_and: [{ __tag__: { _eq: 'test-contains-tag' } }],
						_then: {
							field: { _eq: 'test-contains-tag-match' },
						},
					},
					_elseIf_2: {
						_and: [{ __method__: { _eq: 'test-eq-var' } }],
						_then: {
							field: { _eq: 'test-eq-match' },
						},
					},
				},
			],
			variables: { __method__: 'test-eq-var' },
		};

		const goal = {
			_and: [{ field: { _eq: 'test-eq-match' } }],
		};

		expect(varFilterParser(filter)).toStrictEqual(goal);
	});

	it('third _elseIf matches', () => {
		const filter = {
			_and: [
				{
					_if: {
						_and: [{ __method__: { __nnull: true } }],
						_then: {
							field: { _eq: 'test-null-match' },
						},
					},
					_elseIf_1: {
						_and: [{ __tag__: { _eq: 'test-contains-tag' } }],
						_then: {
							field: { _eq: 'test-contains-tag-match' },
						},
					},
					_elseIf_2: {
						_or: [{ __tag__: { _eq: 'test-or' } }, { __method__: { __null: true } }],
						_then: {
							field: { _eq: 'test-or-match' },
						},
					},
				},
			],
			variables: { __method__: null, __tag__: 'test-or' },
		};

		const goal = {
			_and: [{ field: { _eq: 'test-or-match' } }],
		};

		varFilterParser(filter);

		expect(varFilterParser(filter)).toStrictEqual(goal);
	});

	it('fourth _elseIf matches', () => {
		const filter = {
			_and: [
				{
					_if: {
						_and: [{ __method__: { __nnull: true } }],
						_then: {
							field: { _eq: 'test-null-match' },
						},
					},
					_elseIf_1: {
						_and: [{ __tag__: { _eq: 'test-contains-tag' } }],
						_then: {
							field: { _eq: 'test-contains-tag-match' },
						},
					},
					_elseIf_2: {
						_and: [{ __tag__: { _eq: 'test-and' } }, { __method__: { __null: true } }],
						_then: {
							field: { _eq: 'test-and-match' },
						},
					},
				},
			],
			variables: { __method__: null, __tag__: 'test-and' },
		};

		const goal = {
			_and: [],
		};

		varFilterParser(filter);

		expect(varFilterParser(filter)).toStrictEqual(goal);
	});

	// it('else', () => {
	// 	const variables = { __method__: 'foo', __tag__: 'bar' };

	// 	filter.variables = variables;
	// 	expect(varFilterParser(filter)).toStrictEqual(goal);
	// });
});

describe('evaluateCondition', () => {
	describe('operators', () => {
		it('_eq truthy', () => {
			const statement = { __method__: { _eq: 'test-eq-true' } };
			const variables = { __method__: 'test-eq-true' };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_eq falsy', () => {
			const statement = { __method__: { _eq: 'test-eq-false' } };
			const variables = { __method__: 'fail' };

			expect(evaluateCondition(statement, variables)).toBeFalsy();
		});

		it('_neq truthy', () => {
			const statement = { __method__: { _neq: 'test-neq-true' } };
			const variables = { __method__: 'test-neq-truthy' };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_neq falsy', () => {
			const statement = { __method__: { _neq: 'test-neq-fail' } };
			const variables = { __method__: 'test-neq-fail' };

			expect(evaluateCondition(statement, variables)).toBeFalsy();
		});

		it('_gt truthy', () => {
			const statement = { __method__: { _gt: 1 } };
			const variables = { __method__: 2 };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_gt falsy', () => {
			const statement = { __method__: { _gt: 2 } };
			const variables = { __method__: 0 };

			expect(evaluateCondition(statement, variables)).toBeFalsy();
		});

		it('_gte truthy', () => {
			const statement = { __method__: { _gte: 1 } };
			const variables = { __method__: 2 };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_gte falsy', () => {
			const statement = { __method__: { _gte: 2 } };
			const variables = { __method__: 0 };

			expect(evaluateCondition(statement, variables)).toBeFalsy();
		});

		it('_gte equal true', () => {
			const statement = { __method__: { _gte: 1 } };
			const variables = { __method__: 1 };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_lt truthy', () => {
			const statement = { __method__: { _lt: 1 } };
			const variables = { __method__: 0 };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_lt falsy', () => {
			const statement = { __method__: { _lt: 2 } };
			const variables = { __method__: 3 };

			expect(evaluateCondition(statement, variables)).toBeFalsy();
		});

		it('_lte truthy', () => {
			const statement = { __method__: { _lte: 1 } };
			const variables = { __method__: 0 };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_lte falsy', () => {
			const statement = { __method__: { _lte: 2 } };
			const variables = { __method__: 3 };

			expect(evaluateCondition(statement, variables)).toBeFalsy();
		});

		it('_lte equals truthy', () => {
			const statement = { __method__: { _lte: 2 } };
			const variables = { __method__: 2 };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_null truthy', () => {
			const statement = { __method__: { _null: true } };
			const variables = { __method__: null };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_null falsy', () => {
			const statement = { __method__: { _null: true } };
			const variables = { __method__: 'fail' };

			expect(evaluateCondition(statement, variables)).toBeFalsy();
		});

		it('_nnull truthy', () => {
			const statement = { __method__: { _nnull: true } };
			const variables = { __method__: 'pass' };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_nnull falsy', () => {
			const statement = { __method__: { _nnull: true } };
			const variables = { __method__: null };

			expect(evaluateCondition(statement, variables)).toBeFalsy();
		});
		// test: {{var}} === {{otherVar}}
	});
	describe('types', () => {
		// test: var type and operator not valid
		// all types as relevant opterators
		it('', () => {});
	});
});

describe('evaluateBranchOfConditions', () => {
	it('_and single statement is true', () => {
		const conditions = [{ __method__: { _null: true } }];
		const variables = { __method__: null };

		expect(evaluteBranchOfConditions(conditions, '_and', variables)).toBeTruthy();
	});

	it('_and single statement is false', () => {
		const conditions = [{ __method__: { _null: true } }];
		const variables = { __method__: 'test-falsy' };

		expect(evaluteBranchOfConditions(conditions, '_and', variables)).toBeFalsy();
	});

	it('_or single statement is true', () => {
		const conditions = [{ __method__: { _null: true } }];
		const variables = { __method__: null };

		expect(evaluteBranchOfConditions(conditions, '_or', variables)).toBeTruthy();
	});

	it('_or single statement is false', () => {
		const conditions = [{ __method__: { _null: true } }];
		const variables = { __method__: 'test-falsy' };

		expect(evaluteBranchOfConditions(conditions, '_or', variables)).toBeFalsy();
	});
	it('_and multiple statements is true', () => {
		const conditions = [{ __method__: { _nnull: true } }, { __method__: { _eq: 'true' } }];
		const variables = { __method__: 'true' };

		expect(evaluteBranchOfConditions(conditions, '_and', variables)).toBeTruthy();
	});

	it('_and multiple statements is false', () => {
		const conditions = [{ __method__: { _nnull: true } }, { __method__: { _eq: true } }];
		const variables = { __method__: 'test-falsy' };

		expect(evaluteBranchOfConditions(conditions, '_and', variables)).toBeFalsy();
	});

	it('_or multiple statements is true', () => {
		const conditions = [{ __method__: { _null: true } }, { __method__: { _eq: 'test-false' } }];
		const variables = { __method__: null };

		expect(evaluteBranchOfConditions(conditions, '_or', variables)).toBeTruthy();
	});

	it('_or multiple statements is false', () => {
		const conditions = [{ __method__: { _neq: 'test-false' } }, { __method__: { _eq: 'test-fail' } }];
		const variables = { __method__: 'test-false' };

		expect(evaluteBranchOfConditions(conditions, '_or', variables)).toBeFalsy();
	});
});
