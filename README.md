# Ghost blog Qiniu storage
> Ghost 博客 1.x 版本图片使用七牛云对象储存
### 如何使用
以 Docker 部署的 1.8.4 版本为例
```
cd ghost/versions/1.8.4/core/server/adapters/storage

git clone https://github.com/superchijinpeng/ghost_blog_qiniu_storage.git ghost-blog-qiniu-storage

npm install
```
### 配置
config.productionn.json
```
  "storage": {
    "active": "ghost-blog-qiniu-storage",
    "ghost-blog-qiniu-storage": {
      "accessKey": "AccessKey",
      "secretKey": "SecretKey",
      "bucket": "对象储存空间名称",
      "origin": "测试域名或对象储存空间所绑定的融合 CDN 加速域名",
      "uploadURL":"上传域名，华东为 http://up.qiniu.com",
      "fileKey": {
        "safeString": true
      }
    }
  },
```
