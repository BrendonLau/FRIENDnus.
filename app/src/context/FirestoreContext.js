import React, { useContext, useState, useEffect } from 'react'
import db from './firebase.config';
function store() {
const[blogs, setBlogs]=useState([])
useEffect(() => {fetchBlogs();}, [])
const fetchBlogs = async() =>{
  const response = db.collection('Blogs');
  const data = await response.get();
  data.docs.forEach(item =>{setBlogs([...blogs, item.data()])})
}
return (
  <div className="App">
    {
      blogs && blogs.map(blog=>{
        return(
          <div className="blog-container">
            <h4>{blog.title}</h4>
            <p>{blog.body}</p>
          </div>
        )
      })
    }
  </div>
);
  }

export default store;