fis-parser-jade-to-html
===============

A parser for fis to compile jade file.
Output html

## 功能

 - complie jade template to html file
 - Automatically resolve the path of resource include by 'extend', 'include' commands

## 用法

### 安装插件

    $ npm ssssss--save-dev

### 启用插件

```javascript
fis.match('test.jade', {
	parser: fis.plugin('jade-to-html', {
		pretty: true,
		// variables you want to give to the template complie function, JSON Format.
		data: headerVars
	}),
	rExt: 'html'
})
```

test_merge_fork