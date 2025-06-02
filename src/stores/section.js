import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sectionApi } from '@/api/section'

export const useSectionStore = defineStore('section', () => {
  // 状态
  const sections = ref([])
  const currentSection = ref(null)
  const loading = ref(false)

  // 获取所有版块
  const fetchSections = async () => {
    loading.value = true
    try {
      const response = await sectionApi.getSections()
      if (response.code === 200 && response.data) {
        sections.value = response.data
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '获取版块列表失败' }
      }
    } catch (error) {
      console.error('Fetch sections error:', error)
      return { success: false, message: error.message || '获取版块列表失败' }
    } finally {
      loading.value = false
    }
  }

  // 获取单个版块
  const fetchSection = async (id) => {
    loading.value = true
    try {
      const response = await sectionApi.getSection(id)
      if (response.code === 200 && response.data) {
        currentSection.value = response.data
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '获取版块信息失败' }
      }
    } catch (error) {
      console.error('Fetch section error:', error)
      return { success: false, message: error.message || '获取版块信息失败' }
    } finally {
      loading.value = false
    }
  }

  // 创建版块
  const createSection = async (sectionData) => {
    try {
      const response = await sectionApi.createSection(sectionData)
      if (response.code === 200) {
        // 创建成功后重新获取版块列表
        await fetchSections()
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '创建版块失败' }
      }
    } catch (error) {
      console.error('Create section error:', error)
      return { success: false, message: error.message || '创建版块失败' }
    }
  }

  // 更新版块
  const updateSection = async (id, sectionData) => {
    try {
      const response = await sectionApi.updateSection(id, sectionData)
      if (response.code === 200) {
        // 更新成功后重新获取版块列表
        await fetchSections()
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '更新版块失败' }
      }
    } catch (error) {
      console.error('Update section error:', error)
      return { success: false, message: error.message || '更新版块失败' }
    }
  }

  // 删除版块
  const deleteSection = async (id) => {
    try {
      const response = await sectionApi.deleteSection(id)
      if (response.code === 200) {
        // 删除成功后重新获取版块列表
        await fetchSections()
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.message || '删除版块失败' }
      }
    } catch (error) {
      console.error('Delete section error:', error)
      return { success: false, message: error.message || '删除版块失败' }
    }
  }

  return {
    // 状态
    sections,
    currentSection,
    loading,
    
    // 方法
    fetchSections,
    fetchSection,
    createSection,
    updateSection,
    deleteSection
  }
})
