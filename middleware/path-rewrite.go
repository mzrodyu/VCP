package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
)

// v1PathPrefixes 定义需要自动补全 /v1 前缀的路径（OpenAI 兼容接口）
var v1PathPrefixes = []string{
	"/chat/completions",
	"/completions",
	"/embeddings",
	"/images/generations",
	"/images/edits",
	"/images/variations",
	"/audio/transcriptions",
	"/audio/translations",
	"/audio/speech",
	"/models",
	"/moderations",
	"/edits",
	"/rerank",
	"/messages",
	"/responses",
	"/realtime",
	"/files",
	"/fine-tunes",
	"/engines/",
}

// v1betaPathPrefixes 定义需要自动补全 /v1beta 前缀的路径（Gemini 原生接口）
var v1betaPathPrefixes = []string{
	"/models/gemini",     // Gemini 模型调用，如 /models/gemini-pro:generateContent
	"/models/embedding",  // Gemini embedding 模型
	"/models/text",       // Gemini text 模型
}

// PathRewriteMiddleware 防呆设计：自动为缺少版本前缀的 API 请求补全路径
// 支持 OpenAI (/v1) 和 Gemini (/v1beta) 两种格式
// 无论用户是否添加版本前缀，都能正常访问 API
func PathRewriteMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path

		// 如果路径已经有版本前缀，直接放行
		if strings.HasPrefix(path, "/v1/") || strings.HasPrefix(path, "/v1beta/") {
			c.Next()
			return
		}

		// 检查是否匹配 Gemini 原生接口路径（需要 /v1beta 前缀）
		for _, prefix := range v1betaPathPrefixes {
			if strings.HasPrefix(path, prefix) {
				c.Request.URL.Path = "/v1beta" + path
				c.Next()
				return
			}
		}

		// 检查是否匹配 OpenAI 兼容接口路径（需要 /v1 前缀）
		for _, prefix := range v1PathPrefixes {
			if strings.HasPrefix(path, prefix) {
				c.Request.URL.Path = "/v1" + path
				break
			}
		}

		c.Next()
	}
}
