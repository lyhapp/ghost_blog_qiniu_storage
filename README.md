# Ghost blog Qiniu storage
> Ghost 博客 1.x 版本图片使用七牛云对象储存
### 如何使用
以 Docker 部署的 1.8.4 版本为例
```shell
cd ghost/versions/1.8.4/core/server/adapters/storage

git clone https://github.com/superchijinpeng/ghost_blog_qiniu_storage.git ghost-blog-qiniu-storage
```
### 配置
config.productionn.json
```json
  "storage": {
    "active": "ghost-blog-qiniu-storage",
    "ghost-blog-qiniu-storage": {
      "accessKey": "j3spSv84WHu3lnONrUoKkC6DDhdELpS_TXBaaJPP",
      "secretKey": "7x286hUkBWqCKtVbgrKk1D3P4ssDox1IiK8Od2z7",
      "bucket": "test",
      "origin": "http://ovyu0e0d8.bkt.clouddn.com",
      "uploadURL":"http://up.qiniu.com",
      "fileKey": {
        "safeString": true
      }
    }
  },
```
