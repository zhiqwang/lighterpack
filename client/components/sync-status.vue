<style lang="scss">
.syncStatus {
    align-items: center;
    display: flex;
    font-size: 11px;
    gap: 5px;
    padding: 0 10px;
}

.syncDot {
    border-radius: 50%;
    height: 8px;
    width: 8px;
}

.syncDot-online {
    background: #4caf50;
}

.syncDot-offline {
    background: #f44336;
}

.syncDot-saving {
    animation: pulse 1s infinite;
    background: #ff9800;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}
</style>

<template>
    <span class="syncStatus">
        <span :class="'syncDot syncDot-' + status" />
        <span>{{ statusText }}</span>
    </span>
</template>

<script>
export default {
    name: 'SyncStatus',
    data() {
        return {
            isOnline: navigator.onLine,
        };
    },
    computed: {
        isSaving() {
            return this.$store.state.isSaving;
        },
        status() {
            if (this.isSaving) return 'saving';
            if (!this.isOnline) return 'offline';
            return 'online';
        },
        statusText() {
            if (this.isSaving) return 'Saving...';
            if (!this.isOnline) return 'Offline';
            return 'Saved';
        },
    },
    mounted() {
        window.addEventListener('online', this.updateOnlineStatus);
        window.addEventListener('offline', this.updateOnlineStatus);
    },
    beforeDestroy() {
        window.removeEventListener('online', this.updateOnlineStatus);
        window.removeEventListener('offline', this.updateOnlineStatus);
    },
    methods: {
        updateOnlineStatus() {
            this.isOnline = navigator.onLine;
        },
    },
};
</script>
