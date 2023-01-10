# Variable Filter

[Original Proposal](https://gist.github.com/jamescammarano/756f6d62dbfc8b553f3780f85aea61b6)

To keep the variable array clean I run a function `onMount(...)` which checks the tree against the variable array.
Otherwise everything the user inputs, even accidentally, stays in the variable array forever.

Another change from the original proposal is changing the variable object to be able to load the correct type comparators.

<!-- ## The dropdown: -->

<!-- pic -->

## The shape of Filter

```javascript
{
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
	variables: {
				__method__: {
					value: 'foo',
					type: boolean
				},
				__tag__: {
					value: 'bar',
					type: boolean
				}
		},
};
```

<!-- ## Diff w/ system-filter

**system-filter.vue**

**nodes.vue**

**input-group.vue**

**types**

**utils** -->

## To Do

- Support multiple `_elseIf` statements by incrementing `_elseIf_#`
- Fix console error on v-list-group
- bug: replacing the field with `__var__` right away is bad
  - maybe replace it on save?
- Support finding type of `__var__`
  - Add {type} to the variables object
- Migrate from `__var__ `to `__var` because vars can contain \_\_ in the middle

## Expanding the idea

Rijk:

> Doing it in-depth for every time you use validation (instead of just insight panels) might get a little more tricky,
> but also opens up the door for usage in flows / fields / etc
