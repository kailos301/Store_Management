import { StoresAction, StoresActionType } from './../../stores/+state/stores.actions';
import { MenuAction, MenuActionType } from './menu.actions';
import { combineReducers } from '@ngrx/store';
import { INavData } from '@coreui/angular';
import { UserAction } from '../../user/+state/user.actions';

export interface MenuState {
    menu: Menu;
}

export interface TranslatableNavItem extends INavData {
  key?: string;
  storeRoles?: string[];
}

export interface Menu {
    navItems: TranslatableNavItem[];
}

export const menuInitialState: Menu = {
    navItems: [
      {
        key: 'admin.store.list.storesList',
        url: '/manager/stores/list',
        icon: 'fas fa-list'
      },
      {
        divider: true,
      },
      {
        key: 'admin.store.storeCreation',
        url: '/manager/stores/init',
        icon: 'fas fa-store'
      },
      {
        divider: true,
      },
      {
        key: 'admin.global.partnerProgram.label',
        url: '/manager/user/partner',
        icon: 'fas fa-handshake',
        attributes: { hidden: true}
      },
      {
        divider: true,
      },
      {
        key: 'admin.users.userManage.label',
        url: '/manager/users/list',
        icon: 'fas fa-users',
        attributes: { hidden: true}
      },
      {
        divider: true,
      },
    ]
};

const generateMenuItems = (storeId, storeAlias) => ([
  {
    key: 'admin.store.list.storesList',
    url: '/manager/stores/list',
    icon: 'fas fa-list'
  },
  {
    divider: true,
  },
  {
    key: 'admin.store.statistics.orders',
    url: '/manager/stores/' + storeId + '/orders',
    icon: 'fas fa-shopping-cart',
    storeRoles: ['STORE_ADMIN', 'STORE_STANDARD']
  },
  {
    key: 'admin.store.statistics.orderCapture',
    url: `/manager/stores/${storeId}/capture/${storeAlias}`,
    icon: 'far fa-clipboard',
    storeRoles: ['STORE_ADMIN', 'STORE_STANDARD']
  },
  {
    key: 'admin.store.catalogOverview',
    url: '/manager/stores/' + storeId + '/catalog',
    icon: 'fas fa-atlas',
    storeRoles: ['STORE_ADMIN', 'STORE_STANDARD']
  },
  {
    key: 'admin.store.settings',
    url: '/manager/stores/' + storeId + '/settings',
    icon: 'fas fa-cogs',
    storeRoles: ['STORE_ADMIN']
  },
  {
    key: 'admin.store.locations.text',
    url: '/manager/stores/' + storeId + '/locations',
    icon: 'fas fa-map-marker-alt',
    storeRoles: ['STORE_ADMIN', 'STORE_STANDARD']
  },
  {
    key: 'admin.store.statistics.title',
    url: '/manager/stores/' + storeId + '/statistics',
    icon: 'fas fa-chart-bar',
    storeRoles: ['STORE_ADMIN', 'STORE_STANDARD']
  },
  {
    key: 'admin.store.users.header',
    url: '/manager/stores/' + storeId + '/users',
    icon: 'fas fa-users',
    storeRoles: ['STORE_ADMIN']
  },
  {
    key: 'admin.store.setting.billing',
    url: '/manager/stores/' + storeId + '/billing',
    icon: 'fas fa-briefcase',
    storeRoles: ['STORE_ADMIN']
  },
  {
    key: 'admin.store.customers.customers',
    url: '/manager/stores/' + storeId + '/customers',
    icon: 'fas fa-user-circle',
    storeRoles: ['STORE_ADMIN']
  },
  {
    key: 'admin.store.share.sharePreview',
    url: '/manager/stores/' + storeId + '/share',
    icon: 'fas fa-share-alt',
    storeRoles: ['STORE_ADMIN', 'STORE_STANDARD']
  },
  // {
  //   key: 'admin.menu.preview',
  //   url: '<protocol>//' + action.store.aliasName + '.<domain>',
  //   icon: 'fas fa-eye',
  //   attributes: {target: '_blank',hidden:true},
  //   storeRoles: ['STORE_ADMIN', 'STORE_STANDARD']
  // },
  {
    divider: true,
  },
  {
    key: 'admin.store.storeCreation',
    url: '/manager/stores/init',
    icon: 'fas fa-store'
  },
  {
    divider: true,
  },
  {
    key: 'admin.global.partnerProgram.label',
    url: '/manager/user/partner',
    icon: 'fas fa-handshake',
    attributes: { hidden: true}
  },
  {
    divider: true,
  },
  {
    key: 'admin.users.userManage.label',
    url: '/manager/users/list',
    icon: 'fas fa-users',
    attributes: { hidden: true}
  },
  {
    divider: true,
  },
]);

export function navItems(
  state: TranslatableNavItem[] = menuInitialState.navItems,
  action: MenuAction | StoresAction | UserAction
): TranslatableNavItem[] {
    switch (action.type) {
        case MenuActionType.AddNavItem:
            return state;
        case StoresActionType.LoadStoreSuccess:
        case StoresActionType.PartialUpdateStoreSuccess:
          return generateMenuItems(action.store.id, action.store.aliasName);
        default:
            return state;
    }
}

const reducer: (state: Menu, action: MenuAction) => Menu = combineReducers({
    navItems
});

export function menuReducer(state: Menu = menuInitialState, action: MenuAction): Menu {
    return reducer(state, action);
}
