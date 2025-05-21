import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebaseConfig';
import { 
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  where
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './Forum.css';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState({}); // { postId: [replies] }
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'General'
  });
  const [newReply, setNewReply] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    // Load posts
    const postsQuery = query(collection(db, 'forumPosts'), orderBy('createdAt', 'desc'));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setPosts(postsData);
    });

    // Load replies
    const repliesQuery = query(collection(db, 'forumReplies'), orderBy('createdAt', 'asc'));
    const unsubscribeReplies = onSnapshot(repliesQuery, (snapshot) => {
      const repliesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      // Group replies by postId
      const repliesByPost = {};
      repliesData.forEach(reply => {
        if (!repliesByPost[reply.postId]) {
          repliesByPost[reply.postId] = [];
        }
        repliesByPost[reply.postId].push(reply);
      });
      setReplies(repliesByPost);
    });

    return () => {
      unsubscribePosts();
      unsubscribeReplies();
    };
  }, []);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'forumPosts'), {
        ...newPost,
        author: user?.displayName || 'Anonymous',
        userId: user?.uid,
        createdAt: serverTimestamp(),
        likes: 0
      });
      setNewPost({ title: '', content: '', category: 'General' });
    } catch (error) {
      console.error("Error adding post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (postId) => {
    const content = newReply[postId]?.trim();
    if (!content || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'forumReplies'), {
        postId,
        content,
        author: user.displayName || 'Anonymous',
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      setNewReply(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error("Error adding reply:", error);
      alert("Failed to post reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post and all its replies?")) return;
    try {
      // First delete all replies
      const postReplies = replies[postId] || [];
      const deletePromises = postReplies.map(reply => 
        deleteDoc(doc(db, 'forumReplies', reply.id))
      );
      
      await Promise.all([
        ...deletePromises,
        deleteDoc(doc(db, 'forumPosts', postId))
      ]);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("You don't have permission to delete this post.");
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Delete this reply?")) return;
    try {
      await deleteDoc(doc(db, 'forumReplies', replyId));
    } catch (error) {
      console.error("Error deleting reply:", error);
      alert("You don't have permission to delete this reply.");
    }
  };

  const toggleReplies = (postId) => {
    setShowReplies(prev => ({ ...prev, [postId]: !prev[postId] }));
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
        <div className="forum-main">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-selector"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
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
                        onClick={() => handleDeletePost(post.id)}
                        className="delete-btn"
                      >
                        Delete Post
                      </button>
                    )}
                  </div>
                  
                  <div className="reply-section">
                    <button 
                      onClick={() => toggleReplies(post.id)}
                      className="toggle-replies-btn"
                    >
                      {(replies[post.id]?.length || 0)} replies
                      {showReplies[post.id] ? ' ▲' : ' ▼'}
                    </button>
                    
                    {showReplies[post.id] && (
                      <div className="replies-container">
                        {user && (
                          <div className="reply-input-container">
                            <textarea
                              className="reply-input"
                              placeholder="Write a reply..."
                              value={newReply[post.id] || ''}
                              onChange={(e) => setNewReply(prev => ({
                                ...prev,
                                [post.id]: e.target.value
                              }))}
                            />
                            <button 
                              onClick={() => handleSubmitReply(post.id)}
                              className="reply-btn"
                              disabled={!newReply[post.id]?.trim() || isSubmitting}
                            >
                              {isSubmitting ? 'Posting...' : 'Reply'}
                            </button>
                          </div>
                        )}
                        
                        <div className="replies-list">
                          {replies[post.id]?.map((reply) => (
                            <div key={reply.id} className="reply-item">
                              <div className="reply-header">
                                <span className="reply-author">{reply.author}</span>
                                <span className="reply-time">
                                  {reply.createdAt?.toLocaleString()}
                                </span>
                                {user?.uid === reply.userId && (
                                  <button 
                                    onClick={() => handleDeleteReply(reply.id)}
                                    className="delete-reply-btn"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                              <div className="reply-content">{reply.content}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

      {user && (
        <div className="new-post-container">
          <form onSubmit={handleSubmitPost} className="post-form">
            <div className="form-row">
              <input
                type="text"
                placeholder="Post title"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                required
                maxLength={100}
              />
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                required
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
                rows={3}
                maxLength={2000}
              />
              <button 
                type="submit" 
                className="submit-btn"
                disabled={!newPost.title.trim() || !newPost.content.trim() || isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Forum;