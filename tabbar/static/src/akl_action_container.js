/** @odoo-module **/

console.log("Tabbar module loaded - adding tab functionality");

// 延迟加载以避免冲突
setTimeout(() => {
    try {
        // 标签页管理器
        class SafeTabManager {
            constructor() {
                this.tabs = [];
                this.activeTabId = null;
                this.container = null;
                this.init();
            }

            init() {
                // 创建标签页容器
                this.createTabContainer();
                
                // 开始URL监控
                this.startUrlMonitoring();
                
                // 添加当前页面为第一个标签页
                setTimeout(() => {
                    this.addCurrentPageAsTab();
                }, 500);
            }

            createTabContainer() {
                // 创建标签页容器
                this.container = document.createElement('div');
                this.container.className = 'simple_tabbar_container';
                this.container.innerHTML = `
                    <div class="simple_tabbar">
                        <div class="tabbar_tabs" id="tabbar-tabs"></div>
                        <div class="tabbar_actions">
                            <button class="btn btn-sm btn-outline-secondary" id="close-other-tabs" title="关闭其他标签页">⊟</button>
                            <button class="btn btn-sm btn-outline-secondary" id="close-all-tabs" title="关闭所有标签页">✕✕</button>
                        </div>
                    </div>
                `;
                
                // 找到合适的插入位置 - 在主内容区域之前
                const insertionPoint = this.findInsertionPoint();
                if (insertionPoint) {
                    insertionPoint.parentNode.insertBefore(this.container, insertionPoint);
                } else {
                    // 备用方案：插入到body的开头
                    document.body.insertBefore(this.container, document.body.firstChild);
                }
                
                // 绑定事件
                document.getElementById('close-other-tabs').onclick = () => this.closeOtherTabs();
                document.getElementById('close-all-tabs').onclick = () => this.closeAllTabs();
                
                console.log("Tab container created and inserted into page flow");
            }

            findInsertionPoint() {
                // 尝试多个可能的插入位置
                const selectors = [
                    '.o_action_manager',           // 主内容管理器
                    '.o_main_content',             // 主内容区域
                    '.o_content',                  // 内容区域
                    'main',                        // HTML5 main 标签
                    '[role="main"]'                // ARIA main 角色
                ];
                
                for (const selector of selectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        console.log("Found insertion point:", selector);
                        return element;
                    }
                }
                
                console.log("No specific insertion point found, using body");
                return null;
            }

            startUrlMonitoring() {
                this.lastUrl = window.location.href;
                
                this.urlMonitor = setInterval(() => {
                    const currentUrl = window.location.href;
                    if (currentUrl !== this.lastUrl) {
                        this.lastUrl = currentUrl;
                        setTimeout(() => {
                            this.addCurrentPageAsTab();
                        }, 300);
                    }
                }, 1000);
                
                console.log("URL monitoring started");
            }

            addCurrentPageAsTab() {
                const currentUrl = window.location.href;
                const title = this.getPageTitle();
                
                // 检查是否已存在
                const existing = this.tabs.find(tab => tab.url === currentUrl);
                if (existing) {
                    this.setActiveTab(existing.id);
                    return;
                }

                // 创建新标签页
                const tab = {
                    id: `tab_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    title: title,
                    url: currentUrl,
                    timestamp: new Date()
                };

                this.tabs.push(tab);
                this.setActiveTab(tab.id);
                this.renderTabs();
                
                console.log("Added tab:", title);
            }

            getPageTitle() {
                // 尝试从多个位置获取页面标题
                const selectors = [
                    '.o_breadcrumb .active',
                    '.o_control_panel_breadcrumbs .active',
                    '.o_control_panel .breadcrumb .active',
                    'h1',
                    '.o_form_view .o_field_many2one input[value]'
                ];
                
                for (const selector of selectors) {
                    const element = document.querySelector(selector);
                    if (element && element.textContent.trim()) {
                        return element.textContent.trim();
                    }
                }
                
                // 从URL中提取标题
                const hash = window.location.hash;
                if (hash.includes('model=')) {
                    const model = hash.match(/model=([^&]+)/);
                    if (model) {
                        return model[1].replace(/\./g, ' ').toUpperCase();
                    }
                }
                
                return document.title || 'Odoo Page';
            }

            renderTabs() {
                const tabsContainer = document.getElementById('tabbar-tabs');
                if (!tabsContainer) return;

                tabsContainer.innerHTML = '';

                this.tabs.forEach(tab => {
                    const tabElement = document.createElement('div');
                    tabElement.className = `tabbar_tab ${tab.id === this.activeTabId ? 'active' : ''}`;
                    tabElement.innerHTML = `
                        <span class="tab_title" title="${tab.title}">${tab.title}</span>
                        <button class="tab_close_btn" data-tab-id="${tab.id}">✕</button>
                    `;
                    
                    // 标签页点击事件
                    tabElement.onclick = (e) => {
                        if (!e.target.classList.contains('tab_close_btn')) {
                            this.setActiveTab(tab.id);
                        }
                    };
                    
                    // 关闭按钮事件
                    const closeBtn = tabElement.querySelector('.tab_close_btn');
                    closeBtn.onclick = (e) => {
                        e.stopPropagation();
                        this.closeTab(tab.id);
                    };
                    
                    tabsContainer.appendChild(tabElement);
                });

                // 显示/隐藏标签页容器
                this.container.style.display = this.tabs.length > 1 ? 'block' : 'none';
            }

            setActiveTab(tabId) {
                const tab = this.tabs.find(t => t.id === tabId);
                if (!tab) return;

                this.activeTabId = tabId;
                
                // 安全地导航到URL
                if (tab.url !== window.location.href) {
                    try {
                        window.location.href = tab.url;
                    } catch (e) {
                        console.warn('Navigation error:', e);
                    }
                }
                
                this.renderTabs();
            }

            closeTab(tabId) {
                const index = this.tabs.findIndex(t => t.id === tabId);
                if (index === -1) return;

                this.tabs.splice(index, 1);

                // 如果关闭的是当前标签页，切换到其他标签页
                if (this.activeTabId === tabId && this.tabs.length > 0) {
                    const newIndex = Math.min(index, this.tabs.length - 1);
                    this.setActiveTab(this.tabs[newIndex].id);
                } else if (this.tabs.length === 0) {
                    this.activeTabId = null;
                }

                this.renderTabs();
            }

            closeOtherTabs() {
                if (!this.activeTabId) return;
                
                this.tabs = this.tabs.filter(tab => tab.id === this.activeTabId);
                this.renderTabs();
            }

            closeAllTabs() {
                this.tabs = [];
                this.activeTabId = null;
                this.renderTabs();
            }
        }

        // 启动标签页管理器
        window.safeTabManager = new SafeTabManager();
        
        console.log("Safe tab manager started successfully");
        
    } catch (e) {
        console.warn("Tabbar initialization warning:", e);
    }
}, 2000); // 2秒延迟启动 