<style lang="scss">
@import "../css/_globals";

#listDescriptionContainer {
    margin: 25px 0;

    h3,
    p {
        display: inline-block;
        margin: 0 0 5px;
    }

    h3 {
        margin-right: 10px;
    }

    textarea {
        height: 65px;
        width: 100%;
    }
}

#getStarted {
    background: darken($background1, 10%);
    display: flex;
    flex-direction: column;
    height: 220px;
    justify-content: center;
    line-height: 1.6;
    padding: $spacingLarge;

    h2 {
        font-size: 24px;
        line-height: 1;
    }

    h2,
    p,
    ol {
        margin: 0 0 $spacingMedium;

        &:last-child {
            margin-bottom: 0;
        }
    }
}

.lpCheckModeToggle {
    align-items: center;
    display: flex;
    gap: 15px;
    margin: 15px 0 5px;
}

.lpCheckModeLabel {
    align-items: center;
    cursor: pointer;
    display: flex;
    font-weight: 600;
    gap: 6px;
}

.lpResetChecklist {
    cursor: pointer;
    font-size: 13px;
}

</style>

<template>
    <div class="lpListBody">
        <div v-if="isListNew" id="getStarted">
            <h2>Welcome to LighterPack!</h2>
            <p>Here's what you need to get started:</p>
            <ol>
                <li>Click on things to edit them. Give your list and category a name.</li>
                <li>Add new categories and give items weights to start the visualization.</li>
                <li v-if="!isLocalSaving">
                    When you're done, share your list with others!
                </li>
            </ol>
            <p v-if="isLocalSaving" class="lpWarning">
                <strong>Note:</strong> Your data is being saved to your local computer. In order to share your lists please register an account.
            </p>
        </div>
        <list-summary v-if="!isListNew" :list="list" />

        <div class="lpCheckModeToggle">
            <label class="lpCheckModeLabel">
                <input type="checkbox" :checked="list.checkMode" @change="toggleCheckMode">
                <span>📋 Check Mode</span>
            </label>
            <a v-if="list.checkMode" class="lpResetChecklist lpHref" @click="resetChecklist">Reset checklist</a>
        </div>

        <checklist-progress v-if="list.checkMode" :list="list" />

        <div style="clear: both;" />

        <div v-if="library.optionalFields['listDescription']" id="listDescriptionContainer">
            <h3>List Description</h3> <p>(<a href="https://guides.github.com/features/mastering-markdown/" target="_blank" class="lpHref">Markdown</a> supported)</p>
            <textarea id="listDescription" v-model="list.description" @input="updateListDescription" />
        </div>

        <template v-if="list.checkMode">
            <category-checklist v-for="category in categories" :key="category.id" :category="category" />
        </template>
        <template v-else>
            <ul class="lpCategories">
                <category v-for="category in categories" :key="category.id" :category="category" />
            </ul>

            <hr>

            <a class="lpAdd addCategory" @click="newCategory"><i class="lpSprite lpSpriteAdd" />Add new category</a>
        </template>
    </div>
</template>

<script>
import category from './category.vue';
import listSummary from './list-summary.vue';
import checklistProgress from './checklist-progress.vue';
import categoryChecklist from './category-checklist.vue';

const dragula = require('dragula');

export default {
    name: 'List',
    components: {
        listSummary,
        category,
        checklistProgress,
        categoryChecklist,
        categoryDragStartIndex: false,
        itemDragId: false,
    },
    mixins: [],
    data() {
        return {
            onboardingCompleted: false,
            itemDrake: null,
        };
    },
    computed: {
        library() {
            return this.$store.state.library;
        },
        list() {
            return this.$store.getters.activeList;
        },
        categories() {
            return this.list.categoryIds.map((id) => this.library.getCategoryById(id));
        },
        isListNew() {
            return this.list.totalWeight === 0;
        },
        isLocalSaving() {
            return this.$store.state.saveType === 'local';
        },
    },
    watch: {
        categories() {
            Vue.nextTick(() => {
                this.handleItemReorder();
            });
        },
    },
    mounted() {
        this.handleCategoryReorder();
        this.handleItemReorder();
    },
    methods: {
        newCategory() {
            this.$store.commit('newCategory', this.list);
        },
        updateListDescription() {
            this.$store.commit('updateListDescription', this.list);
        },
        toggleCheckMode() {
            this.$store.commit('setCheckMode', { listId: this.list.id, checkMode: !this.list.checkMode });
        },
        resetChecklist() {
            const callback = function () {
                this.$store.commit('resetChecklist', this.list.id);
            };
            bus.$emit('initSpeedbump', callback, {
                body: 'Are you sure you want to reset the checklist? All check statuses and notes will be cleared.',
            });
        },
        handleItemReorder() {
            if (this.itemDrake) {
                this.itemDrake.destroy();
            }
            const $categoryItems = Array.prototype.slice.call(document.getElementsByClassName('lpItems'));
            const drake = dragula($categoryItems, {
                moves($el, $source, $handle, $sibling) {
                    return $handle.classList.contains('lpItemHandle');
                },
                accepts($el, $target, $source, $sibling) {
                    if (!$sibling || $sibling.classList.contains('lpItemsHeader')) {
                        return false; // header and footer are technically part of this list - exclude them both.
                    }
                    return true;
                },
            });
            drake.on('drag', ($el, $target, $source, $sibling) => {
                this.itemDragId = parseInt($el.id); // fragile
            });
            drake.on('drop', ($el, $target, $source, $sibling) => {
                const categoryId = parseInt($target.parentElement.id); // fragile
                this.$store.commit('reorderItem', {
                    list: this.list, itemId: this.itemDragId, categoryId, dropIndex: getElementIndex($el) - 1,
                });
                drake.cancel(true);
            });
            this.itemDrake = drake;
        },
        handleCategoryReorder() {
            const $categories = document.getElementsByClassName('lpCategories')[0];
            const drake = dragula([$categories], {
                moves(el, $source, $handle, $sibling) {
                    return $handle.classList.contains('lpCategoryHandle');
                },
            });
            drake.on('drag', ($el, $target, $source, $sibling) => {
                this.categoryDragStartIndex = getElementIndex($el);
            });
            drake.on('drop', ($el, $target, $source, $sibling) => {
                this.$store.commit('reorderCategory', { list: this.list, before: this.categoryDragStartIndex, after: getElementIndex($el) });
                drake.cancel(true);
            });
        },
    },
};
</script>
