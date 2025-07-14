import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useYouBikeStore = defineStore('youbike', () => {
  const stations = ref([])
  
  // 獲取所有站點資料
  const fetchStations = async () => {
    try {
      const response = await axios.get('https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json')
      stations.value = response.data
      return response.data
    } catch (error) {
      console.error('獲取站點資料失敗:', error)
      throw error
    }
  }
  
  // 搜尋站點
  const searchStations = async (keyword) => {
    try {
      // 如果沒有快取資料，先獲取
      if (stations.value.length === 0) {
        await fetchStations()
      }
      
      const lowerKeyword = keyword.toLowerCase()
      
      return stations.value.filter(station => 
        station.sna.toLowerCase().includes(lowerKeyword) || 
        station.ar.toLowerCase().includes(lowerKeyword)
      )
    } catch (error) {
      console.error('搜尋站點失敗:', error)
      throw error
    }
  }
  
  // 根據站點編號獲取站點資訊
  const getStationById = (sno) => {
    return stations.value.find(station => station.sno === sno)
  }
  
  return {
    stations,
    fetchStations,
    searchStations,
    getStationById
  }
})