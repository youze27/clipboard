let clipboardItems = [];

document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    loadClipboardContent();
});

const clipboardContainer = document.getElementById('clipboardContainer');
const clipboardInput = document.getElementById('clipboardInput');
const clipboardTitle = document.getElementById('clipboardTitle');

function initializeTheme() {
    const isDarkMode = localStorage.getItem('dark-mode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').checked = true;
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('dark-mode', isDarkMode);
}

function loadClipboardContent() {
    fetch('/api/clipboard')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            clipboardItems = data;
            renderClipboardItems();
        })
        .catch(error => console.error('加载剪贴板内容失败:', error));
}

function refreshClipboardContent() {
    loadClipboardContent();
}

function saveClipboardContent() {
    fetch('/api/clipboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clipboardItems)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        loadClipboardContent(); // 确保数据持久化后重新加载
    })
    .catch(error => console.error('保存剪贴板内容失败:', error));
}

function addClipboardContent() {
    const title = clipboardTitle.value.trim();
    const content = clipboardInput.value;
    if (title && content) {
        const item = {
            id: Date.now(),
            title: title,
            content: content,
            timestamp: new Date().toLocaleString()
        };
        clipboardItems.unshift(item);
        clipboardTitle.value = '';
        clipboardInput.value = '';
        saveClipboardContent();
    } else {
        alert('标题和内容不能为空');
    }
}

function deleteClipboardContent(id) {
    if (verifyPassword()) {
        clipboardItems = clipboardItems.filter(item => item.id !== id);
        saveClipboardContent();
    }
}

function editClipboardContent(id) {
    if (verifyPassword()) {
        const item = clipboardItems.find(item => item.id === id);
        if (item) {
            const newContent = prompt('编辑内容:', item.content);
            if (newContent !== null) {
                item.content = newContent;
                item.timestamp = new Date().toLocaleString();
                saveClipboardContent();
            }
        }
    }
}

function verifyPassword() {
    const password = prompt('请输入密码:');
    return password === '3333';
}

function searchClipboardContent() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filteredItems = clipboardItems.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.content.toLowerCase().includes(searchTerm)
    );
    renderClipboardItems(filteredItems);
}

function renderClipboardItems(items = clipboardItems) {
    const container = document.getElementById('clipboardContainer');
    container.innerHTML = '';
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'clipboard-block';
        itemElement.dataset.id = item.id;
        itemElement.innerHTML = `
            <header>
                <span class="clipboard-title">${item.title}</span>
                <span class="clipboard-timestamp">${item.timestamp}</span>
            </header>
            <div class="content-icons">
                <pre ondblclick="editClipboardContent(${item.id})"><code class="language-javascript">${Prism.highlight(item.content, Prism.languages.javascript, 'javascript')}</code></pre>
                <div class="buttons">
                    <button class="delete" onclick="deleteClipboardContent(${item.id})"><i class="fas fa-trash-alt"></i></button>
                    <button class="copy" onclick="copyToClipboard('${item.content.replace(/'/g, "\\'")}')"><i class="fas fa-copy"></i></button>
                </div>
            </div>
        `;
        container.appendChild(itemElement);
    });
    Prism.highlightAll();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('内容已复制到剪贴板');
    }).catch(err => {
        console.error('复制失败:', err);
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '10px';
    notification.style.right = '10px';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    document.body.appendChild(notification);
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 2000);
}

loadClipboardContent();
