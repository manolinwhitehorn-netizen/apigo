package web

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"
)

//go:embed all:dist
var distEmbedFS embed.FS

// DistFS 返回前端构建产物的文件系统 (去除 dist 前缀)
func DistFS() (fs.FS, error) {
	return fs.Sub(distEmbedFS, "dist")
}

// SPAHandler 返回支持前端单页应用路由回退的 http.Handler
func SPAHandler() (http.Handler, error) {
	subFS, err := DistFS()
	if err != nil {
		return nil, err
	}
	fileServer := http.FileServer(http.FS(subFS))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/")
		if path == "" {
			path = "index.html"
		}
		if _, err := fs.Stat(subFS, path); err != nil {
			// SPA 前端路由回退至 index.html
			r.URL.Path = "/"
		}
		fileServer.ServeHTTP(w, r)
	}), nil
}
