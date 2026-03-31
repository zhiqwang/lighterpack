<style lang="scss">
@import "../css/_globals";

.checklistCategory {
    margin-bottom: 20px;
}

.checklistCategoryHeader {
    background: #f0f0f0;
    border-radius: 4px 4px 0 0;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 10px;
}
</style>

<template>
    <div class="checklistCategory">
        <div class="checklistCategoryHeader">{{ category.name || 'Unnamed Category' }}</div>
        <item-checklist
            v-for="ci in categoryItems"
            :key="ci.categoryItem.itemId"
            :item="ci.item"
            :category-item="ci.categoryItem"
            :category="category"
        />
    </div>
</template>

<script>
import itemChecklist from './item-checklist.vue';

export default {
    name: 'CategoryChecklist',
    components: {
        itemChecklist,
    },
    props: ['category'],
    computed: {
        library() {
            return this.$store.state.library;
        },
        categoryItems() {
            return this.category.categoryItems
                .map((ci) => ({
                    categoryItem: ci,
                    item: this.library.getItemById(ci.itemId),
                }))
                .filter((ci) => ci.item);
        },
    },
};
</script>
