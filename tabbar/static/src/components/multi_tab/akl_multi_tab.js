import { Component, useRef } from '@odoo/owl';
import { Dropdown } from '@web/core/dropdown/dropdown';
export class AklMultiTab extends Component {
  static template = "akl_multi_tab.tab";
  static components = { Dropdown };
  static props = ["*"]
  setup() {
    super.setup();
    this.tabContainerRef = []
  }
  rollPage() { }
  get_menu_label() { }
  _close_all_action() { }
  _close_current_action() { }
  _close_other_action() { }
  _get_cur_active_tab() {
  }
  _get_display_name() { }
  _on_click_tab_close(info) {
    this.props.close_action(info);
  }
  _on_click_tab_item(info) { this.props.active_action(info); }
  _on_multi_tab_next() { }
  _on_multi_tab_prev() { }
  get action_infos() { }
  get current_action_info() { }

}
