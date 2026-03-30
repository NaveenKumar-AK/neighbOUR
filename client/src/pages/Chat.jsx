import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

function Chat() {
  const { jobId } = useParams();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [jobDetails, setJobDetails] = useState(null);
  
  const messagesEndRef = useRef(null);

  const fetchChatAndJob = async () => {
    try {
      // Basic approach: fetch all history where I am involved, and find the current job
      // A better API endpoint would be to just get the job details by ID, but we only have History
      const historyRes = await api.get('/jobs/history');
      const currentJob = historyRes.data.find(j => j._id === jobId);
      if (currentJob) setJobDetails(currentJob);

      // fetch messages
      const msgs = await api.get(`/chat/${jobId}`);
      setMessages(msgs.data);
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching chat', err);
    }
  };

  useEffect(() => {
    fetchChatAndJob();
    // Simple polling every 3 seconds
    const interval = setInterval(fetchChatAndJob, 3000);
    return () => clearInterval(interval);
  }, [jobId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !jobDetails) return;
    
    // Determine receiver
    const receiverId = user.role === 'customer' ? jobDetails.provider._id : jobDetails.customer._id;

    try {
      await api.post('/chat', {
        receiver: receiverId,
        jobRequest: jobId,
        content: inputMsg,
        isOffer: inputMsg.toLowerCase().includes('offer')
      });
      setInputMsg('');
      fetchChatAndJob();
    } catch (err) {
      alert('Failed to send message');
    }
  };

  return (
    <div className="container">
      <h2>Negotiation & Chat</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
        {jobDetails ? `Chatting regarding ${jobDetails.category}` : "Loading Job Details..."}
      </p>

      <div className="chat-window">
        <div className="chat-messages">
          {messages.map(m => {
            const isMe = m.sender._id === user.id;
            return (
              <div key={m._id} className={`message ${isMe ? 'message-right' : 'message-left'}`}>
                {!isMe && <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem' }}>{m.sender.name}</div>}
                <div>{m.content}</div>
                {m.isOffer && <span className="badge" style={{marginTop:'0.5rem', background: '#D97706', color: 'white'}}>Offer</span>}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Type your message... (include 'offer' to mark as price negotiation)" 
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
