<template>
  <div id="app" class="min-h-screen">
    <!-- Header -->
    <AppHeader @settings="navigateToSettings" />

    <!-- 主要內容區域 -->
    <main class="pt-20 pb-20">
      <Home v-if="currentPage === 'home'" />
      <Map v-else-if="currentPage === 'map'" />
      <Monopoly v-else-if="currentPage === 'monopoly'" />
      <Favorites v-else-if="currentPage === 'favorites'" />
      <History v-else-if="currentPage === 'history'" />
      <Settings v-else-if="currentPage === 'settings'" @back="goBackFromSettings" />
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation
      :currentPage="currentPage"
      @navigate="navigateTo"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import AppHeader from './components/AppHeader.vue';
import BottomNavigation from './components/BottomNavigation.vue';
import Home from './views/Home.vue';
import Map from './views/Map.vue';
import Monopoly from './views/Monopoly.vue';
import Favorites from './views/Favorites.vue';
import History from './views/History.vue';
import Settings from './views/Settings.vue';

/**
 * 當前頁面
 */
const currentPage = ref<'home' | 'map' | 'monopoly' | 'favorites' | 'history' | 'settings'>('home');

/**
 * 記錄設定頁面前的頁面
 */
const previousPage = ref<'home' | 'map' | 'monopoly' | 'favorites' | 'history'>('home');

/**
 * 導航到指定頁面
 */
const navigateTo = (page: string) => {
  currentPage.value = page as typeof currentPage.value;
};

/**
 * 導航到設定頁面
 */
const navigateToSettings = () => {
  previousPage.value = currentPage.value as typeof previousPage.value;
  currentPage.value = 'settings';
};

/**
 * 從設定頁面返回
 */
const goBackFromSettings = () => {
  currentPage.value = previousPage.value;
};

// 監聽從內頁請求導向設定頁
onMounted(() => {
  const handler = () => navigateToSettings();
  window.addEventListener('navigate-settings', handler as EventListener);
  // 清理
  onBeforeUnmount(() => {
    window.removeEventListener('navigate-settings', handler as EventListener);
  });
});
</script>