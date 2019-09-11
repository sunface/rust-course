<template>
  <div  class="render">
    <div class="content markdown-body" id="render-content" v-html="content"  @click="viewImg" :style="{'padding-top':paddingTop,'padding-left':paddingLeft}"></div>
    <!-- <el-dialog class="white-bg-modal image-modal" :visible.sync="imageModalVisible" top="5vh" width="100%">
      <el-row align="middle" justify="center" @click.native="cancelViewImage">
          <el-col :xs="{span:24,offset:0}" :sm="{span:24,offset:0}" :md="{span: 24,offset:0}" :lg="{ span: 24, offset: 0 }">
          <img :src="currentImg" alt="" width="100%" />
          </el-col>
      </el-row>
    </el-dialog>     -->
  </div>
</template>

<script>
export default {
  props: ['content','paddingTop','paddingLeft'],
  data() {
    return {
      imageModalVisible: false,
      currentImg: ''
    };
  },
  watch: {
  },
  methods: {
    viewImg: function(e) {
      if (e.srcElement.localName == "img") {
        this.imageModalVisible = true;
        this.currentImg = e.srcElement.currentSrc;
      }
    },
    cancelViewImage() {
      this.imageModalVisible = false
    }
  },
  mounted() {
  }
};
</script>

<style lang="less">
@import "../../theme/md_render.css";
</style>