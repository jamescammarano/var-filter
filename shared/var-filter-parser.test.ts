import { expect, describe, it } from 'vitest';
import { varFilterParser, evaluteBranchOfConditions, evaluateCondition } from './var-filter-parser';

describe('Traversing the Tree', () => {
	const filter = {
		_and: [
			{ field: { _eq: 'test-null-match' } },
			{
				_if: {
					_and: [{ _method: { _null: true } }],
					_then: {
						field: { _eq: 'test-null-match' },
					},
				},
			},
		],
		variables: { _method: null },
	};

	it('non-conditional', () => {
		const goal = {
			_and: [{ field: { _eq: 'test-null-match' } }],
		};

		expect(varFilterParser(filter)).toStrictEqual(goal);
	});

	it('_if matches', () => {
		const variables = { _method: null };

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
						_and: [{ _method: { _nnull: true } }],
						_then: {
							field: { _eq: 'test-null-match' },
						},
					},
					_elseIf_1: {
						_and: [{ _tag: { _eq: 'test-contains-tag' } }],
						_then: {
							field: { _eq: 'test-contains-tag-match' },
						},
					},
				},
			],
			variables: { _tag: 'test-contains-tag' },
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
						_and: [{ _method: { _nnull: true } }],
						_then: {
							field: { _eq: 'test-null-match' },
						},
					},
					_elseIf_1: {
						_and: [{ _tag: { _eq: 'test-contains-tag' } }],
						_then: {
							field: { _eq: 'test-contains-tag-match' },
						},
					},
					_elseIf_2: {
						_and: [{ _method: { _eq: 'test-eq-var' } }],
						_then: {
							field: { _eq: 'test-eq-match' },
						},
					},
				},
			],
			variables: { _method: 'test-eq-var' },
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
						_and: [{ _method: { _nnull: true } }],
						_then: {
							field: { _eq: 'test-null-match' },
						},
					},
					_elseIf_1: {
						_and: [{ _tag: { _eq: 'test-contains-tag' } }],
						_then: {
							field: { _eq: 'test-contains-tag-match' },
						},
					},
					_elseIf_2: {
						_or: [{ _tag: { _eq: 'test-or' } }, { _method: { _null: true } }],
						_then: {
							field: { _eq: 'test-or-match' },
						},
					},
				},
			],
			variables: { _method: null, _tag: 'test-or' },
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
						_and: [{ _method: { _nnull: true } }],
						_then: {
							field: { _eq: 'test-null-match' },
						},
					},
					_elseIf_1: {
						_and: [{ _tag: { _eq: 'test-contains-tag' } }],
						_then: {
							field: { _eq: 'test-contains-tag-match' },
						},
					},
					_elseIf_2: {
						_and: [{ _tag: { _eq: 'test-and' } }, { _method: { _null: true } }],
						_then: {
							field: { _eq: 'test-and-match' },
						},
					},
				},
			],
			variables: { _method: null, _tag: 'test-and' },
		};

		const goal = {
			_and: [],
		};

		varFilterParser(filter);

		expect(varFilterParser(filter)).toStrictEqual(goal);
	});

	// it('else', () => {
	// 	const variables = { _method: 'foo', _tag: 'bar' };

	// 	filter.variables = variables;
	// 	expect(varFilterParser(filter)).toStrictEqual(goal);
	// });
});

describe('evaluateCondition', () => {
	describe('operators', () => {
		it('_eq truthy', () => {
			const statement = { _method: { _eq: 'test-eq-true' } };
			const variables = { _method: 'test-eq-true' };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_eq falsy', () => {
			const statement = { _method: { _eq: 'test-eq-false' } };
			const variables = { _method: 'fail' };

			expect(evaluateCondition(statement, variables)).toBeFalsy();
		});

		it('_neq truthy', () => {
			const statement = { _method: { _neq: 'test-neq-true' } };
			const variables = { _method: 'test-neq-truthy' };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_neq falsy', () => {
			const statement = { _method: { _neq: 'test-neq-fail' } };
			const variables = { _method: 'test-neq-fail' };

			expect(evaluateCondition(statement, variables)).toBeFalsy();
		});

		it('_gt truthy', () => {
			const statement = { _method: { _gt: 1 } };
			const variables = { _method: 2 };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_gt falsy', () => {
			const statement = { _method: { _gt: 2 } };
			const variables = { _method: 0 };

			expect(evaluateCondition(statement, variables)).toBeFalsy();
		});

		it('_gte truthy', () => {
			const statement = { _method: { _gte: 1 } };
			const variables = { _method: 2 };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_gte falsy', () => {
			const statement = { _method: { _gte: 2 } };
			const variables = { _method: 0 };

			expect(evaluateCondition(statement, variables)).toBeFalsy();
		});

		it('_gte equal true', () => {
			const statement = { _method: { _gte: 1 } };
			const variables = { _method: 1 };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_lt truthy', () => {
			const statement = { _method: { _lt: 1 } };
			const variables = { _method: 0 };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_lt falsy', () => {
			const statement = { _method: { _lt: 2 } };
			const variables = { _method: 3 };

			expect(evaluateCondition(statement, variables)).toBeFalsy();
		});

		it('_lte truthy', () => {
			const statement = { _method: { _lte: 1 } };
			const variables = { _method: 0 };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_lte falsy', () => {
			const statement = { _method: { _lte: 2 } };
			const variables = { _method: 3 };

			expect(evaluateCondition(statement, variables)).toBeFalsy();
		});

		it('_lte equals truthy', () => {
			const statement = { _method: { _lte: 2 } };
			const variables = { _method: 2 };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_null truthy', () => {
			const statement = { _method: { _null: true } };
			const variables = { _method: null };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_null falsy', () => {
			const statement = { _method: { _null: true } };
			const variables = { _method: 'fail' };

			expect(evaluateCondition(statement, variables)).toBeFalsy();
		});

		it('_nnull truthy', () => {
			const statement = { _method: { _nnull: true } };
			const variables = { _method: 'pass' };

			expect(evaluateCondition(statement, variables)).toBeTruthy();
		});

		it('_nnull falsy', () => {
			const statement = { _method: { _nnull: true } };
			const variables = { _method: null };

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
		const conditions = [{ _method: { _null: true } }];
		const variables = { _method: null };

		expect(evaluteBranchOfConditions(conditions, '_and', variables)).toBeTruthy();
	});

	it('_and single statement is false', () => {
		const conditions = [{ _method: { _null: true } }];
		const variables = { _method: 'test-falsy' };

		expect(evaluteBranchOfConditions(conditions, '_and', variables)).toBeFalsy();
	});

	it('_or single statement is true', () => {
		const conditions = [{ _method: { _null: true } }];
		const variables = { _method: null };

		expect(evaluteBranchOfConditions(conditions, '_or', variables)).toBeTruthy();
	});

	it('_or single statement is false', () => {
		const conditions = [{ _method: { _null: true } }];
		const variables = { _method: 'test-falsy' };

		expect(evaluteBranchOfConditions(conditions, '_or', variables)).toBeFalsy();
	});
	it('_and multiple statements is true', () => {
		const conditions = [{ _method: { _nnull: true } }, { _method: { _eq: 'true' } }];
		const variables = { _method: 'true' };

		expect(evaluteBranchOfConditions(conditions, '_and', variables)).toBeTruthy();
	});

	it('_and multiple statements is false', () => {
		const conditions = [{ _method: { _nnull: true } }, { _method: { _eq: true } }];
		const variables = { _method: 'test-falsy' };

		expect(evaluteBranchOfConditions(conditions, '_and', variables)).toBeFalsy();
	});

	it('_or multiple statements is true', () => {
		const conditions = [{ _method: { _null: true } }, { _method: { _eq: 'test-false' } }];
		const variables = { _method: null };

		expect(evaluteBranchOfConditions(conditions, '_or', variables)).toBeTruthy();
	});

	it('_or multiple statements is false', () => {
		const conditions = [{ _method: { _neq: 'test-false' } }, { _method: { _eq: 'test-fail' } }];
		const variables = { _method: 'test-false' };

		expect(evaluteBranchOfConditions(conditions, '_or', variables)).toBeFalsy();
	});
});
