/** 操作面板
 */
import { serve } from "https://deno.land/std@0.145.0/http/server.ts";
import { grantOrThrow } from "https://deno.land/std@0.145.0/permissions/mod.ts";
import { hasPanel, createPanel, feedPanel, deletePanel, getPanelContent } from "./panel.js";

const PORT = 18968;
// const WAIT_TIMEOUT = 1 * 60 * 1000; //ms
const WAIT_TIMEOUT = 30 * 1000; //ms
const MAX_LENGTH = 4 * 1024; // bytes

await grantOrThrow(
  { name: "net", host: `0.0.0.0:${PORT}` },
  { name: "read", path: "./index.html" },
  { name: "read", path: "./help.txt" },
);

const sleep = ms => new Promise(r => setTimeout(r, ms));

const response = (code = 200, data = null, headers = {}) => {
  return new Response(
    JSON.stringify({ code, data }),
    {
      status: code,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    },
  );
};

const response400 = () => {
  return response(400, "Bad Request");
};

const response404 = () => {
  return response(404, "Not Found");
};

const response409 = () => {
  return response(409, "Conflict");
};

const response418 = () => {
  return response(418, "I'm a teapot");
};

const response500 = () => {
  return response(500, "Internal Server Error");
};

const response504 = () => {
  return response(504, "Gateway Timeout");
};

/** handler 主函数
 * name, key, password, 其中readKey不会被记录，在客户端完成加密解密。
 * /update: name, password, content 对象存在且没过期的话要求密码相同，否则保存新的对象
 *     content限制长度为16384个字符。对象过期时间1天。
 * /query: name -> content
 * @type {import("https://deno.land/std@0.145.0/http/server.ts").Handler}
 */
const handler = async (req, _) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const query = url.searchParams;
  try {
    if (req.method === "POST" && path === "/waitResponse") {
      const name = query.get("name");
      const content = await req.text();
      if (!name || !content || content.length > MAX_LENGTH) {
        return response400();
      }
      if (await hasPanel(name)) {
        return response409();
      }
      const contentObject = JSON.parse(content);
      const panel = createPanel(name, contentObject);
      try {
        const feedPromise = panel.waitNext().catch(_ => undefined);
        const timeoutPromise = sleep(WAIT_TIMEOUT);
        const result = await Promise.race([ feedPromise, timeoutPromise ]);
        if (!result) {
          return response504();
        }
        return response(200, result);
      } finally {
        deletePanel(name);
      }
    } else if (req.method === "POST" && path === "/sendResponse") {
      const name = query.get("name");
      const content = await req.text();
      if (!name || !content || content.length > MAX_LENGTH) {
        return response400();
      }
      if (!(await hasPanel(name))) {
        return response404();
      }
      const contentObject = JSON.parse(content);
      feedPanel(name, contentObject);
      return response(200, "Ok");
    } else if (req.method === "GET" && path === "/panelContent") {
      const name = query.get("name");
      if (!name) {
        return response400();
      }
      if (!(await hasPanel(name))) {
        return response404();
      }
      const content = await getPanelContent(name);
      return response(200, content);
    } else if (req.method === "GET" && path === "/") {
      const f = await Deno.open("./index.html", { read: true });
      return new Response(f.readable, {headers: {
          "Content-Type": "text/html",
      }});
    } else if (req.method === "GET" && path === "/help.txt") {
      const f = await Deno.open("./help.txt", { read: true });
      return new Response(f.readable, {headers: {
          "Content-Type": "text/plain; charset=utf-8",
      }});
    } else {
      return response404();
    }
  } catch (e) {
    console.error(e);
    return response500();
  }
};

await serve(handler, { port: PORT });
