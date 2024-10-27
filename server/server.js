const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const dataFilePath = path.join(__dirname, '../public/important.json');

// 读取剪贴板内容
app.get('/api/clipboard', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
            return res.status(500).json({ message: '读取文件失败' });
        }
        try {
            const jsonData = data ? JSON.parse(data) : [];
            res.json(jsonData);
        } catch (parseError) {
            console.error('解析JSON失败:', parseError);
            res.status(500).json({ message: '解析JSON失败' });
        }
    });
});

// 保存剪贴板内容
app.post('/api/clipboard', (req, res) => {
    const jsonData = JSON.stringify(req.body, null, 2);
    fs.writeFile(dataFilePath, jsonData, 'utf8', (err) => {
        if (err) {
            console.error('写入文件失败:', err);
            return res.status(500).json({ message: '写入文件失败' });
        }
        res.json({ message: '数据已保存' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
