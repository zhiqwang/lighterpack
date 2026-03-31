<style lang="scss">
.lpAutocomplete {
    position: relative;
}

.lpAutocompleteDropdown {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 0 0 4px 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    left: 0;
    max-height: 200px;
    overflow-y: auto;
    position: absolute;
    right: 0;
    top: 100%;
    z-index: 100;
}

.lpAutocompleteSuggestion {
    cursor: pointer;
    padding: 6px 10px;

    &:hover,
    &.highlighted {
        background: #e3f2fd;
    }
}
</style>

<template>
    <div class="lpAutocomplete">
        <slot :on-input="onInput" :on-keydown="onKeydown" :on-blur="onBlur" />
        <div v-if="showDropdown && filteredSuggestions.length > 0" class="lpAutocompleteDropdown">
            <div
                v-for="(suggestion, index) in filteredSuggestions"
                :key="index"
                class="lpAutocompleteSuggestion"
                :class="{ highlighted: index === highlightedIndex }"
                @mousedown.prevent="selectSuggestion(suggestion)"
            >
                {{ suggestion }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Autocomplete',
    props: {
        suggestions: {
            type: Array,
            default: () => [],
        },
        value: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            showDropdown: false,
            highlightedIndex: -1,
            query: '',
        };
    },
    computed: {
        filteredSuggestions() {
            if (!this.query || this.query.length < 1) return [];
            const q = this.query.toLowerCase();
            return this.suggestions
                .filter((s) => s.toLowerCase().indexOf(q) !== -1)
                .slice(0, 10);
        },
    },
    methods: {
        onInput(value) {
            this.query = value;
            this.showDropdown = true;
            this.highlightedIndex = -1;
        },
        onKeydown(evt) {
            if (!this.showDropdown || this.filteredSuggestions.length === 0) return;

            if (evt.key === 'ArrowDown') {
                evt.preventDefault();
                this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.filteredSuggestions.length - 1);
            } else if (evt.key === 'ArrowUp') {
                evt.preventDefault();
                this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
            } else if (evt.key === 'Enter' && this.highlightedIndex >= 0) {
                evt.preventDefault();
                this.selectSuggestion(this.filteredSuggestions[this.highlightedIndex]);
            } else if (evt.key === 'Escape') {
                this.showDropdown = false;
            }
        },
        onBlur() {
            this.showDropdown = false;
        },
        selectSuggestion(suggestion) {
            this.$emit('select', suggestion);
            this.showDropdown = false;
            this.query = '';
        },
    },
};
</script>
