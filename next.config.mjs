/** @type {import("next").NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // 编译器与声明文件按版本号分目录(见 scripts/prepare-tslab.mjs),
        // 路径里带版本 → 可以让浏览器永久缓存;升级 TypeScript 时路径自动变。
        source: "/tslab/:version(\\d+\\.\\d+\\.\\d+)/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
