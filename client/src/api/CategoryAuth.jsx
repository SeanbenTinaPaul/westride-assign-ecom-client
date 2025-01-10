//ติดต่อ backend
import React from 'react'
import axios from 'axios'

//ไม่ได้รับเป็น {form} แสดงว่าถูกcalled ในฐานะฟังก์ชัน(ไม่ใช่ component) ► createCategory(token, form)
export const createCategory = async (token, form) => {
  return await axios.post('http://localhost:5000/api/category', form, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export const listCategory = async (token) => {
  return await axios.get('http://localhost:5000/api/category', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export const removeCategory = async (token,id) => {
  return await axios.delete('http://localhost:5000/api/category/'+id, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

/*
axios.get: 2 arguments (url, option-res.headers)
axios.post: 2 or 3 arguments (url, res.body), (url, res.body, option-res.headers)
*/