/** @odoo-module **/

import { Component, useRef } from '@odoo/owl';
import { Dropdown } from '@web/core/dropdown/dropdown';

export class AklMultiTab extends Component {
  static template = "akl_multi_tab.tab";
  static components = { Dropdown };
  static props = {
    action_infos: { type: Array, optional: true },
    active_action: { type: Function },
    close_action: { type: Function },
    close_other_action: { type: Function, optional: true },
    close_all_action: { type: Function, optional: true },
  };

  setup() {
    super.setup();
    this.tabContainerRef = useRef("tabContainer");
  }

  get action_infos() {
    return this.props.action_infos || [];
  }

  get current_action_info() {
    return this.action_infos.find(info => info.active);
  }

  _get_display_name(info) {
    if (info.__info__ && info.__info__.displayName) {
      return info.__info__.displayName;
    }
    if (info.componentProps && info.componentProps.title) {
      return info.componentProps.title;
    }
    return "Untitled";
  }

  _on_click_tab_close(info) {
    this.props.close_action(info);
  }

  _on_click_tab_item(info) {
    this.props.active_action(info);
  }

  _close_all_action() {
    if (this.props.close_all_action) {
      this.props.close_all_action();
    }
  }

  _close_current_action() {
    const current = this.current_action_info;
    if (current) {
      this.props.close_action(current);
    }
  }

  _close_other_action() {
    const current = this.current_action_info;
    if (current && this.props.close_other_action) {
      this.props.close_other_action(current);
    }
  }

  rollPage() { }
  get_menu_label() { }
  _get_cur_active_tab() {
  }
  _on_multi_tab_next() { }
  _on_multi_tab_prev() { }
}
