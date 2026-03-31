<style lang="scss">
@import "../css/_globals";

.wizardTemplateList {
    max-height: 300px;
    overflow-y: auto;
}

.wizardTemplateItem {
    align-items: center;
    display: flex;
    gap: 6px;
    padding: 4px 0;
}

.wizardSection {
    margin-bottom: 15px;
}
</style>

<template>
    <modal id="newListWizard" :shown="shown" @hide="shown = false">
        <h2>Create List from Template</h2>

        <div class="wizardSection">
            <label for="wizardListName"><b>List Name:</b></label>
            <input id="wizardListName" v-model="listName" type="text" placeholder="e.g., Weekend Hike">
        </div>

        <div class="wizardSection">
            <h3>Select categories to include:</h3>
            <div class="wizardTemplateList">
                <div v-for="(cat, index) in presetCategories" :key="index" class="wizardTemplateItem">
                    <label>
                        <input type="checkbox" :checked="selectedCategories[index]" @change="toggleCategory(index)">
                        {{ cat }}
                    </label>
                </div>
            </div>
        </div>

        <a class="lpButton" @click="createFromTemplate">Create List</a>
        <a class="lpButton close" @click="shown = false">Cancel</a>
    </modal>
</template>

<script>
import modal from './modal.vue';

const presetCategories = require('../presets/categories.js');

export default {
    name: 'NewListWizard',
    components: {
        modal,
    },
    data() {
        return {
            shown: false,
            listName: '',
            presetCategories,
            selectedCategories: {},
        };
    },
    beforeMount() {
        bus.$on('newListWizard', () => {
            this.shown = true;
            this.listName = '';
            this.selectedCategories = {};
            this.presetCategories.forEach((cat, index) => {
                this.$set(this.selectedCategories, index, true);
            });
        });
    },
    methods: {
        toggleCategory(index) {
            this.$set(this.selectedCategories, index, !this.selectedCategories[index]);
        },
        createFromTemplate() {
            const library = this.$store.state.library;
            const list = library.newList();
            list.name = this.listName || 'New List';

            this.presetCategories.forEach((catName, index) => {
                if (this.selectedCategories[index]) {
                    const category = library.newCategory({ list });
                    category.name = catName;
                    library.newItem({ category });
                }
            });

            if (list.categoryIds.length === 0) {
                const category = library.newCategory({ list });
                library.newItem({ category });
            }

            list.calculateTotals();
            library.defaultListId = list.id;
            this.shown = false;
            this.$store.commit('save');
        },
    },
};
</script>
