import axios from 'axios'

export const getRecommendedTreks = async (userId, token) => {
  try {
    const response = await axios.get(
      `http://10.0.2.2:5000/api/recommendations?userId=${userId}&type=recommendations&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data.success ? response.data.data : []
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return []
  }
}

export const getTrendingTreks = async (token) => {
  try {
    const response = await axios.get(
      'http://10.0.2.2:5000/api/recommendations?type=trending&limit=5',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data.success ? response.data.data : []
  } catch (error) {
    console.error('Error fetching trending treks:', error)
    return []
  }
}

export const getPopularDestinations = async (token) => {
  try {
    const response = await axios.get(
      'http://10.0.2.2:5000/api/recommendations?type=popular-destinations&limit=5',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data.success ? response.data.data : []
  } catch (error) {
    console.error('Error fetching popular destinations:', error)
    return []
  }
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('Token expired or invalid')
    }
    return Promise.reject(error)
  }
)
