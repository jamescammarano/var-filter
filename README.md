# Adding conditionals / Filtering on variables via custom interface

[Original Proposal](https://gist.github.com/jamescammarano/756f6d62dbfc8b553f3780f85aea61b6)

To keep the variable array clean I run a function `onMount(...)` which checks the tree against the variable array.
Otherwise everything the user inputs, even accidentally, stays in the variable array forever.

Another change from the original proposal is changing the variable object to be able to load the correct type
comparators.

https://user-images.githubusercontent.com/67079013/211628348-f920c197-b595-483a-9c29-906b073000f5.mov Keys:
`['_when_', '_then']`

<img width="344" alt="Screenshot 2023-01-16 at 7 04 05 AM" src="https://user-images.githubusercontent.com/67079013/212675300-d8981bca-ef27-478a-8a12-de47439b4985.png">

<img width="478" alt="Screenshot 2023-01-16 at 7 03 56 AM" src="https://user-images.githubusercontent.com/67079013/212675301-58fd4d9f-b8f0-44cd-80d4-d59b6f1d1d80.png">

```json
{
	"_and": [
		{
			"_when": [
				{
					"status": {
						"_eq": "draft"
					}
				},
				{
					"_then": [
						{
							"title": {
								"_eq": "Article 1"
							}
						}
					]
				}
			]
		}
	]
}
```

<img width="478" alt="Screenshot 2023-01-16 at 7 05 11 AM" src="https://user-images.githubusercontent.com/67079013/212675298-9651bd33-c917-46ce-a431-b92b463bf840.png">

```json
{
	"_and": [
		{
			"_when": [
				{
					"_and": [
						{
							"user_created": {
								"first_name": {
									"_contains": "Jay"
								}
							}
						},
						{
							"title": {
								"_eq": "Article 1"
							}
						}
					]
				},
				{
					"_then": [
						{
							"status": {
								"_eq": "published"
							}
						}
					]
				}
			]
		}
	]
}
```

## Next Steps

- Add "\_when" and "\_then" to graphql and filter parser?

## To Do:

See [Issues](https://github.com/jamescammarano/var-filter/issues)

## Providing feedback:

If you want to provide feedback on something that doesn't have an issue use
[Discussions](https://github.com/jamescammarano/var-filter/discussions)

## Expanding the idea

Rijk:

> Doing it in-depth for every time you use validation (instead of just insight panels) might get a little more tricky,
> but also opens up the door for usage in flows / fields / etc
