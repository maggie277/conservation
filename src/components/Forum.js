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
  updateDoc,
  getDoc,
  runTransaction
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
  const [replyContents, setReplyContents] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [user] = useAuthState(auth);
  const forumContentRef = useRef(null);
  
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
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        replies: doc.data().replies?.map(reply => ({
          ...reply,
          createdAt: reply.createdAt?.toDate?.() || new Date() // Fallback to current date
        })) || []
      }));
      setPosts(postsData);
      
      const initialStates = postsData.reduce((acc, post) => {
        acc.replyContents[post.id] = '';
        acc.showReplies[post.id] = false;
        return acc;
      }, { replyContents: {}, showReplies: {} });
      
      setReplyContents(initialStates.replyContents);
      setShowReplies(initialStates.showReplies);
    });
    return unsubscribe;
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
        replies: []
      });
      setNewPost({ title: '', content: '', category: 'General' });
    } catch (error) {
      console.error("Error adding post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      await deleteDoc(doc(db, 'forumPosts', postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("You don't have permission to delete this post.");
    }
  };

  const handleReplySubmit = async (postId) => {
    const content = replyContents[postId]?.trim();
    if (!content || !user) return;

    setIsSubmittingReply(true);
    const tempReplyId = Date.now().toString();

    try {
      const postRef = doc(db, 'forumPosts', postId);
      
      // Optimistic update with client-side timestamp
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              replies: [
                ...post.replies, 
                {
                  id: tempReplyId,
                  content,
                  author: user.displayName || 'Anonymous',
                  userId: user.uid,
                  createdAt: new Date()
                }
              ]
            }
          : post
      ));

      // Transaction-based update for data consistency
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
          throw new Error("Post does not exist");
        }
        
        const currentReplies = postDoc.data().replies || [];
        
        transaction.update(postRef, {
          replies: [...currentReplies, {
            content,
            author: user.displayName || 'Anonymous',
            userId: user.uid
          }],
          lastUpdated: serverTimestamp() // Track update time separately
        });
      });

      setReplyContents(prev => ({ ...prev, [postId]: '' }));
      setShowReplies(prev => ({ ...prev, [postId]: true }));
    } catch (error) {
      console.error("Error adding reply:", error);
      // Revert optimistic update
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              replies: post.replies.filter(reply => reply.id !== tempReplyId)
            }
          : post
      ));
      alert(`Failed to post reply: ${error.message}`);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReplyKeyDown = (e, postId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReplySubmit(postId);
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

      <div className="forum-content" ref={forumContentRef}>
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
                        onClick={() => handleDelete(post.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  
                  <div className="reply-section">
                    <button 
                      onClick={() => toggleReplies(post.id)}
                      className="toggle-replies-btn"
                    >
                      {post.replies.length ? `${post.replies.length} replies` : 'No replies yet'}
                    </button>
                    
                    {showReplies[post.id] && post.replies.length > 0 && (
                      <div className="replies-list">
                        {post.replies.map((reply) => (
                          <div key={reply.id || reply.createdAt?.toString()} className="reply-item">
                            <div className="reply-header">
                              <span className="reply-author">{reply.author}</span>
                              <span className="reply-time">
                                {reply.createdAt?.toLocaleString() || 'Just now'}
                              </span>
                            </div>
                            <div className="reply-content">{reply.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {user && (
                      <div className="reply-input-container">
                        <textarea
                          className="reply-input"
                          placeholder="Write a reply..."
                          value={replyContents[post.id] || ''}
                          onChange={(e) => setReplyContents(prev => ({
                            ...prev,
                            [post.id]: e.target.value
                          }))}
                          onKeyDown={(e) => handleReplyKeyDown(e, post.id)}
                        />
                        <button 
                          onClick={() => handleReplySubmit(post.id)}
                          className="reply-btn"
                          disabled={!replyContents[post.id]?.trim() || isSubmittingReply}
                        >
                          {isSubmittingReply ? 'Posting...' : 'Reply'}
                        </button>
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
          <form onSubmit={handleSubmit} className="post-form">
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
                disabled={!newPost.title.trim() || !newPost.content.trim()}
              >
                Post
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Forum;