<style lang="scss">
@import "../css/_globals";

.checklistItem {
    align-items: center;
    border-bottom: 1px solid #eee;
    display: flex;
    flex-wrap: wrap;
    padding: 8px 10px;

    &.checkStatus-packed {
        background: #e8f5e9;
    }

    &.checkStatus-buyLocal {
        background: #fff3e0;
    }

    &.checkStatus-arranged {
        background: #e3f2fd;
    }

    &.checkStatus-missing {
        background: #ffebee;
    }
}

.checklistItemInfo {
    flex: 1 1 auto;
    min-width: 0;
}

.checklistItemName {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.checklistItemMeta {
    color: #888;
    font-size: 12px;
}

.checklistItemActions {
    display: flex;
    flex: 0 0 auto;
    gap: 4px;
}

.checklistBtn {
    background: #f0f0f0;
    border: 2px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 4px 8px;
    transition: border-color 0.15s;

    &:hover {
        background: #e0e0e0;
    }

    &.active {
        border-color: #333;
    }
}

.checklistNoteRow {
    flex-basis: 100%;
    padding-top: 4px;
}

.checklistNoteInput {
    border: 1px solid #ddd;
    border-radius: 3px;
    font-size: 12px;
    padding: 3px 6px;
    width: 100%;
}
</style>

<template>
    <div :class="'checklistItem checkStatus-' + categoryItem.checkStatus">
        <div class="checklistItemInfo">
            <div class="checklistItemName">{{ item.name }}</div>
            <div class="checklistItemMeta">
                {{ displayWeight }} {{ item.authorUnit }} × {{ categoryItem.qty }}
                <span v-if="item.description"> — {{ item.description }}</span>
            </div>
        </div>
        <div class="checklistItemActions">
            <button class="checklistBtn" :class="{ active: categoryItem.checkStatus === 'packed' }" title="Packed" @click="setStatus('packed')">✅</button>
            <button class="checklistBtn" :class="{ active: categoryItem.checkStatus === 'buyLocal' }" title="Buy locally" @click="setStatus('buyLocal')">🛒</button>
            <button class="checklistBtn" :class="{ active: categoryItem.checkStatus === 'arranged' }" title="Arranged" @click="setStatus('arranged')">📝</button>
            <button class="checklistBtn" :class="{ active: categoryItem.checkStatus === 'missing' }" title="Missing" @click="setStatus('missing')">❌</button>
        </div>
        <div v-if="categoryItem.checkStatus !== 'none'" class="checklistNoteRow">
            <input class="checklistNoteInput" type="text" placeholder="Note (optional)" :value="categoryItem.checkNote" @input="updateNote($event)">
        </div>
    </div>
</template>

<script>
const weightUtils = require('../utils/weight.js');

export default {
    name: 'ItemChecklist',
    props: ['item', 'categoryItem', 'category'],
    computed: {
        displayWeight() {
            return weightUtils.MgToWeight(this.item.weight, this.item.authorUnit);
        },
    },
    methods: {
        setStatus(status) {
            const newStatus = this.categoryItem.checkStatus === status ? 'none' : status;
            this.$store.commit('updateCheckStatus', {
                category: this.category,
                itemId: this.categoryItem.itemId,
                checkStatus: newStatus,
            });
        },
        updateNote(evt) {
            this.$store.commit('updateCheckNote', {
                category: this.category,
                itemId: this.categoryItem.itemId,
                checkNote: evt.target.value,
            });
        },
    },
};
</script>
