package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"time"

	"apigo/web"
)

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func main() {
	addr := flag.String("addr", ":8080", "HTTP 服务监听地址")
	flag.Parse()

	mux := http.NewServeMux()

	// 健康检查接口
	mux.HandleFunc("GET /api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]any{
			"code":    0,
			"message": "ok",
			"time":    time.Now().Format(time.RFC3339),
		})
	})

	// 在线调试 (Try it out) 后端代理接口
	mux.HandleFunc("POST /api/v1/debug/run", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			EndpointID    string `json:"endpointId"`
			UserID        string `json:"userId"`
			IncludeOrders string `json:"includeOrders"`
		}
		_ = json.NewDecoder(r.Body).Decode(&req)
		if req.UserID == "" {
			req.UserID = "usr_9823471"
		}

		writeJSON(w, http.StatusOK, map[string]any{
			"code":      0,
			"message":   "live_debug_success",
			"timestamp": time.Now().UnixMilli(),
			"data": map[string]any{
				"user_id":    req.UserID,
				"nickname":   "Alex Chen",
				"vip_status": true,
			},
		})
	})

	// 挂载前端嵌入式 SPA 静态资源
	spaHandler, err := web.SPAHandler()
	if err != nil {
		log.Fatalf("加载前端静态资源失败: %v", err)
	}
	mux.Handle("/", spaHandler)

	log.Printf("ApiGo 一体化应用已启动: http://localhost%s", *addr)
	if err := http.ListenAndServe(*addr, mux); err != nil {
		log.Fatalf("服务异常退出: %v", err)
	}
}
