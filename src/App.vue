<script setup>
import { getToken } from "@/utils/token"

import { ref, onMounted } from "vue"

</script>

<template>
  <nav class="flex gap-2">
    <RouterLink to="/youbike" class="btn">YouBike</RouterLink>
    <RouterLink to="/register" class="btn">註冊</RouterLink>
    <RouterLink to="/login" class="btn">登入</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
  <footer class="bg-blue-300 text-center font-sm">@2025 AUO 版權所有</footer>
</template>
