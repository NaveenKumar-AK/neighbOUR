import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

function Chat() {
  const { jobId } = useParams();
  const navigate = useNavigate();
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

  const handleSend = async (e, customText = null) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputMsg;
    if (!textToSend.trim() || !jobDetails) return;
    
    // Determine receiver
    const receiverId = user.role === 'customer' ? jobDetails.provider._id : jobDetails.customer._id;

    try {
      await api.post('/chat', {
        receiver: receiverId,
        jobRequest: jobId,
        content: textToSend,
        isOffer: textToSend.toLowerCase().includes('offer')
      });
      if (!customText) setInputMsg('');
      fetchChatAndJob();
    } catch (err) {
      alert('Failed to send message');
    }
  };

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const text = `Location: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
        handleSend(null, text);
      }, () => alert('Location access denied.'));
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const scheduleVisit = () => {
    const text = 'I would like to schedule a visit. When are you available?';
    handleSend(null, text);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ padding: '1rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
         <button onClick={() => navigate(-1)} className="btn" style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '0.4rem 0.6rem', borderRadius: '8px', color: 'var(--text)' }}>
           <i className="bi bi-arrow-left"></i>
         </button>
         <div>
           <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Negotiation & Chat</h2>
           <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
             {jobDetails ? `Regarding: ${jobDetails.category}` : "Loading..."}
           </p>
         </div>
      </div>

      <div className="chat-window" style={{ flex: 1, border: 'none', borderRadius: 0, height: 'auto', background: 'var(--bg)' }}>
        <div className="chat-messages" style={{ padding: '1.5rem 1rem' }}>
          {messages.length === 0 && <div style={{textAlign:'center', color:'var(--text-muted)', margin: 'auto'}}>Send a message to start negotiating...</div>}
          {messages.map(m => {
            const isMe = m.sender._id === user.id;
            return (
              <div key={m._id} className={`message ${isMe ? 'message-right' : 'message-left'}`} style={{ maxWidth: '80%', padding: '0.85rem 1.15rem', borderRadius: '16px', borderBottomRightRadius: isMe ? 0 : '16px', borderBottomLeftRadius: !isMe ? 0 : '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: isMe ? 'var(--primary)' : 'var(--surface)' }}>
                {!isMe && <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem', fontWeight: 600 }}>{m.sender.name}</div>}
                <div style={{ wordBreak: 'break-word', lineHeight: 1.4 }}>{m.content.startsWith('Location:') && m.content.includes('http') ? <a href={m.content.split(' ')[1]} target="_blank" rel="noreferrer" style={{color: isMe ? 'white' : 'var(--primary)', textDecoration: 'underline'}}>{m.content}</a> : m.content}</div>
                {m.isOffer && <span className="badge" style={{marginTop:'0.5rem', background: '#FEF3C7', color: '#D97706', border: 'none', fontWeight: 700, fontSize: '0.65rem'}}>OFFER</span>}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          {user.role === 'customer' && (
            <div style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', overflowX: 'auto', background: '#F8FAFC' }}>
              <button type="button" onClick={scheduleVisit} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', whiteSpace: 'nowrap', borderRadius: '20px' }}><i className="bi bi-calendar-event"></i> Schedule Visit</button>
              <button type="button" onClick={shareLocation} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', whiteSpace: 'nowrap', borderRadius: '20px' }}><i className="bi bi-geo-alt"></i> Share Location</button>
            </div>
          )}
          <form className="chat-input-area" onSubmit={e => handleSend(e)} style={{ borderTop: 'none', padding: '1rem' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Type message (use 'offer' to mark price)..." 
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              style={{ flex: 1, borderRadius: '24px', paddingLeft: '1.25rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '24px', padding: '0.75rem 1.5rem' }}>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
