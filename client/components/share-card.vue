<style lang="scss">
@import "../css/_globals";

.shareCard {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    max-width: 400px;
    overflow: hidden;
    padding: 20px;
}

.shareCardTitle {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 15px;
}

.shareCardWeights {
    display: flex;
    gap: 12px;
    margin-bottom: 15px;
}

.shareCardWeight {
    flex: 1;
    text-align: center;
}

.shareCardWeightValue {
    font-size: 22px;
    font-weight: 700;
}

.shareCardWeightLabel {
    color: #888;
    font-size: 11px;
    text-transform: uppercase;
}

.shareCardCategories {
    border-top: 1px solid #eee;
    padding-top: 10px;
}

.shareCardCategory {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: 3px 0;
}

.shareCardCategoryColor {
    border-radius: 50%;
    display: inline-block;
    height: 10px;
    margin-right: 6px;
    width: 10px;
}

.shareCardFooter {
    border-top: 1px solid #eee;
    color: #aaa;
    font-size: 11px;
    margin-top: 10px;
    padding-top: 8px;
    text-align: center;
}

.shareCardActions {
    margin-top: 15px;
    text-align: center;
}

#shareCardCanvas {
    display: none;
}
</style>

<template>
    <modal id="shareCardDialog" :shown="shown" @hide="shown = false">
        <h2>Share Card</h2>

        <div ref="shareCardContent" class="shareCard">
            <div class="shareCardTitle">{{ list.name || 'My Pack' }}</div>
            <div class="shareCardWeights">
                <div class="shareCardWeight">
                    <div class="shareCardWeightValue">{{ totalWeight }}</div>
                    <div class="shareCardWeightLabel">Total</div>
                </div>
                <div class="shareCardWeight">
                    <div class="shareCardWeightValue">{{ baseWeight }}</div>
                    <div class="shareCardWeightLabel">Base</div>
                </div>
                <div v-if="list.totalConsumableWeight" class="shareCardWeight">
                    <div class="shareCardWeightValue">{{ consumableWeight }}</div>
                    <div class="shareCardWeightLabel">Consumable</div>
                </div>
                <div v-if="list.totalWornWeight" class="shareCardWeight">
                    <div class="shareCardWeightValue">{{ wornWeight }}</div>
                    <div class="shareCardWeightLabel">Worn</div>
                </div>
            </div>
            <div class="shareCardCategories">
                <div v-for="cat in categoriesData" :key="cat.id" class="shareCardCategory">
                    <span>
                        <span class="shareCardCategoryColor" :style="{ background: cat.color }" />
                        {{ cat.name }}
                    </span>
                    <span>{{ cat.weight }}</span>
                </div>
            </div>
            <div class="shareCardFooter">
                {{ list.totalQty }} items · LighterPack
            </div>
        </div>

        <div class="shareCardActions">
            <a class="lpButton" @click="downloadCard">Download as Image</a>
            <a class="lpButton close" @click="shown = false">Close</a>
        </div>

        <canvas id="shareCardCanvas" ref="canvas" />
    </modal>
</template>

<script>
import modal from './modal.vue';

const weightUtils = require('../utils/weight.js');
const colorUtils = require('../utils/color.js');

export default {
    name: 'ShareCard',
    components: {
        modal,
    },
    data() {
        return {
            shown: false,
        };
    },
    computed: {
        library() {
            return this.$store.state.library;
        },
        list() {
            return this.$store.getters.activeList;
        },
        unit() {
            return this.library.totalUnit;
        },
        totalWeight() {
            return weightUtils.MgToWeight(this.list.totalWeight, this.unit) + ' ' + this.unit;
        },
        baseWeight() {
            return weightUtils.MgToWeight(this.list.totalBaseWeight, this.unit) + ' ' + this.unit;
        },
        consumableWeight() {
            return weightUtils.MgToWeight(this.list.totalConsumableWeight, this.unit) + ' ' + this.unit;
        },
        wornWeight() {
            return weightUtils.MgToWeight(this.list.totalWornWeight, this.unit) + ' ' + this.unit;
        },
        categoriesData() {
            return this.list.categoryIds.map((catId, index) => {
                const cat = this.library.getCategoryById(catId);
                if (!cat) return null;
                const color = cat.color || colorUtils.getColor(index);
                return {
                    id: cat.id,
                    name: cat.name || 'Unnamed',
                    weight: weightUtils.MgToWeight(cat.subtotalWeight, this.unit) + ' ' + this.unit,
                    color: colorUtils.rgbToString(color),
                };
            }).filter(Boolean);
        },
    },
    beforeMount() {
        bus.$on('showShareCard', () => {
            this.shown = true;
        });
    },
    methods: {
        downloadCard() {
            const el = this.$refs.shareCardContent;
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');

            const width = 400;
            const padding = 20;
            const lineHeight = 22;
            const categories = this.categoriesData;
            const height = 160 + (categories.length * lineHeight) + 40;

            canvas.width = width * 2;
            canvas.height = height * 2;
            ctx.scale(2, 2);

            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#333';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(this.list.name || 'My Pack', padding, 35);

            ctx.font = 'bold 16px sans-serif';
            let x = padding;
            const weights = [
                { label: 'Total', value: this.totalWeight },
                { label: 'Base', value: this.baseWeight },
            ];
            if (this.list.totalConsumableWeight) weights.push({ label: 'Consumable', value: this.consumableWeight });
            if (this.list.totalWornWeight) weights.push({ label: 'Worn', value: this.wornWeight });

            let y = 70;
            weights.forEach((w) => {
                ctx.fillStyle = '#333';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText(w.value, x, y);
                ctx.fillStyle = '#888';
                ctx.font = '10px sans-serif';
                ctx.fillText(w.label.toUpperCase(), x, y + 14);
                x += 90;
            });

            y = 110;
            ctx.strokeStyle = '#eee';
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
            y += 15;

            categories.forEach((cat) => {
                ctx.fillStyle = cat.color;
                ctx.beginPath();
                ctx.arc(padding + 5, y - 4, 5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#333';
                ctx.font = '13px sans-serif';
                ctx.fillText(cat.name, padding + 16, y);

                ctx.textAlign = 'right';
                ctx.fillText(cat.weight, width - padding, y);
                ctx.textAlign = 'left';

                y += lineHeight;
            });

            y += 5;
            ctx.fillStyle = '#aaa';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.list.totalQty + ' items · LighterPack', width / 2, y);
            ctx.textAlign = 'left';

            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = (this.list.name || 'pack') + '-share.png';
            link.href = dataUrl;
            link.click();
        },
    },
};
</script>
