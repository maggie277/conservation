import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { 
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './Forum.css';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General'
  });
  const [user] = useAuthState(auth);
  
  const categories = [
    'All',
    'General',
    'Crop Farming',
    'Livestock',
    'Agroforestry',
    'Water Conservation',
    'Soil Restoration',
    'Sustainable Agriculture',
    'Land Conservation',
    'Conservation Farming',
    'Regenerative Agriculture'
  ];
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  useEffect(() => {
    const q = query(collection(db, 'forumPosts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })));
    });
    return () => unsubscribe();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    try {
      await addDoc(collection(db, 'forumPosts'), {
        ...newPost,
        author: user?.displayName || 'Anonymous',
        userId: user?.uid,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0
      });
      setNewPost({ title: '', content: '', category: 'General' });
    } catch (error) {
      console.error("Error adding post: ", error);
    }
  };
  
  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post permanently?")) return;
    
    try {
      await deleteDoc(doc(db, 'forumPosts', postId));
    } catch (error) {
      console.error("Error deleting post: ", error);
    }
  };

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="forum-page">
      <div className="forum-header">
        <h1>Community Forum</h1>
        <p>Discuss sustainable farming practices with the community</p>
      </div>

      <div className="forum-content">
        {/* Sidebar */}
        <div className="forum-sidebar">
          <div className="sidebar-section">
            <h3>Categories</h3>
            <ul className="category-list">
              {categories.map((cat) => (
                <li 
                  key={cat}
                  className={selectedCategory === cat ? 'active' : ''}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="forum-main">
          {/* Posts List */}
          <div className="posts-container">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <span className="post-category">{post.category}</span>
                    <h3>{post.title}</h3>
                    <span className="post-author">
                      Posted by {post.author} • {post.createdAt?.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="post-content">{post.content}</p>
                  <div className="post-actions">
                    {user?.uid === post.userId && (
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    )}
                    <Link to={`/forum/${post.id}`} className="view-btn">
                      View Discussion
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-posts">
                <p>No posts found in this category. Be the first to start a discussion!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed New Post Form at Bottom */}
      {user && (
        <div className="new-post-container">
          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-row">
              <input
                type="text"
                placeholder="Post title"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                required
              />
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({...newPost, category: e.target.value})}
              >
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="message-input">
              <textarea
                placeholder="What's on your mind?"
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                required
              />
              <button type="submit" className="submit-btn">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Forum;