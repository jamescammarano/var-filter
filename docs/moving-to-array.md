# What I need:

Keys: `['_when_', '_then']`

## Next PRs:

**Fall throughs with `_otherwise`**

Currently it wont fall through on multiple whens, it just chains them. An `_otherwise` key on the same level as the
when?

**Variable keys**

## Filter Shape

Start with only top level filter.

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

**Do they need to be top level?**
