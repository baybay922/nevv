<template>
  <aside class="site-sidebar" :class="'site-sidebar--' + sidebarLayoutSkin">
    <div class="site-sidebar__inner">
      <el-menu
        :default-active="menuActiveName || 'home'"
        :collapse="sidebarFold"
        :collapseTransition="false"
        class="site-sidebar__menu">
        <el-menu-item index="home" @click="$router.push({ name: 'home' })">
          <icon-svg name="shouye" class="site-sidebar__menu-icon"></icon-svg>
          <span slot="title">home</span>
        </el-menu-item>
        <el-submenu index="1">
          <template slot="title">
             <i class="el-icon-s-custom"></i>
            <span>User Management</span>
          </template>
          <el-menu-item index="1-1" @click="$router.push({ name: 'gamer' })">Gamer</el-menu-item>
          <el-menu-item index="1-2" @click="$router.push({ name: 'admin' })">Administator</el-menu-item>
        </el-submenu>

        <!-- <el-submenu index="2">
          <template slot="title">
            <i class="el-icon-platform-eleme"></i>
            <span>Inventory Management</span>
          </template>
          <el-menu-item index="2-1">Asset</el-menu-item>
        </el-submenu> -->

        <el-submenu index="3">
          <template slot="title">
            <i class="el-icon-goods"></i>
            <span>Shop Management</span>
          </template>
          <el-menu-item index="3-1" @click="$router.push({ name: 'item' })">Real Item</el-menu-item>
        </el-submenu>

        <el-submenu index="4">
          <template slot="title">
            <i class="el-icon-s-check"></i>
            <span>Event Management</span>
          </template>
          <el-menu-item index="4-1" @click="$router.push({ name: 'event' })">Event</el-menu-item>
          <el-menu-item index="4-2" @click="$router.push({ name: 'prize' })">Prizepool</el-menu-item>
          <!-- <el-menu-item index="4-3">Term & Condition</el-menu-item> -->
          <el-menu-item index="4-4" @click="$router.push({ name: 'ranking' })">Leaderboard</el-menu-item>
          <el-menu-item index="4-3" @click="$router.push({ name: 'watch' })">Watch</el-menu-item>
          <el-menu-item index="4-5" @click="$router.push({ name: 'quest' })">Quest</el-menu-item>
          <el-menu-item index="4-6" @click="$router.push({ name: 'code' })">Code</el-menu-item>
          <el-menu-item index="4-7" @click="$router.push({ name: 'promo' })">Promo Code</el-menu-item>
          <el-menu-item index="4-7" @click="$router.push({ name: 'match' })">Match</el-menu-item>
        </el-submenu>

        <!-- <sub-menu
          v-for="menu in menuList"
          :key="menu.menuId"
          :menu="menu"
          :dynamicMenuRoutes="dynamicMenuRoutes">
        </sub-menu> -->
      </el-menu>
    </div>
  </aside>
</template>

<script>
  import SubMenu from './main-sidebar-sub-menu'
  import { isURL } from '@/utils/validate'
  export default {
    data () {
      return {
        dynamicMenuRoutes: []
      }
    },
    components: {
      SubMenu
    },
    computed: {
      sidebarLayoutSkin: {
        get () { return this.$store.state.common.sidebarLayoutSkin }
      },
      sidebarFold: {
        get () { return this.$store.state.common.sidebarFold }
      },
      menuList: {
        get () { return this.$store.state.common.menuList },
        set (val) { this.$store.commit('common/updateMenuList', val) }
      },
      menuActiveName: {
        get () { return this.$store.state.common.menuActiveName },
        set (val) { this.$store.commit('common/updateMenuActiveName', val) }
      },
      mainTabs: {
        get () { return this.$store.state.common.mainTabs },
        set (val) { this.$store.commit('common/updateMainTabs', val) }
      },
      mainTabsActiveName: {
        get () { return this.$store.state.common.mainTabsActiveName },
        set (val) { this.$store.commit('common/updateMainTabsActiveName', val) }
      }
    },
    watch: {
      $route: 'routeHandle'
    },
    created () {
      this.menuList = JSON.parse(sessionStorage.getItem('menuList') || '[]')
      this.dynamicMenuRoutes = JSON.parse(sessionStorage.getItem('dynamicMenuRoutes') || '[]')
      this.routeHandle(this.$route)
    },
    methods: {
      // 路由操作
      routeHandle (route) {
        if (route.meta.isTab) {
          // tab选中, 不存在先添加
          var tab = this.mainTabs.filter(item => item.name === route.name)[0]
          if (!tab) {
            if (route.meta.isDynamic) {
              route = this.dynamicMenuRoutes.filter(item => item.name === route.name)[0]
              if (!route) {
                return console.error('未能找到可用标签页!')
              }
            }
            tab = {
              menuId: route.meta.menuId || route.name,
              name: route.name,
              title: route.meta.title,
              type: isURL(route.meta.iframeUrl) ? 'iframe' : 'module',
              iframeUrl: route.meta.iframeUrl || '',
              params: route.params,
              query: route.query
            }
            this.mainTabs = this.mainTabs.concat(tab)
          }
          this.menuActiveName = tab.menuId + ''
          this.mainTabsActiveName = tab.name
        }
      }
    }
  }
</script>
