#!/usr/bin/env node
// เดโม่ตัวที่ 2 — แยกข้อมูลจากตัวหลัก ใช้ทดสอบ flow ครบวงจร (เงินเดือนเต็มรูป + เอกสารราชการ)
process.env.PORT = process.env.PORT || '3011';
process.env.DATA_FILE = require('path').join(__dirname, '..', 'demo2-data.json');
require('../server.js');
