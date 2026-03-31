<style lang="scss">
.itemImageGallery {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 10px 0;
}

.itemImageGalleryThumb {
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    height: 60px;
    object-fit: cover;
    width: 60px;
}

.itemImageRemoveBtn {
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    font-size: 12px;
    height: 20px;
    line-height: 20px;
    position: absolute;
    right: -5px;
    text-align: center;
    top: -5px;
    width: 20px;
}

.itemImageThumbContainer {
    display: inline-block;
    position: relative;
}
</style>

<template>
    <div>
        <modal id="itemImageDialog" :shown="shown" @hide="shown = false">
            <div v-if="item && item.images && item.images.length" class="itemImageGallery">
                <div v-for="(img, idx) in item.images" :key="idx" class="itemImageThumbContainer">
                    <img :src="getThumbUrl(img)" class="itemImageGalleryThumb" @click="viewImage(img)">
                    <button class="itemImageRemoveBtn" title="Remove" @click="removeImage(idx)">×</button>
                </div>
            </div>
            <div class="columns">
                <div class="lpHalf">
                    <h2>Add image by URL</h2>
                    <form id="itemImageUrlForm" @submit.prevent="saveImageUrl()">
                        <input id="itemImageUrl" v-model="imageUrl" type="text" placeholder="Image URL">
                        <input type="submit" class="lpButton" value="Save">
                        <a class="lpHref close" @click="shown = false">Cancel</a>
                    </form>
                </div>
                <div class="lpHalf">
                    <h2>Upload image from disk</h2>
                    <p class="imageUploadDescription">
                        Your image will be hosted on imgur.
                    </p>
                    <button id="itemImageUpload" class="lpButton" @click="triggerImageUpload">
                        Upload Image
                    </button>
                    <a class="lpHref close" @click="shown = false">Cancel</a>
                    <p v-if="uploading">
                        Uploading image...
                    </p>
                </div>
            </div>
        </modal>
        <form id="imageUpload" ref="imageUploadForm">
            <input id="image" ref="imageInput" type="file" name="image" @change="uploadImage">
        </form>
    </div>
</template>

<script>
import modal from './modal.vue';

export default {
    name: 'ItemImage',
    components: {
        modal,
    },
    data() {
        return {
            imageUrl: null,
            item: false,
            uploading: false,
            shown: false,
        };
    },
    mounted() {
        bus.$on('updateItemImage', (item) => {
            this.shown = true;
            this.item = item;
            this.imageUrl = '';
        });
    },
    methods: {
        getThumbUrl(img) {
            if (img.image) {
                return `https://i.imgur.com/${img.image}s.jpg`;
            }
            return img.imageUrl || '';
        },
        viewImage(img) {
            let url;
            if (img.image) {
                url = `https://i.imgur.com/${img.image}l.jpg`;
            } else {
                url = img.imageUrl || '';
            }
            bus.$emit('viewItemImage', url);
        },
        removeImage(index) {
            this.$store.commit('removeItemImageByIndex', { item: this.item, index });
            // Keep the old single-image field in sync
            if (this.item.images && this.item.images.length === 0) {
                this.$store.commit('removeItemImage', this.item);
            }
        },
        saveImageUrl() {
            if (!this.imageUrl) return;
            this.$store.commit('addItemImage', {
                item: this.item,
                imageData: { image: '', imageUrl: this.imageUrl, caption: '' },
            });
            // Also update legacy single-image field for backward compat
            this.$store.commit('updateItemImageUrl', { imageUrl: this.imageUrl, item: this.item });
            this.imageUrl = '';
        },
        triggerImageUpload() {
            this.$refs.imageInput.click();
        },
        uploadImage(evt) {
            if (!FormData) {
                alert('Your browser is not supported for file uploads. Please update to a more modern browser.');
                return;
            }
            const file = evt.target.files[0];
            const name = file.name;
            const size = file.size;
            const type = file.type;

            if (name.length < 1) {
                return;
            }
            if (size > 2500000) {
                alert('Please upload a file less than 2.5mb');
                return;
            }
            if (type != 'image/png' && type != 'image/jpg' && !type != 'image/gif' && type != 'image/jpeg') {
                alert('File doesnt match png, jpg or gif.');
                return;
            }
            const formData = new FormData(this.$refs.imageUploadForm);

            this.uploading = true;

            return fetchJson('/imageUpload', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
            })
                .then((response) => {
                    this.uploading = false;
                    const imgId = response.data.id;
                    // Add to multi-image array
                    this.$store.commit('addItemImage', {
                        item: this.item,
                        imageData: { image: imgId, imageUrl: '', caption: '' },
                    });
                    // Also update legacy single-image field
                    this.$store.commit('updateItemImage', { image: imgId, item: this.item });
                }).catch((response) => {
                    this.uploading = false;
                    alert('Upload failed! If this issue persists please file a bug.');
                });
        },
    },
};
</script>
