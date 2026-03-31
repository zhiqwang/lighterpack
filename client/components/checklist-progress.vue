<style lang="scss">
@import "../css/_globals";

.checklistProgress {
    background: #f5f5f5;
    border-radius: 4px;
    margin: 15px 0;
    padding: 15px;
}

.checklistProgressBar {
    background: #e0e0e0;
    border-radius: 10px;
    height: 20px;
    margin-bottom: 10px;
    overflow: hidden;
    position: relative;
}

.checklistProgressFill {
    background: #4caf50;
    border-radius: 10px;
    height: 100%;
    transition: width 0.3s ease;
}

.checklistProgressText {
    font-size: 14px;
    font-weight: 600;
    left: 50%;
    line-height: 20px;
    position: absolute;
    top: 0;
    transform: translateX(-50%);
}

.checklistStats {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
}

.checklistStat {
    align-items: center;
    display: flex;
    font-size: 13px;
    gap: 4px;
}

.checklistStatIcon {
    font-size: 16px;
}
</style>

<template>
    <div class="checklistProgress">
        <div class="checklistProgressBar">
            <div class="checklistProgressFill" :style="{ width: progressPercent + '%' }" />
            <span class="checklistProgressText">{{ progressPercent }}%</span>
        </div>
        <div class="checklistStats">
            <span class="checklistStat">
                <span class="checklistStatIcon">✅</span> {{ stats.packed }} packed
            </span>
            <span class="checklistStat">
                <span class="checklistStatIcon">🛒</span> {{ stats.buyLocal }} buy local
            </span>
            <span class="checklistStat">
                <span class="checklistStatIcon">📝</span> {{ stats.arranged }} arranged
            </span>
            <span class="checklistStat">
                <span class="checklistStatIcon">❌</span> {{ stats.missing }} missing
            </span>
            <span class="checklistStat">
                <span class="checklistStatIcon">⬜</span> {{ stats.none }} remaining
            </span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ChecklistProgress',
    props: ['list'],
    computed: {
        library() {
            return this.$store.state.library;
        },
        stats() {
            const result = {
                packed: 0, buyLocal: 0, arranged: 0, missing: 0, none: 0, total: 0,
            };
            this.list.categoryIds.forEach((catId) => {
                const category = this.library.getCategoryById(catId);
                if (category) {
                    category.categoryItems.forEach((ci) => {
                        result.total++;
                        switch (ci.checkStatus) {
                        case 'packed': result.packed++; break;
                        case 'buyLocal': result.buyLocal++; break;
                        case 'arranged': result.arranged++; break;
                        case 'missing': result.missing++; break;
                        default: result.none++; break;
                        }
                    });
                }
            });
            return result;
        },
        progressPercent() {
            if (this.stats.total === 0) return 0;
            const checked = this.stats.total - this.stats.none;
            return Math.round((checked / this.stats.total) * 100);
        },
    },
};
</script>
