<template>
    <view>
        <view>
            <text style="font-size: 50rpx;color: #333;">
                404 Page Not Found
            </text>
        </view>
        <view>
            <text style="font-size: 32rpx;color: #999;">
                {{errMsg}}
            </text>
        </view>
    </view>
</template>

<script>
    export default {
        data() {
            return {

            }
        },
        onLoad(query) {
            this.errMsg = query.errMsg || ''
        },
        methods: {

        }
    }
</script>

<style>

</style>
