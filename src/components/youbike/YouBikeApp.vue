<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold text-center mb-8 text-primary">台北市 YouBike 即時資訊</h1>
    
    <!-- 搜尋區域 -->
    <div class="card bg-base-100 shadow-lg mb-6">
      <div class="card-body">
        <div class="flex gap-2 mb-4">
          <input
            v-model="searchKeyword"
            @keyup.enter="searchStations"
            type="text"
            placeholder="輸入站點名稱或地址..."
            class="input input-bordered flex-1"
          />
          <button @click="searchStations" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            搜尋
          </button>
        </div>
        
        <!-- 收藏站點快速按鈕 -->
        <div v-if="favorites.length > 0" class="mb-4">
          <h3 class="text-lg font-semibold mb-2">收藏站點</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="favorite in favorites"
              :key="favorite.sno"
              @click="showStationDetail(favorite)"
              class="btn btn-outline btn-sm"
            >
              {{ favorite.sna }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div v-if="loading" class="flex justify-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- 搜尋結果 -->
    <div v-if="!loading && searchResults.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div
        v-for="station in searchResults"
        :key="station.sno"
        @click="showStationDetail(station)"
        class="card bg-base-100 shadow-md hover:shadow-lg cursor-pointer transition-shadow"
      >
        <div class="card-body">
          <h3 class="card-title text-sm">{{ station.sna }}</h3>
          <p class="text-xs text-gray-600">{{ station.ar }}</p>
          <div class="flex justify-between items-center mt-2">
            <div class="badge badge-success">可借: {{ station.sbi }}</div>
            <div class="badge badge-info">可還: {{ station.bemp }}</div>
          </div>
          <div class="flex justify-between items-center mt-2">
            <span class="text-xs" :class="station.act === '1' ? 'text-green-600' : 'text-red-600'">
              {{ station.act === '1' ? '營運中' : '暫停營運' }}
            </span>
            <button
              @click.stop="toggleFavorite(station)"
              class="btn btn-ghost btn-xs"
              :class="isFavorite(station.sno) ? 'text-red-500' : 'text-gray-400'"
            >
              ❤️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 無搜尋結果 -->
    <div v-if="!loading && searchResults.length === 0 && hasSearched" class="text-center py-8">
      <p class="text-gray-500">找不到符合條件的站點</p>
    </div>

    <!-- 站點詳細資訊 Modal -->
    <dialog ref="detailModal" class="modal">
      <div class="modal-box w-11/12 max-w-2xl">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        
        <div v-if="selectedStation">
          <h3 class="font-bold text-lg mb-4">{{ selectedStation.sna }}</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div>
                <label class="font-semibold">地址：</label>
                <p class="text-sm">{{ selectedStation.ar }}</p>
              </div>
              
              <div>
                <label class="font-semibold">營運狀態：</label>
                <span class="badge" :class="selectedStation.act === '1' ? 'badge-success' : 'badge-error'">
                  {{ selectedStation.act === '1' ? '營運中' : '暫停營運' }}
                </span>
              </div>
              
              <div>
                <label class="font-semibold">總停車格：</label>
                <span class="badge badge-neutral">{{ selectedStation.tot }}</span>
              </div>
            </div>
            
            <div class="space-y-3">
              <div>
                <label class="font-semibold">可借車輛：</label>
                <span class="badge badge-success text-lg">{{ selectedStation.sbi }}</span>
              </div>
              
              <div>
                <label class="font-semibold">可還空位：</label>
                <span class="badge badge-info text-lg">{{ selectedStation.bemp }}</span>
              </div>
              
              <div>
                <label class="font-semibold">資料更新時間：</label>
                <p class="text-sm">{{ formatTime(selectedStation.mday) }}</p>
              </div>
            </div>
          </div>
          
          <div class="modal-action">
            <button
              @click="toggleFavorite(selectedStation)"
              class="btn"
              :class="isFavorite(selectedStation.sno) ? 'btn-error' : 'btn-success'"
            >
              {{ isFavorite(selectedStation.sno) ? '取消收藏' : '加入收藏' }}
            </button>
            <form method="dialog">
              <button class="btn">關閉</button>
            </form>
          </div>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, useTemplateRef } from 'vue'
import { useYouBikeStore } from '@/stores/YouBikeStore'

const store = useYouBikeStore()
const detailModal = useTemplateRef('detailModal')

const searchKeyword = ref('')
const searchResults = ref([])
const selectedStation = ref(null)
const loading = ref(false)
const hasSearched = ref(false)
const favorites = ref([])

// 載入收藏站點
const loadFavorites = () => {
  const saved = localStorage.getItem('youbike-favorites')
  if (saved) {
    favorites.value = JSON.parse(saved)
  }
}

// 儲存收藏站點
const saveFavorites = () => {
  localStorage.setItem('youbike-favorites', JSON.stringify(favorites.value))
}

// 搜尋站點
const searchStations = async () => {
  if (!searchKeyword.value.trim()) return
  
  loading.value = true
  hasSearched.value = true
  
  try {
    const results = await store.searchStations(searchKeyword.value)
    searchResults.value = results
  } catch (error) {
    console.error('搜尋失敗:', error)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

// 顯示站點詳細資訊
const showStationDetail = (station) => {
  selectedStation.value = station
  detailModal.value.showModal()
}

// 切換收藏狀態
const toggleFavorite = (station) => {
  const index = favorites.value.findIndex(fav => fav.sno === station.sno)
  
  if (index > -1) {
    favorites.value.splice(index, 1)
  } else {
    favorites.value.push(station)
  }
  
  saveFavorites()
}

// 檢查是否為收藏站點
const isFavorite = (sno) => {
  return favorites.value.some(fav => fav.sno === sno)
}

// 格式化時間
const formatTime = (timeString) => {
  if (!timeString) return ''
  
  const year = timeString.substring(0, 4)
  const month = timeString.substring(4, 6)
  const day = timeString.substring(6, 8)
  const hour = timeString.substring(8, 10)
  const minute = timeString.substring(10, 12)
  const second = timeString.substring(12, 14)
  
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`
}

onMounted(() => {
  loadFavorites()
})
</script>