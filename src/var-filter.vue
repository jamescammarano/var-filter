<template>
	<v-notice v-if="collectionRequired && !collectionField && !collection" type="warning">
		{{ t('collection_field_not_setup') }}
	</v-notice>
	<v-notice v-else-if="collectionRequired && !collection" type="warning">
		{{ t('select_a_collection') }}
	</v-notice>
	<div v-else class="system-filter" :class="{ inline, empty: innerValue.length === 0, field: fieldName !== undefined }">
		<v-list :mandatory="true">
			<div v-if="innerValue.length === 0" class="no-rules">
				{{ t('interfaces.filter.no_rules') }}
			</div>
			<nodes
				v-else
				@remove-node="removeNode($event)"
				@change="emitValue"
				@variable="setVariablesArray($event)"
				:field="fieldName"
				v-model:filter="innerValue"
				:collection="collection"
			/>
		</v-list>

		<div v-if="fieldName" class="buttons">
			<button @click="addNode(fieldName!)">{{ t('interfaces.filter.add_filter') }}</button>
			<button @click="addNode('$group')">{{ t('interfaces.filter.add_group') }}</button>
		</div>
		<div v-else class="buttons">
			<v-menu ref="menuEl" placement="bottom-start" show-arrow>
				<template #activator="{ toggle, active }">
					<button class="add-filter" :class="{ active }" @click="toggle">
						<v-icon v-if="inline" name="add" class="add" small />
						<span>{{ t('interfaces.filter.add_filter') }}</span>
						<v-icon name="expand_more" class="expand_more" />
					</button>
				</template>
				<v-field-list
					v-if="collectionRequired"
					:collection="collection"
					include-functions
					:include-relations="includeRelations"
					@select-field="addNode($event)"
				>
					<template #prepend>
						<v-list-item clickable @click="addNode('$group')">
							<v-list-item-content>
								<v-text-overflow :text="t('interfaces.filter.add_group')" />
							</v-list-item-content>
						</v-list-item>
						<v-divider />
						<v-list-item clickable @click="addNode('$conditional')">
							<v-list-item-content>
								<v-text-overflow text="If / Else If / Else" />
							</v-list-item-content>
						</v-list-item>
						<v-list-item clickable @click="addNode('$then')">
							<v-list-item-content>
								<v-text-overflow text="Then" />
							</v-list-item-content>
						</v-list-item>
						<!-- v-field-list hates this -->
						<v-list-group>
							<template #activator>
								<v-list-item-content>
									<v-text-overflow text="Variable" />
								</v-list-item-content>
							</template>
							<v-list-item-content class="width">
								<v-list-item @click.stop>
									<v-input type="text" @blur="search = ''" @input="search = $event.target.value" placeholder="Search">
										<template #append><v-icon name="search" /></template>
									</v-input>
								</v-list-item>
								<v-list-item
									clickable
									v-for="dataType in dataTypes"
									@click="addNode(`$var_${dataType.type}`)"
									:key="dataType.type"
								>
									<v-text-overflow :text="dataType.text" />
								</v-list-item>
							</v-list-item-content>
						</v-list-group>
						<v-divider />
					</template>
				</v-field-list>
				<v-list v-else :mandatory="false">
					<v-list-item clickable @click="addNode('$group')">
						<v-list-item-content>
							<v-text-overflow :text="t('interfaces.filter.add_group')" />
						</v-list-item-content>
					</v-list-item>
					<v-divider />
					<v-list-item @click.stop>
						<v-list-item-content>
							<input
								v-model="newKey"
								class="new-key-input"
								:placeholder="t('interfaces.filter.add_key_placeholder')"
								@keydown.enter="addKeyAsNode"
							/>
						</v-list-item-content>
					</v-list-item>
				</v-list>
			</v-menu>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';
import { useStores } from '@directus/extensions-sdk';
import { useI18n } from 'vue-i18n';
import { cloneDeep, isEmpty, set } from 'lodash';
import { FieldFunction, Type } from '@directus/shared/types';
import {
	getOutputTypeForFunction,
	parseFilterFunctionPath,
	getFilterOperatorsForType,
	get,
} from '@directus/shared/utils';

import { Filter } from './types';
import { getNodeName } from './utils';
import { REGEX_BETWEEN_HANDLEBARS, REGEX_BETWEEN_UNDERSCORES } from './consts';

import Nodes from './nodes.vue';
import { TYPES } from '@directus/shared/constants';

interface Props {
	value?: Record<string, any>;
	disabled?: boolean;
	collectionName?: string;
	collectionField?: string;
	collectionRequired?: boolean;
	fieldName?: string;
	inline?: boolean;
	includeValidation?: boolean;
	includeRelations?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	value: undefined,
	disabled: false,
	collectionName: undefined,
	collectionField: undefined,
	collectionRequired: true,
	fieldName: undefined,
	inline: false,
	includeValidation: false,
	includeRelations: true,
});

onMounted(() => removeUnusedVars());

const emit = defineEmits(['input']);
const { t } = useI18n();
const { useFieldsStore, useRelationsStore } = useStores();

const values = inject('values', ref<Record<string, any>>({}));

const collection = computed(() => {
	if (props.collectionName) return props.collectionName;
	return values.value[props.collectionField] ?? null;
});

const fieldsStore = useFieldsStore();
const relationsStore = useRelationsStore();

const newKey = ref<string | null>(null);
const menuEl = ref();

const variables = ref<Record<string, any>>({});
const search = ref<string>('');

const innerValue = computed<Filter[]>({
	get() {
		if (!props.value || isEmpty(props.value)) return [];

		const name = getNodeName(props.value);

		if (name === '_and') {
			return cloneDeep(props.value['_and']);
			// } else if (name === '_if') {
			// 	return cloneDeep(props.value['_if']);
			// } else if (name === '_elseIf') {
			// 	return cloneDeep(props.value['_elseIf']);
			// } else if (name === '_else') {
			// 	return cloneDeep(props.value['_else']);
		} else {
			return cloneDeep([props.value]);
		}
	},
	set(newVal) {
		if (newVal.length === 0) {
			emit('input', null);
		} else {
			emit('input', { _and: newVal, variables: variables.value });
		}
	},
});

const dataTypes = computed(() => {
	return TYPES.filter((type) => type.includes(search.value)).map((type) => {
		const text = type
			.replace('.', ': ')
			.split(/(?=[A-Z])/)
			.map((word: string) => {
				return word[0] ? word.replace(word[0], word[0].toUpperCase()) : word;
			})
			.join(' ');
		return {
			type,
			text,
		};
	});
});

function addNode(key: string) {
	if (key === '$group') {
		innerValue.value = innerValue.value.concat({ _and: [] });
	} else if (key === '$conditional') {
		innerValue.value = innerValue.value.concat({ _if: {} });
	} else if (key === '$then') {
		innerValue.value = innerValue.value.concat({ _then: {} });
	} else {
		let type: Type;
		const field = fieldsStore.getField(collection.value, key);
		if (key.includes('(') && key.includes(')')) {
			const functionName = key.split('(')[0] as FieldFunction;
			type = getOutputTypeForFunction(functionName);
			key = parseFilterFunctionPath(key);
		} else {
			type = field?.type || 'unknown';

			// Alias uses the foreign key type
			if (type === 'alias') {
				const relations = relationsStore.getRelationsForField(collection.value, key);
				if (relations[0]) {
					type = fieldsStore.getField(relations[0].collection, relations[0].field)?.type || 'unknown';
				}
			}
		}
		let filterOperators = getFilterOperatorsForType(type, { includeValidation: props.includeValidation });
		const operator = field?.meta?.options?.choices && filterOperators.includes('eq') ? 'eq' : filterOperators[0];
		const node = set({}, key, { ['_' + operator]: null });
		innerValue.value = innerValue.value.concat(node);
	}
}

function removeNode(ids) {
	const id = ids.pop();
	if (ids.length === 0) {
		innerValue.value = innerValue.value.filter((node, index) => index !== Number(id));
		return;
	}

	let list = get(innerValue.value, ids.join('.')) as Filter[];

	list = list.filter((_node, index) => index !== Number(id));

	innerValue.value = set(innerValue.value, ids.join('.'), list);
}

function addKeyAsNode() {
	if (!newKey.value) return;
	if (menuEl.value) menuEl.value.deactivate();
	addNode(newKey.value);
	newKey.value = null;
}

function emitValue() {
	if (innerValue.value.length === 0) {
		emit('input', null);
	} else {
		emit('input', { _and: innerValue.value, variables: variables.value });
	}
}

function setVariablesArray(variable: string) {
	const match = variable.match(REGEX_BETWEEN_HANDLEBARS);
	if (match) variables.value[`__${match[1]}__`] = variable;
}

function updateKey() {}

function removeUnusedVars() {
	// how to remove unused variables but check if used else where?
	// check on mount for vars that are unused
	if (!props.value || !props.value['_and'] || !props.value['_variables']) return;

	const { _and, variables } = props.value;
	const usedVariables = {};

	const matchedVariables = JSON.stringify(_and).matchAll(REGEX_BETWEEN_UNDERSCORES);

	if (matchedVariables === null) return;

	for (const variable in matchedVariables) {
		usedVariables[`__${variable}__`] = `{{ variable }}`;
	}

	variables.value = usedVariables;

	emit('input', { _and: innerValue.value, variables: usedVariables });
}
</script>

<style lang="scss" scoped>
.system-filter {
	:deep(ul),
	:deep(li) {
		list-style: none;
	}

	:deep(.group) {
		margin-left: 18px;
		padding-left: 10px;
		border-left: var(--border-width) solid var(--border-subdued);
	}

	.v-list {
		min-width: auto;
		margin: 0px 0px 10px;
		padding: 20px 20px 12px;
		border: var(--border-width) solid var(--border-subdued);

		& > :deep(.group) {
			margin-left: 0px;
			padding-left: 0px;
			border-left: none;
		}
	}

	.buttons {
		padding: 0 10px;
		font-weight: 600;
	}

	&.empty {
		.v-list {
			display: flex;
			align-items: center;
			height: var(--input-height);
			padding-top: 0;
			padding-bottom: 0;
		}

		.no-rules {
			color: var(--foreground-subdued);
			font-family: var(--family-monospace);
		}
	}

	.add-filter {
		color: var(--primary);
	}

	&.inline {
		.v-list {
			margin: 0;
			padding: 0;
			border: 0;
		}

		&.empty .v-list {
			display: none;
		}

		.buttons {
			margin: 0;
			padding: 0;
		}

		.add-filter {
			display: flex;
			align-items: center;
			width: 100%;
			height: 30px;
			padding: 0;
			color: var(--foreground-subdued);
			background-color: var(--background-page);
			border: var(--border-width) solid var(--border-subdued);
			border-radius: 100px;
			transition: border-color var(--fast) var(--transition);
			&:hover,
			&.active {
				border-color: var(--border-normal);
			}
			&.active {
				.expand_more {
					transform: scaleY(-1);
					transition-timing-function: var(--transition-in);
				}
			}
			.add {
				margin-left: 6px;
				margin-right: 4px;
			}
			.expand_more {
				margin-left: auto;
				margin-right: 6px;
				transition: transform var(--medium) var(--transition-out);
			}
		}
	}
}
// TODO Make this width work
.width {
	width: min-content;
}
.field .buttons {
	button {
		color: var(--primary);
		display: inline-block;
		cursor: pointer;
	}

	button + button {
		margin-left: 24px;
	}
}

.new-key-input {
	margin: 0;
	padding: 0;
	line-height: 1.2;
	background-color: transparent;
	border: none;
	border-radius: 0;

	&::placeholder {
		color: var(--v-input-placeholder-color);
	}
}
</style>
