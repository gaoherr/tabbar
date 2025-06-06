/** @odoo-module **/

import { Component, useState, onMounted, onWillUnmount } from "@odoo/owl";

// 简化的标签页管理器
class SimpleTabbarManager {
    constructor() {
        this.tabs = [];
        this.activeTabId = null;
        this.listeners = [];
    }

    addTab(tab) {
        // 检查是否已存在相同的标签页
        const existing = this.tabs.find(t => t.url === tab.url);
        if (existing) {
            this.setActiveTab(existing.id);
            return existing;
        }

        // 添加新标签页
        const newTab = {
            id: `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: tab.title || 'New Tab',
            url: tab.url,
            timestamp: new Date()
        };
        
        this.tabs.push(newTab);
        this.setActiveTab(newTab.id);
        this.notifyListeners();
        return newTab;
    }

    removeTab(tabId) {
        const index = this.tabs.findIndex(t => t.id === tabId);
        if (index === -1) return;

        this.tabs.splice(index, 1);
        
        // 如果删除的是当前活跃标签页，切换到其他标签页
        if (this.activeTabId === tabId && this.tabs.length > 0) {
            const newIndex = Math.min(index, this.tabs.length - 1);
            this.setActiveTab(this.tabs[newIndex].id);
        } else if (this.tabs.length === 0) {
            this.activeTabId = null;
        }
        
        this.notifyListeners();
    }

    setActiveTab(tabId) {
        this.activeTabId = tabId;
        const tab = this.tabs.find(t => t.id === tabId);
        if (tab) {
            // 安全地导航到标签页的URL
            try {
                if (tab.url && tab.url !== window.location.hash) {
                    window.location.hash = tab.url;
                }
            } catch (e) {
                console.warn('Navigation error:', e);
            }
        }
        this.notifyListeners();
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.tabs, this.activeTabId);
            } catch (e) {
                console.warn('Listener error:', e);
            }
        });
    }
}

// 全局标签页管理器实例
const tabbarManager = new SimpleTabbarManager();

// 简化的标签页组件
export class SimpleTabbar extends Component {
    static template = "tabbar.SimpleTabbar";
    
    setup() {
        this.state = useState({
            tabs: [],
            activeTabId: null,
            visible: false
        });

        this.isDestroyed = false;
        
        onMounted(() => {
            this.initializeTabbar();
        });

        onWillUnmount(() => {
            this.cleanup();
        });
    }

    initializeTabbar() {
        try {
            // 安全地添加监听器
            this.onTabsChange = this.onTabsChange.bind(this);
            tabbarManager.addListener(this.onTabsChange);
            
            // 延迟初始化以避免与其他组件冲突
            setTimeout(() => {
                if (!this.isDestroyed) {
                    this.addCurrentPageAsTab();
                    this.startUrlMonitoring();
                }
            }, 500);
        } catch (e) {
            console.warn('Tabbar initialization error:', e);
        }
    }

    startUrlMonitoring() {
        // 使用更安全的URL监控方式
        this.lastUrl = window.location.href;
        this.urlCheckInterval = setInterval(() => {
            if (this.isDestroyed) return;
            
            const currentUrl = window.location.href;
            if (currentUrl !== this.lastUrl) {
                this.lastUrl = currentUrl;
                setTimeout(() => {
                    if (!this.isDestroyed) {
                        this.addCurrentPageAsTab();
                    }
                }, 200);
            }
        }, 1000); // 每秒检查一次URL变化
    }

    cleanup() {
        this.isDestroyed = true;
        
        if (this.urlCheckInterval) {
            clearInterval(this.urlCheckInterval);
        }
        
        tabbarManager.removeListener(this.onTabsChange);
    }

    onTabsChange(tabs, activeTabId) {
        if (this.isDestroyed) return;
        
        this.state.tabs = [...tabs];
        this.state.activeTabId = activeTabId;
        this.state.visible = tabs.length > 1;
    }

    addCurrentPageAsTab() {
        try {
            const currentUrl = window.location.hash || window.location.pathname;
            const title = this.getPageTitle();
            
            tabbarManager.addTab({
                title: title,
                url: currentUrl
            });
        } catch (e) {
            console.warn('Add tab error:', e);
        }
    }

    getPageTitle() {
        try {
            // 更安全的标题获取
            const selectors = [
                '.o_breadcrumb .active',
                '.o_control_panel .o_cp_breadcrumb .active',
                'h1',
                '.o_field_many2one_selection .o_input',
                '.o_form_view .o_form_field_many2one input'
            ];
            
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim()) {
                    return element.textContent.trim();
                }
            }
            
            return document.title || 'Odoo Page';
        } catch (e) {
            return 'Odoo Page';
        }
    }

    onTabClick(tab) {
        tabbarManager.setActiveTab(tab.id);
    }

    onTabClose(tab, event) {
        event.preventDefault();
        event.stopPropagation();
        tabbarManager.removeTab(tab.id);
    }

    onCloseOtherTabs(currentTab) {
        const otherTabs = this.state.tabs.filter(t => t.id !== currentTab.id);
        otherTabs.forEach(tab => tabbarManager.removeTab(tab.id));
    }

    onCloseAllTabs() {
        const allTabs = [...this.state.tabs];
        allTabs.forEach(tab => tabbarManager.removeTab(tab.id));
    }
}

// 安全地挂载到页面
document.addEventListener('DOMContentLoaded', () => {
    // 在页面加载完成后挂载组件
    setTimeout(() => {
        try {
            const container = document.createElement('div');
            container.id = 'simple-tabbar-container';
            document.body.appendChild(container);
            
            // 这里我们将在CSS中处理显示
            console.log("Simple Tabbar container created");
        } catch (e) {
            console.warn('Tabbar mount error:', e);
        }
    }, 1000);
});

console.log("Simple Tabbar module loaded successfully"); 