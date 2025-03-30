---
title: git常用命令与使用方法整理
date: 2025-3-30 11:00
categories: 
	- [CS]
	#- [cate2]
	#...
tags: 
	- git
	#- tag2
	#...

#If you need a thumbnail photo for your post, delete the well number below and finish the directory.
cover: https://i.postimg.cc/28XWVWqF/temp-Imagegqh-N1-F.avif
thumbnail: https://i.postimg.cc/28XWVWqF/temp-Imagegqh-N1-F.avif

#If you need to customize your excerpt, delete the well number below and input something. You can also input <!-- more --> in your article to divide the excerpt and other contents.
excerpt: 忙里偷闲整理一下。

#If you don't want to show the ToC (Table of Content) at sidebar, delete the well number below. 
#toc: false

#You can begin to input your article below now.

---

## 常用命令

这里根据git在使用上的时间顺序对常用命令进行整理。

### 配置用户信息

```shell
# 配置用户名
git config --global user.name "yourname"

# 配置用户邮箱
git config --global user.email "youremail@xxx.com"

# 查看当前的配置信息
git config --global --list
```

### 初始化仓库并关联远程分支

```shell
# 将文件夹初始化git仓库
git init

# 关联本地 git init 到远程仓库
git remote add origin <git url>

# 新增其他上游仓库
git remote add <git url>

# 移除与远程仓库的管理
git remote remove <git url>

# 修改推送源
git remote set-url origin <git url>
```

### 克隆远程仓库

```shell
# 克隆远端仓库到本地
git clone <git url>

# 克隆远端仓库到本地，并同时切换到指定分支 branch1
git clone <git url> -b branch1

# 克隆远端仓库到本地并指定本地仓库的文件夹名称为 my-project
git clone <git url> my-project
```

### 提交修改并将其推送至远程仓库

#### 将修改提交到暂存区

```shell
# 将所有修改的文件都提交到暂存区
git add .

# 将修改的文件中的指定的文件 a.js 和 b.js 提交到暂存区
git add ./a.js ./b.js

# 将 js 文件夹下修改的内容提交到暂存区
git add ./js
```

#### 将修改从暂存区回退到工作区

```shell
# 将 a.js 文件取消缓存（取消 add 操作，不改变文件内容）
git reset --staged a.js

# 将所有文件取消缓存
git reset --staged .
```

#### 从暂存区将修改提交到本地仓库

```shell
# 将工作区内容提交到本地仓库，并添加提交信息 your commit message
git commit -m "your commit message"

# 将工作区内容提交到本地仓库，并对上一次 commit 记录进行覆盖
# 例如先执行 git commit -m "commit1" 提交了文件a，commit_sha为hash1；再执行 git commit -m "commit2" --amend 提交文件b，commit_sha为hash2。最终显示的是a，b文件的 commit 信息都是 "commit2"，commit_sha都是hash2
git commit -m "new message" --amend

# 将工作区内容提交到本地仓库，并跳过 commit 信息填写
# 例如先执行 git commit -m "commit1" 提交了文件a，commit_sha为hash1；再执行 git commit --amend --no-edit 提交文件b，commit_sha为hash2。最终显示的是a，b文件的 commit 信息都是 "commit1"，commit_sha都是hash1
git commit --amend --no-edit

# 跳过校验直接提交，很多项目配置 git hooks 验证代码是否符合 eslint、husky 等规则，校验不通过无法提交
# 通过 --no-verify 可以跳过校验（为了保证代码质量不建议此操作QwQ）
git commit --no-verify -m "commit message"

# 一次性从工作区提交到本地仓库，相当于 git add . + git commit -m
git commit -am
```

#### 撤销提交

```shell
# 将某个版本的 commit 从本地仓库退回到工作区（取消 commit 和 add 操作，不改变文件内容）
# 默认不加 -- 参数时时 mixed
git reset --mixed <commit_sha>

# 将某个版本的 commit 从本地仓库退回到缓存区（取消 commit 操作，不取消 add，不改变文件内容）
git reset --soft <commit_sha>

# 取消某次 commit 的记录（取消 commit 和 add，且改变文件内容）
git reset --hard <commit_sha>

# 以上三种操作退回了 commit，都是退回本地仓库的 commit，没有改变远程仓库的 commit。通常再次修改后配合如下命令覆盖远程仓库的 commit：
git push -f

# 取消某次 commit 内容，但是保留 commit 记录
git revert <commit-sha>
```

#### 将提交推送到远程仓库

```shell
# 将当前本地分支 branch1 内容推送到远程分支 origin/branch1
git push

# 若当前本地分支 branch1，没有对应的远程分支 origin/branch1，需要为推送当前分支并建立与远程上游的跟踪
git push --set-upstream origin branch1

# 强制提交
# 例如用在代码回滚后内容
git push -f
```

### 分支管理

```shell
# 切换到已有的本地分支 branch1
git checkout branch1

# 切换到远程分支 branch1
git checkout origin/branch1

# 基于当前本地分支创建一个新分支 branch2，并切换至 branch2
git checkout -b branch2

# 基于远程分支 branch1 创建一个新分支 branch2，并切换至 branch2
git checkout origin/branch1 -b branch2

# 当前创建的 branch2 关联的上游分支是 origin/branch1，所以 push 时需要如下命令关联到远程 branch2
git push --set-upstream origin branch2

# 删除分支
git branch -D <分支名>

# 重命名分支
git branch -M <老分支名> <新分支名>

# 将本地分支与远程分支关联
git branch --set-upstream-to=origin/xxx

# 取消本地分支与远程分支的关联
git branch --unset-upstream-to=origin/xxx
```

### 状态检查

```shell
# 查看当前工作区暂存区变动
git status 

# 以概要形式查看工作区暂存区变动
git status -s 

# 查询工作区中是否有 stash 缓存
git status --show-stash

# 显示 commit 日志
git log

# 以简要模式显示 commit 日志
git log --oneline

# 显示最近 n 次的 commit 日志
git log -n

# 显示 commit 及分支的图形化变更
git log --graph --decorate
```

### 重新建立索引

```shell
# 删除某个文件索引（不会更改本地文件，只会是 .gitignore 范围重新生效）
git rm --cache -- <文件名>

# 清除所有文件的索引
# 例如你首次提交了很多文件，后来你建立了一个 .gitignore 文件，有些文件不想推送到远端仓库，但此时有的文件已经被推送了
# 使用此命令可以是 .gitignore 重新作用一遍，从远程仓库中取消这些文件，但不会更改你本地文件
git rm -r --cached .
```

## 配置ssh-key并使用ssh登录

使用下面的命令生成ssh-key。

```shell
ssh-keygen -t ed25519 -C "your_email@example.com"
```

然后将得到的公钥`xxx.pub`中的内容利用`cat`命令打印到终端上，复制后添加到Github上。完成之后，在`~/.ssh/config`中添加下面的内容。

```shell
Host github.com
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519
```

使用下面的命令测试，如果出现了注释中的内容则说明配置成功。

```shell
ssh -T -p 443 git@ssh.github.com
# Hi USERNAME! You've successfully authenticated, but GitHub does not
# provide shell access.
```

## 将git仓库与.git文件夹分离

对于任意一个git仓库，都可以将其中的`.git`文件夹放在其他位置，但仍然保持这个路径是一个git仓库。在将原仓库中的`.git`文件夹移动到`$DOT_GIT_PATH`后，只需要在原仓库下新建一个`.git`文件，其中的内容为：

```
gitdir: $DOT_GIT_PATH
```

强烈建议在`$DOT_GIT_PATH`下不要有其他文件或文件夹。
