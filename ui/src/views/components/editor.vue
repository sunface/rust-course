<template>
  <div  class="component-editor">   
       <mavon-editor ref="areditor"  :style="{height:editorHeight}" :language="$store.state.misc.lang" :value="md" :ishljs = "true" :toolbars="toolbars" :toolbarsFlag="toolbarsShow" :tabSize="2" @change="setMD" :subfield="false" @imgAdd="imgAdd" :placeholder="placeholder"></mavon-editor>
  </div>
</template>

<script>
export default {
  props: ['md','parent','editorHeight',"placeholder","toolbarsShow"],
  data() {
    return {
        toolbars: {
            bold: false, // 粗体
            italic: true, // 斜体
            header: false, // 标题
            underline: true, // 下划线
            strikethrough: true, // 中划线
            mark: true, // 标记
            superscript: true, // 上角标
            subscript: true, // 下角标
            quote: false, // 引用
            ol: false, // 有序列表
            ul: false, // 无序列表
            link: true, // 链接
            imagelink: true, // 图片链接
            code: true, // code
            table: true, // 表格
            /* 2.1.8 */
            alignleft: true, // 左对齐
            aligncenter: true, // 居中
            alignright: true, // 右对齐
            help: true
        },
        mdSetted: false
    };
  },
  watch: {
  },
  methods: {
    setMD(md,render) {
      var _this = this
      if (!this.mdSetted) {
        setTimeout(function() {
          _this.mdSetted = true
          _this.$emit(_this.parent + 'SetMD',md,_this.$refs.areditor.d_render) 
        },200)
      } else {
        this.$emit(this.parent + 'SetMD',md,this.$refs.areditor.d_render) 
      }     
    },
   imgAdd: function(fn, _) {
      // this.$refs.areditor.$img2Url(fn, "http://test.ccd");
    },
  },
  mounted() {
  }
};
</script>
