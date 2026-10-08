# 腾讯云部署

目标地址：`https://www.52lyrics.com`，服务器：`43.135.135.12`。

2026-10-01 已发布千位歌手版本：运行目录为 `/srv/52lyrics/releases/20261001-1000artists/`，`current` 指针与 `52lyrics-web` 容器均指向此版本。站内有 1,000 位具备完整来源发行资料的歌手，连同历史词作者等共 1,010 个艺人/作者页面；1,121 个专辑/阅读歌本、13,217 个歌曲页面、953 张许可与署名核验通过的图片，108 首既有完整歌词作品保持不变。上一版 `/srv/52lyrics/releases/20260930-guides/` 保留在停止状态的 `52lyrics-web-rollback-20261001-1000artists` 中。

发布包为 231,799,502 字节，SHA-256 `89f817902b26e3bf48eae4133d0fcc733650e269c8e3485350b5b9e222b8c7a9`，上传完成后服务器核验通过。先以临时候选容器检查首页和新增艺人，再切换容器；切换后的本机 HTTPS 检查通过。公网首页、sitemap、新增的 Josef Salvat 艺人与资料型歌曲页，以及旧有的 City Lights 完整歌词页，均与本地构建的 SHA-256 一致；Josef Salvat 的图片亦与许可清单中的 SHA-256 一致。浏览器实测首页出现 1,010 位艺人/作者的入口，版式切换可用，新增艺人到专辑到歌曲的路径可用，资料型歌曲明确显示无可展示歌词。旧版首页脚本仍返回 200。发布前通过来源核验、增量保留检查、类型检查、ESLint、69 项单元测试、32 项桌面/移动浏览器测试、生产构建及 15,348 个详情页与 953 张图片的产物审计。临时上传公钥在包校验通过后自动撤销，旧密钥登录被拒绝，本地临时私钥已移除。

2026-09-10 已部署并完成基础公网验收：HTTPS 首页返回 200，浏览器实际渲染正常，详情页可直接访问及刷新。仅配置 `www.52lyrics.com`，未改动根域名 `52lyrics.com`。

2026-09-30 已发布音乐阅读导览：当时发布目录为 `/srv/52lyrics/releases/20260930-guides/`，只读挂载到 `52lyrics-web`，`current` 指针已同步。上一版本 `/srv/52lyrics/releases/20260929-spotlight/` 和停止状态的 `52lyrics-web-rollback-20260930-guides` 已保留。原有 Caddy 配置、证书卷及其他服务均保留。

本次增加 `/guides` 和三篇原创导览，分别解释曲目与发行版本的关系、站内歌词的展示范围、历史文本的来源与权利证据。首页、Discover、专辑和歌词详情增加上下文入口；四个导览 URL 已预渲染并写入 sitemap。搜索和本地收藏页设为 `noindex`，从 sitemap 移除搜索页。发布前通过 66 项单元测试、导览页桌面与移动端端到端测试、类型检查、ESLint、生产构建和 9,723 个详情页的产物核验。公网检查确认四个导览页面返回 200、标题与 canonical 正确、sitemap 含 9,734 个 URL，搜索和收藏页各有一个 `noindex`。浏览器实测导览列表与内链可用。

本次静态发布包 SHA-256：`5224c1bbd87bfad7db175b44da800233f1bb43f56a4da8d8f5c3869500f8cb58`；上传封装包 SHA-256：`0f9659157b60eb23f215852b5adc47185fe76027cd887d1bca807bc234078de6`。上传包已在服务器核对；图片从上一版本硬链接复用并校验，旧版带哈希文件名的资源保留。切换前通过临时容器检查，切换后 HTTPS 检查通过。部署日志：`/srv/52lyrics/deploy/20260930-guides/deploy.log`。

2026-09-29 已发布首页歌手随机展示版本：目录为 `/srv/52lyrics/releases/20260929-spotlight/`。此前版本 `/srv/52lyrics/releases/20260929-100artists/` 和停止状态的 `52lyrics-web-rollback-20260929-spotlight` 已保留。

首页从 584 位具备授权来源图片及专辑资料的艺人中选取三位，刷新和从其他页面返回首页时更新；优先未展示的艺人，避开上一组，并尽量搭配不同曲风。展示记录保存在本机 localStorage，存储不可用时回退为内存记录。浏览器线上实测三组为 The Black Keys / Yoko Ono / Kesha、Mylène Farmer / John Michael Talbot / Rainbow、Oasis / Janis Joplin / Alicia Keys，组间无重复，缩略图切换正常。发布前通过 66 项单元测试、28 项桌面及移动端端到端测试、类型检查、相关文件 ESLint 和生产构建。

静态发布包 SHA-256：`c77e91b4a3ab7cc5ab93625fe63ffcc94b6869db8eadc5deccbaa4ce5c77ee9f`；上传封装包 SHA-256：`f3e30475e871fe955217200bb2a51ccf6698828af23c8cb39af7184861db5ef1`，均已在服务器核对。图片复用上一版本并逐项校验；旧版带哈希文件名的资源保留，供已打开页面继续使用。切换前通过临时容器验证，切换后 HTTPS 检查确认新脚本 `/assets/Home-CUgaY-a6.js` 含随机展示逻辑。部署日志：`/srv/52lyrics/deploy/20260929-spotlight/resume.log`。

公网完成 32 项页面及资源检查，包括首页引用的脚本、CSS 和字体，上一版首页脚本、歌手列表、隐私页、Oasis 详情、robots 和 sitemap。新首页脚本及目录数据脚本的 SHA-256 与本地构建一致，百度统计配置保留。目录数据下载遇到一次中断，重新下载校验通过。验收记录为本地 `tmp/home-spotlight-public-check.json`，截图为 `tmp/home-spotlight-live.png`。

2026-09-29 之前发布的 100 位新增艺人版本目录为 `/srv/52lyrics/releases/20260929-100artists/`。保留 `/srv/52lyrics/releases/20260924/` 及停止状态的 `52lyrics-web-rollback-20260929` 作为更早的回滚点。该发布包 SHA-256：`05a59cca93ba39c0dc9ed2de4d63ee41a1435ccca71cbd39e740a04c9c07d6ab`。

100 位新增艺人版本的验收包括 13 个页面、39 个首页静态资源、HTTP → HTTPS 跳转、`/top-charts` 跳转、robots、sitemap 和缺失静态资源的 404；抽查了资料型歌曲不显示完整歌词。浏览器实测从首页打开 City Lights，收藏后刷新仍可在 Saved 找到；测试添加的收藏已移除。网络检查遇到少量连接重置，重试后通过。

历史发布包 SHA-256：`1e66f435e85e2b0243ed1ac33ee78258832d59034633bbc9eceee42879a88c4c`。本次发布包已完成服务器 SHA-256 校验，临时上传公钥已撤销，本地临时私钥已删除。上述结果是部署冒烟验收，不等于已完成 Lighthouse 性能认证。

## 部署结构

本站是预渲染静态站点，不需要在服务器运行 Node 开发服务，也没有站点数据库。

| 内容 | 位置 |
| --- | --- |
| 本地构建产物 | `build/client/` |
| 本次服务器版本目录 | `/srv/52lyrics/releases/20261001-1000artists/` |
| 当前版本指针 | `/srv/52lyrics/current` |
| Caddy 配置 | `/srv/52lyrics/caddy/Caddyfile` |
| HTTPS 证书及续期状态 | `/srv/52lyrics/caddy/data/`（不要删除或公开） |
| Caddy 运行配置 | `/srv/52lyrics/caddy/config/` |
| 独立容器 | `52lyrics-web` |

容器将指定版本目录只读挂载为 `/srv/52lyrics/current`，对外仅映射 TCP 80 和 443。更改宿主机的 `current` 软链接不会自动更改现有容器挂载的版本；后续更新需要重建本站容器。服务器上其他容器不属于本站部署范围。

## 构建与发布原则

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm lint
pnpm test
SITE_URL=https://www.52lyrics.com BAIDU_TONGJI_ID=7ba35cf48a0603715bafc08f9b760f86 pnpm build
pnpm catalog:verify-build
```

只上传 `build/client/` 的压缩包，不上传源码、`.git`、`.vercel`、环境变量文件或 SSH 私钥。上传后核对本地与服务器 SHA-256，再解压至新的版本目录；不要直接覆盖正在服务的目录。

Caddy 配置源文件为 `scripts/deploy/Caddyfile`：提供自动 HTTPS、HTTP 跳转、预渲染目录索引和 SPA 深链接回退。缺失的静态资源返回 404，不回退为 HTML。`/top-charts` 永久跳转到 `/discover`。公网 IP 仅作为 HTTP 检查入口，带有 `noindex` 标记。

腾讯云部署的构建不启用 Vercel Analytics；该集成仅在构建环境设置 `VERCEL=1` 时启用。

## 服务器维护

以下命令在服务器终端运行；仅在本站容器已创建后使用：

```bash
docker ps --filter name=52lyrics-web
docker logs --tail 100 52lyrics-web
docker restart 52lyrics-web
```

容器配置了 `unless-stopped` 自动重启和每份 10 MB、最多 3 份的日志轮转。HTTPS 自动签发及续期依赖正确 DNS、可访问的 80/443 端口和持久化的 Caddy 数据目录。

更新时保留上一版本目录和证书目录。若新版本异常，重建本站容器并挂载上一版本；不要清理其他服务或使用全局 Docker 清理命令。

本次已保留可直接启动的上一版容器。需要回滚时，先确认下列容器名称仍对应本次发布，再运行：

```bash
docker stop 52lyrics-web
docker rename 52lyrics-web 52lyrics-web-failed-20261001-1000artists
docker rename 52lyrics-web-rollback-20261001-1000artists 52lyrics-web
docker start 52lyrics-web
ln -sfn /srv/52lyrics/releases/20260930-guides /srv/52lyrics/current
```

回滚后检查 HTTPS 首页及静态资源，并保留失败版本以便排查。

## 发布检查

- 首页、搜索、歌手、专辑、歌词详情可直接访问及刷新。
- CSS、脚本、字体和图片正常加载，浏览器无加载错误。
- HTTP 跳转 HTTPS，证书匹配 `www.52lyrics.com`。
- canonical、robots 和 sitemap 使用上述域名。
- 完整歌词与资料型页面区分正确；收藏刷新后保留在本机。
- 临时上传公钥已撤销，本地临时私钥已移除。
- 服务器上原有服务仍在运行。
