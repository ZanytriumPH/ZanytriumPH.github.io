---
title: 8 A day in the life of web request
date: 2026-08-07 22:44:13
tags: [计算机网络]
categories: [计算机网络]
description: "A day in the life of web request"
---

> [!warning] 杂糅了中科大（学习过程）与南大（考前复习）的课件而成的笔记，排版与质量可能不保证

> [!info] 场景
> 学生在校园启动一台笔记本电脑：请求和接受 www.google.com

![alt text](/assets/img/posts/A-day-in-the-life-of-web-request/image-163.webp)

## 7.1 连接到互联网

- 笔记本需要一个 IP 地址，第一跳路由器的 IP 地址，DNS 的地址：采用 [DHCP](./4%20网络层：数据平面.md#dhcp)
- ==DHCP 请求被封装在 UDP 中，封装在 IP ，封装在 `802.3` 以太网帧中==
- ==以太网的帧在 LAN 上广播（dest: `FFFFFFFFFFFF`），被运行中的 DHCP 服务器接收到==
- 以太网帧中解封装 IP 分组，解封装 UDP，解封装 DHCP

![alt text](/assets/img/posts/A-day-in-the-life-of-web-request/image-164.webp)

- DHCP 服务器生成 DHCP ACK 包括客户端 IP 地址，第一跳路由器 IP 地址和 DNS 名字服务器地址
- 在 DHCP 服务器封裝，帧通过 LAN 转发（交换机学习）在客户端段解封装
- 客户端接收 DHCP ACK 应答

客户端有了 IP 地址，知道了 DNS 域名服务器的名字和 IP 地址以及第一跳路由器的 IP 地址

## 7.2 DNS 之前，HTTP 之前

- 在发送 HTTP request 请求之前，需要知道 www.google.com 的 IP 地址：**DNS**
- ==DNS 查询被创建，封装在 UDP 段中，封装在 IP 数据报中，封装在以太网的帧中，将帧传递给路由器，但是需要知道路由器的接口：**MAC 地址：[ARP](6%20链路层和局域网.md#4.1.2arp)**==
- ARP 查询广播，被路由器接收，路由器用 ARP 应答，给出其 IP 地址某个端口的 MAC 地址
- 客户端现在知道第一跳路由器 MAC 地址，所以可以发送 DNS 查询帧了

![alt text](/assets/img/posts/A-day-in-the-life-of-web-request/image-165.webp)

## 7.3 使用 DNS

- 包含了 DNS 查询的 IP 数据报通过 LAN 交换机转发，从客户端到第一跳路由器
- IP 数据报被转发，从校园到达 Comcast 网络，路由（路由表被 RIP，OSPF，IS-IS 和/或 BGP 协议创建）到 DNS 服务器
- 被 DNS 服务器解封装
- DNS 服务器回复给客户端：`www.google.com` 的 IP 地址

![alt text](/assets/img/posts/A-day-in-the-life-of-web-request/image-166.webp)

## 7.4 TCP 连接携带 HTTP 报文

- 为了发送 HTTP 请求，客户端打开到达 web 服务器的 TCP socket
- TCP SYN 段（3 次握手的第 1 次握手）域间路由由到 web 服务器
- web 服务器用 TCP SYNACK 应答（3 次握手的第 2 次握手）
- TCP 连接建立了！

![alt text](/assets/img/posts/A-day-in-the-life-of-web-request/image-167.webp)

## 7.5 HTTP 请求和应答

- HTTP 请求发送到 TCP Socket 中
- IP 数据报包含 HTTP 请求，最终路由到 www.google.com
- web 服务器用 HTTP 应答回应（包括请求的页面）
- IP 数据报包含 HTTP 响应最后被路由到客户端

![alt text](/assets/img/posts/A-day-in-the-life-of-web-request/image-168.webp)

