import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Forum.css';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    author: '',
    category: 'General'
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:4001/api/forum/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4001/api/forum/posts', newPost);
      setNewPost({
        title: '',
        content: '',
        author: '',
        category: 'General'
      });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="forum-container">
      <h1>Farmers Forum</h1>
      <div className="forum-content">
        <div className="post-form">
          <h2>Share Your Idea</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={newPost.title}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="author"
              placeholder="Your Name"
              value={newPost.author}
              onChange={handleInputChange}
              required
            />
            <select
              name="category"
              value={newPost.category}
              onChange={handleInputChange}
            >
              <option value="General">General</option>
              <option value="Crops">Crops</option>
              <option value="Livestock">Livestock</option>
            </select>
            <textarea
              name="content"
              placeholder="Your message..."
              value={newPost.content}
              onChange={handleInputChange}
              required
            />
            <button type="submit">Post</button>
          </form>
        </div>

        <div className="posts-list">
          <h2>Recent Discussions</h2>
          {posts.length === 0 ? (
            <p>No discussions yet. Be the first to share!</p>
          ) : (
            posts.map(post => (
              <div key={post._id} className="post">
                <h3>{post.title}</h3>
                <p className="category">{post.category}</p>
                <p>{post.content}</p>
                <div className="post-footer">
                  <span>By: {post.author}</span>
                  <span>{new Date(post.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;