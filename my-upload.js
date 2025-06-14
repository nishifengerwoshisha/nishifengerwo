/**
 * 文件上传组件构造函数
 * @param {Object} options 配置选项
 * @param {string} options.targetId 挂载目标元素的ID
 * @param {string} options.uploadUrl 上传地址
 * @param {number} [options.maxFileSize=10] 最大文件大小(MB)
 * @param {string[]} [options.allowedTypes=[]] 允许的文件类型
 * @param {number} [options.maxFiles=5] 最大文件数量
 */
function FileUploader(options) {
    if (!options.targetId) {
        throw new Error('必须指定挂载目标元素的ID');
    }

    this.targetId = options.targetId;
    this.uploadUrl = options.uploadUrl;
    this.maxFileSize = options.maxFileSize || 10;
    this.allowedTypes = options.allowedTypes || [];
    this.maxFiles = options.maxFiles || 20;
    this.fileListMaxHeight = options.fileListMaxHeight || 300;
    // 已选择的文件列表
    this.files = [];
    // 初始化组件
    this._initContainer();
    this._bindEvents();
}

// 初始化容器
FileUploader.prototype._initContainer = function() {
    var targetElement = document.getElementById(this.targetId);
    if (!targetElement) {
        throw new Error('找不到ID为' + this.targetId + '的元素');
    }

    // 清空目标元素并添加上传组件HTML
    targetElement.innerHTML = [
        '<div class="upload-container">',
            '<div class="upload-actions">',
                '<button class="upload-button">选择文件</button>',
                '<span>备注</span>',
            '</div>',
            '<input type="file" class="file-input" multiple style="display: none;">',
            '<div class="file-list" style="display: none;"></div>',
        '</div>'
    ].join('');

    // 获取DOM引用
    this.dom = {
        container: targetElement.querySelector('.upload-container'),
        fileInput: targetElement.querySelector('.file-input'),
        fileList: targetElement.querySelector('.file-list'),
        uploadButton: targetElement.querySelector('.upload-button'),
    };
};

// 绑定事件
FileUploader.prototype._bindEvents = function() {
    var self = this;

    // 文件选择处理
    this.dom.fileInput.addEventListener('change', function(event) {
        self._handleFileSelect(event);
    });

    // 选择文件按钮点击
    this.dom.uploadButton.addEventListener('click', function() {
        self.dom.fileInput.click();
    });

};


// 处理文件选择
FileUploader.prototype._handleFileSelect = function(event) {
    var selectedFiles = Array.prototype.slice.call(event.target.files);

    // 检查文件数量
    if (selectedFiles.length + this.files.length > this.maxFiles) {
        this._showError('最多只能上传 ' + this.maxFiles + ' 个文件');
        return;
    }

    // 验证并添加文件
    for (var i = 0; i < selectedFiles.length; i++) {
        var file = selectedFiles[i];
        if (!this._validateFile(file)) {continue;}
        this.files.push(file);
    }

    // 渲染文件列表
    this._renderFileList();

    // 重置文件输入，允许重复选择相同文件
    // this.dom.fileInput.value = '';
};

// 验证文件
FileUploader.prototype._validateFile = function(file) {
    // 检查文件类型
    if (this.allowedTypes.length > 0 && this.allowedTypes.indexOf(file.type) === -1) {
        this._showError('不支持的文件类型: ' + file.type);
        return false;
    }

    // 检查文件大小
    var maxSizeBytes = this.maxFileSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        this._showError('文件 ' + file.name + ' 超过最大限制 ' + this.maxFileSize + 'MB');
        return false;
    }

    return true;
};

// 渲染文件列表
FileUploader.prototype._renderFileList = function() {
    var self = this;
    this.dom.fileList.innerHTML = '';
    // 如果没有文件，隐藏 file-list
    if (this.files.length === 0) {
        this.dom.fileList.style.display = 'none';
        return;
    }
    // 显示 file-list
    this.dom.fileList.style.display = 'block';
    this.dom.fileList.style.maxHeight = this.fileListMaxHeight + 'px'; // 设置动态高度

    for (var i = 0; i < this.files.length; i++) {
        (function(index) {
            var file = self.files[index];
            var fileItem = document.createElement('div');
            fileItem.className = 'file-item';

            // 文件信息
            var fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';
            var fileSize = self._formatFileSize(file.size);
            fileInfo.innerHTML = [
                '<div class="file-name" title="' + file.name + '">' + file.name + '</div>',
                '<div class="file-size" title="'+ fileSize +'">' + fileSize + '</div>'
            ].join('');
            fileItem.appendChild(fileInfo);

            // 删除按钮
            var removeBtn = document.createElement('div');
            removeBtn.className = 'file-remove';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                self.files.splice(index, 1);
                self._renderFileList();
            });
            fileItem.appendChild(removeBtn);

            self.dom.fileList.appendChild(fileItem);
        })(i);
    }
};

// 格式化文件大小
FileUploader.prototype._formatFileSize = function(bytes) {
    if (bytes === 0) return '0 Bytes';

    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 显示错误信息
FileUploader.prototype._showError = function(message) {
    this.dom.errorMessage.textContent = message;
    setTimeout(function() {
        this.dom.errorMessage.textContent = '';
    }.bind(this), 5000);
};

// 显示成功信息
FileUploader.prototype._showSuccess = function(message) {
    this.dom.errorMessage.style.color = '#4CAF50';
    this.dom.errorMessage.textContent = message;
    setTimeout(function() {
        this.dom.errorMessage.textContent = '';
        this.dom.errorMessage.style.color = '#f44336';
    }.bind(this), 3000);
};

// 销毁组件
FileUploader.prototype.destroy = function() {
    // 清空容器
    document.getElementById(this.targetId).innerHTML = '';
};