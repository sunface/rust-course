<template>
  <div class="home markdown">
      <el-row>
          <el-col :span="24" :offset="0">
                <div class="tags no-border">
                         <el-input size="small" v-model="tempArticle.title"  class="inline-input" placeholder="Title" style="width:200px" @blur="setTitle"></el-input>
                        <el-select class="margin-left-10" size="small" v-model="tempArticle.tags" multiple filterable remote placeholder="Tags" @change="setTags" :remote-method="queryTags" :loading="tagsLoading" allow-create default-first-option style="width:300px">
                         <el-option v-for="item in tags" :key="item" :label="item" :value="item"></el-option>
                        </el-select>

                        <el-select
                        v-model="tempArticle.lang"
                        placeholder="lang for article"
                        size="small"
                        style="width:150px"
                        >
                        <el-option  v-for="o in langOptions" :key="o.label" :label="o.label" :value="o.value"></el-option>
                        </el-select>
                    <span>
                         <el-button size="medium" class="border-ellipse background-grey" @click="preview">PREVIEW</el-button>
                        <el-button size="medium" class="border-ellipse background-grey" @click="saveNew(1)" v-show="tempArticle.status == 1 || mode=='new'">SAVE DRAFT</el-button>
                         <el-button size="medium" class="border-ellipse background-grey" @click="saveChanges" v-show="tempArticle.status == 2">SAVE CHANGES</el-button>
                        <el-button size="medium" type="primary" class="border-ellipse"  @click="saveNew(2)" v-show="tempArticle.status != 2">PUBLISH</el-button>
                    </span>

                    <span class="float-right margin-top-5 margin-right-10" style="font-size:18px">
                       <el-tooltip content="Revert to the previous save" class="margin-right-15" v-show="mode=='edit'"><i class="el-icon-back hover-cursor" @click="clearChanges" ></i></el-tooltip>
                       <el-tooltip content="Delete this post" v-show="mode=='edit'"><i class="el-icon-delete hover-cursor"></i></el-tooltip>
                    </span>
                </div>
          </el-col>
          <el-col :span="12">
            <editor :editorHeight="editorHeight" class="margin-top-5" parent="article" :md="tempArticle.md" @articleSetMD="articleSetMD"></editor>
          </el-col>
          <el-col :span="12"  v-if="previewReset" class="margin-top-5" style="border:1px solid #eee;border-bottom:none;border-right:none;">
              <render  id ="render-content" :content="tempArticle.render" :style="{'height':editorHeight,'overflow-y':'scroll'}" ></render>
          </el-col>
      </el-row>
       
      
  </div>
</template> 
 
<script>
import request from "@/utils/request";
import render from "../components/render"
import editor from "../components/editor"
import langOptions from "@/utils/data"
export default {
  components: {render,editor},
  data () {
    return {
        tagsLoading: false,
        tags: [],
        allTags: ['go','golang','rust','java','javascript'], // query tags from remote server
        tempArticle: {
            title: '',
            tags: [],
            md :'',
            render: '',
            lang: this.$store.state.misc.lang
        },
        tempRender :'',
        previewReset: false,
        editorHeight: 'calc(100vh - 125px)',
        localStoreID : window.location.origin + window.location.pathname,

        // for edit only
        mode: 'new',
        arID: '',

        langOptions: langOptions,
        previewed : false
    }
  },  
  watch: {
  }, 
  computed: {
  },
  methods: {
    clearChanges() {
        request({
        url: "/web/article/beforeEdit",
        method: "GET",
        params: {
            article_id: this.arID
        }
        }).then(res => {
            this.tempArticle = res.data.data
            localStorage.removeItem(this.localStoreID)
        });
    },
    articleSetMD(md,render) {
        this.tempArticle.md = md
        // console.log(render)
        this.tempRender = render
        localStorage.setItem(this.localStoreID, JSON.stringify(this.tempArticle))
    },
    preview() {
        request({
            url: "/web/post/preview",
            method: "POST",
            params: {
                render: this.tempRender
            }
        }).then(res => {
            this.tempArticle.render = res.data.data
            this.previewReset = true
            // make the render area scroll to bottom
            if (this.previewed) {
                setTimeout(function() {
                    var r = document.getElementById('render-content')
                    r.scrollTop = r.scrollHeight
                } ,300)
            } else {
                this.previewed = true
            }
        });
    },
    saveChanges() {
        if (this.tempArticle.title == '') {
            this.$message.error('Title cant be blank')
            return 
        }

        this.tempArticle.render = this.tempRender
         request({
            url: "/web/article/saveChanges",
            method: "POST",
            params: {
                content: JSON.stringify(this.tempArticle)
            }
        }).then(res => {
            localStorage.removeItem(this.localStoreID)
            this.$router.push('/' + res.data.data)
        });
    },
    saveNew(opType) {
        if (this.tempArticle.title == '') {
            this.$message.error('Title cant be blank')
            return 
        }

        this.tempArticle.render = this.tempRender
        request({
            url: "/web/article/saveNew",
            method: "POST",
            params: {
                type: opType,
                content: JSON.stringify(this.tempArticle)
            }
        }).then(res => {
            localStorage.removeItem(this.localStoreID)
            this.$router.push('/' + res.data.data)
        });
    },
    setTags(val) {
        if (this.tempArticle.tags.length!=0) {
            var last = this.tempArticle.tags[this.tempArticle.tags.length-1]
            if (last.trim() == '') {
                this.$message.warning("tag cant be blank")
                 this.tempArticle.tags.pop()
                 return 
            }
        }
        if (this.tempArticle.tags.length > 3) {
            this.$message.warning("tags length is limited to 3")
            this.tempArticle.tags.pop()
            return 
        }
        localStorage.setItem(this.localStoreID, JSON.stringify(this.tempArticle))
    },
    setTitle() {
        localStorage.setItem(this.localStoreID, JSON.stringify(this.tempArticle))
    },
    queryTags(q) {
        if (q !== '') {
          this.tagsLoading = true;
          setTimeout(() => {
            this.tagsLoading = false;
            this.tags = this.allTags.filter(item => {
              return item.toLowerCase()
                .indexOf(q.toLowerCase()) > -1;
            });
          }, 200);
        } else {
          this.tags = [];
        }
      }
  },
  mounted() { 
    if (this.mode == 'new') {
        var ar = localStorage.getItem(this.localStoreID)
        if (ar != null) {
            this.tempArticle = JSON.parse(ar)
        }
    }
  },
  created() {
    this.arID = this.$route.params.arID;
    if (this.arID != undefined) {
        this.mode = 'edit'
        // check ar already in cache
        var ar = localStorage.getItem(this.localStoreID)
        if (ar != null) {
            this.tempArticle = JSON.parse(ar)
        } else {
            request({
            url: "/web/article/beforeEdit",
            method: "GET",
            params: {
                article_id: this.arID
            }
            }).then(res => {
                this.tempArticle = res.data.data
            });
        }
    } 
  },
} 
</script>

<style lang="less">
.tags {
    .el-input.el-input--suffix input{
        background-color: #f5f6f7;
        border-radius: 100px
    }
}
</style>