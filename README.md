# Adding conditionals / Filtering on variables via custom interface

[Original Proposal](https://gist.github.com/jamescammarano/756f6d62dbfc8b553f3780f85aea61b6)

To keep the variable array clean I run a function `onMount(...)` which checks the tree against the variable array.
Otherwise everything the user inputs, even accidentally, stays in the variable array forever.

Another change from the original proposal is changing the variable object to be able to load the correct type
comparators.

https://user-images.githubusercontent.com/67079013/211628348-f920c197-b595-483a-9c29-906b073000f5.mov

## The shape of Filter

```javascript
{
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
	variables: {
				_method: {
					value: 'foo',
					type: boolean
				},
				_tag: {
					value: 'bar',
					type: boolean
				}
		},
};
```

## Parsing the object

The parser is found in `shared/` because I was sharing it with other extensions in a different repository. It currently
only parses the root level. I also need to add all comparators to `evaluateBranch(...)`.

## To Do:

See [Issues](https://github.com/jamescammarano/var-filter/issues)

## Providing feedback:

If you want to provide feedback on something that doesn't have an issue use
[Discussions](https://github.com/jamescammarano/var-filter/discussions)

## Expanding the idea

Rijk:

> Doing it in-depth for every time you use validation (instead of just insight panels) might get a little more tricky,
> but also opens up the door for usage in flows / fields / etc
