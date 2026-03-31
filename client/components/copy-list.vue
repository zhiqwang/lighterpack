<style lang="scss">
@import "../css/_globals";

.copyListItem {
    border-bottom: 1px solid #eee;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    padding: 8px 10px;

    &:hover {
        background: #f5f5f5;
    }

    &.selected {
        background: #e3f2fd;
        font-weight: 600;
    }
}

.copyListItemName {
    flex: 1;
}

.copyListItemMeta {
    color: #888;
    font-size: 12px;
    text-align: right;
}

.copyListSelector {
    max-height: 300px;
    overflow-y: auto;
}

.copyListExcludeSection {
    margin-top: 15px;
    max-height: 200px;
    overflow-y: auto;
}

.copyListExcludeItem {
    align-items: center;
    display: flex;
    gap: 6px;
    padding: 4px 0;
}
</style>

<template>
    <modal id="copyListDialog" :shown="shown" @hide="shown = false">
        <h2>Choose the list to copy</h2>
        <div class="copyListSelector">
            <div
                v-for="list in listsWithDetails"
                :key="list.id"
                class="copyListItem"
                :class="{ selected: listId === list.id }"
                @click="selectList(list.id)"
            >
                <span class="copyListItemName">{{ list.name || 'New list' }}</span>
                <span class="copyListItemMeta">
                    {{ list.itemCount }} items · {{ list.displayWeight }}
                </span>
            </div>
        </div>

        <div v-if="listId && selectedListCategories.length" class="copyListExcludeSection">
            <h3>Include categories:</h3>
            <div v-for="cat in selectedListCategories" :key="cat.id" class="copyListExcludeItem">
                <label>
                    <input type="checkbox" :checked="!excludedCategories[cat.id]" @change="toggleExclude(cat.id)">
                    {{ cat.name || 'Unnamed' }} ({{ cat.itemCount }} items)
                </label>
            </div>
        </div>

        <br>
        <p class="lpWarning">
            <b>Note:</b> Copying a list will link the items between your lists. Updating an item in one list will alter that item in all other lists that item is in.
        </p>
        <a id="copyConfirm" class="lpButton" @click="copyList">Copy List</a>
        <a class="lpButton close" @click="shown = false">Cancel</a>
    </modal>
</template>

<script>
import modal from './modal.vue';

const weightUtils = require('../utils/weight.js');

export default {
    name: 'CopyList',
    components: {
        modal,
    },
    data() {
        return {
            listId: false,
            shown: false,
            excludedCategories: {},
        };
    },
    computed: {
        library() {
            return this.$store.state.library;
        },
        listsWithDetails() {
            return this.library.lists.map((list) => {
                let itemCount = 0;
                list.categoryIds.forEach((catId) => {
                    const cat = this.library.getCategoryById(catId);
                    if (cat) itemCount += cat.categoryItems.length;
                });
                list.calculateTotals();
                return {
                    id: list.id,
                    name: list.name,
                    itemCount,
                    displayWeight: weightUtils.MgToWeight(list.totalWeight, this.library.totalUnit) + ' ' + this.library.totalUnit,
                };
            });
        },
        selectedListCategories() {
            if (!this.listId) return [];
            const list = this.library.getListById(this.listId);
            if (!list) return [];
            return list.categoryIds.map((catId) => {
                const cat = this.library.getCategoryById(catId);
                return {
                    id: catId,
                    name: cat ? cat.name : '',
                    itemCount: cat ? cat.categoryItems.length : 0,
                };
            });
        },
    },
    beforeMount() {
        bus.$on('copyList', () => {
            this.shown = true;
            this.listId = false;
            this.excludedCategories = {};
        });
    },
    methods: {
        selectList(id) {
            this.listId = id;
            this.excludedCategories = {};
        },
        toggleExclude(catId) {
            if (this.excludedCategories[catId]) {
                this.$delete(this.excludedCategories, catId);
            } else {
                this.$set(this.excludedCategories, catId, true);
            }
        },
        copyList() {
            if (!this.listId) return;
            const excludeIds = Object.keys(this.excludedCategories).map(Number);
            this.$store.commit('copyList', { listId: this.listId, excludeCategories: excludeIds });
            this.shown = false;
        },
    },
};
</script>
