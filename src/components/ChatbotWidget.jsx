import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { chatbotApi } from '../api/chatbotApi';
import { addToCartLocal } from '../store/slices/cartSlice';
import './ChatbotWidget.css';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Package,
  ShoppingBag,
  RotateCcw,
  CreditCard,
  PhoneCall,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Star,
  Trash2,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  LifeBuoy,
  Tag,
  ShoppingCart,
  Heart,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  ArrowRight
} from 'lucide-react';

export default function ChatbotWidget() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickChips, setQuickChips] = useState([]);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [likedMsgs, setLikedMsgs] = useState({});
  const [dislikedMsgs, setDislikedMsgs] = useState({});

  // Voice Speech State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Return Flow Interactive State
  const [returnOrderSelected, setReturnOrderSelected] = useState(null);
  const [returnSuccessMsg, setReturnSuccessMsg] = useState(null);

  const messagesEndRef = useRef(null);

  const welcomeChips = [
    '📦 Where is my order?',
    '🛍️ Recommend products',
    '🔄 Return my order',
    '💰 Check refund',
    '🏷️ Today\'s offers',
    '🛒 Help with my cart'
  ];

  // Speech Recognition Setup (Flipkart Voice Search 🎙️)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join('');
        setInputValue(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice search is not supported by your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputValue('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const cleanText = text.replace(/[*#_~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Initialize Welcome Message
  useEffect(() => {
    const savedChat = localStorage.getItem('bmart_chat_history');
    if (savedChat) {
      try {
        const parsed = JSON.parse(savedChat);
        if (parsed.length > 0) {
          setMessages(parsed);
          setQuickChips(welcomeChips);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved chat history", e);
      }
    }

    resetChat();
  }, [user]);

  // Persist Chat History
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('bmart_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto Scroll to Bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const resetChat = () => {
    const welcomeMsg = {
      id: 'welcome-' + Date.now(),
      sender: 'bot',
      text: `Hello 👋 Welcome to B-MART Virtual Support.
I'm your 24/7 AI shopping assistant.
How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickChips: welcomeChips
    };
    setMessages([welcomeMsg]);
    setQuickChips(welcomeChips);
    setReturnOrderSelected(null);
    setReturnSuccessMsg(null);
    localStorage.removeItem('bmart_chat_history');
  };

  const handleClearHistory = () => {
    resetChat();
  };

  const handleSendMessage = async (textToSend) => {
    const queryText = (textToSend || inputValue).trim();
    if (!queryText) return;

    // Add User Message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      const res = await chatbotApi.sendQuery(queryText);
      const chatbotRes = res.data?.data || res.data || {};

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: chatbotRes.reply || getLocalChatbotReply(queryText),
        intent: chatbotRes.intent,
        products: chatbotRes.products || [],
        orders: chatbotRes.orders || [],
        comparisonProducts: chatbotRes.comparisonProducts || [],
        ticket: chatbotRes.ticket || null,
        quickChips: chatbotRes.quickChips || welcomeChips,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      if (chatbotRes.quickChips && chatbotRes.quickChips.length > 0) {
        setQuickChips(chatbotRes.quickChips);
      }
    } catch (err) {
      const fallbackReply = getLocalChatbotReply(queryText);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: fallbackReply,
        quickChips: welcomeChips,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const getLocalChatbotReply = (query) => {
    const q = query.toLowerCase();

    // Security Rule
    if (q.includes('password') || q.includes('otp') || q.includes('card') || q.includes('cvv') || q.includes('pin')) {
      return "🔒 For your security, please never share passwords, OTPs, or card details in chat. All payments on B-MART are processed through our 256-bit SSL encrypted Checkout page.";
    }

    // Platform & About
    if (q.includes('platform') || q.includes('about') || q.includes('tell me about') || q.includes('what is bmart') || q.includes('what is b-mart') || q.includes('store') || q.includes('company')) {
      return "🛒 B-MART is a premier 24/7 online e-commerce platform specializing in Backpacks, Handbags, Travel Bags, Wallets, and Fashion Accessories. We feature 100% genuine products, free express delivery on orders over ₹499, 10-day replacement policies, and instant refunds!";
    }

    // Human Escalation
    if (q.includes('human') || q.includes('agent') || q.includes('escalate') || q.includes('operator') || q.includes('person') || q.includes('support ticket')) {
      return "👨‍💼 I have transferred your request to B-MART Live Support (Ref Ticket: #BM-TICKET-9042).\n\nYou can reach a live specialist directly at 1800-123-BMART (1800-123-2627) or support@bmart.com.";
    }

    // Out of Scope
    if (q.includes('weather') || q.includes('cricket') || q.includes('movie') || q.includes('code') || q.includes('python') || q.includes('news')) {
      return "I am B-MART Assistant ✨, specialized in helping you with Backpacks, Handbags, Travel Bags, Wallets, orders, and store policies! How can I assist with your shopping today?";
    }

    // Order Tracking (Supports Hindi/Telugu)
    if (q.includes('order') || q.includes('track') || q.includes('status') || q.includes('delivery') || q.includes('mera order') || q.includes('kaha hai') || q.includes('ekkada undi')) {
      if (isAuthenticated) {
        return "📦 You can view live tracking for all your placed orders directly under Your Profile > Orders. Orders are dispatched within 24 hours!";
      }
      return "📦 Please log in to view your orders. Once logged in, I can pull up your exact live order status and tracking ID.";
    }

    // Recommendations
    if (q === 'bag' || q === 'recommend' || q === 'show bags' || q === 'need a bag' || q.includes('college')) {
      return "I'd love to help! Could you tell me your preferred style (e.g., Laptop Backpack, Leather Handbag, or Travel Duffel) or your budget range?";
    }

    if (q.includes('recommend') || q.includes('bag') || q.includes('backpack') || q.includes('handbag') || q.includes('laptop') || q.includes('product') || q.includes('buy') || q.includes('search') || q.includes('wallet')) {
      return "🎒 Recommended B-MART Collections:\n\n• Premium Leather Handbags (₹1,899) - Elegant design for daily & formal use\n• Ergonomic Laptop Backpacks (₹1,499) - Padded laptop compartment & water resistant\n• Travel Duffel Bags (₹2,299) - Spacious multi-pocket travel luggage";
    }

    // Policy & Return
    if (q.includes('return') || q.includes('refund') || q.includes('replace') || q.includes('exchange') || q.includes('damaged') || q.includes('wrong product')) {
      return "🔄 B-MART Easy Return & Refund Policy:\n\n• 10-Day Replacement Policy on eligible items.\n• Instant Refund to UPI/Bank account after pickup.\n• Initiate directly from Profile > Orders.";
    }

    if (q.includes('payment') || q.includes('cod') || q.includes('pay') || q.includes('upi') || q.includes('card')) {
      return "💳 Payment Methods Supported on B-MART:\n\n• Cash on Delivery (COD)\n• Online UPI (Google Pay, PhonePe, Paytm, BHIM)\n• Credit/Debit Cards & Net Banking via Razorpay\n• 100% Secure Checkout with 256-bit SSL Encryption.";
    }

    if (q.includes('offer') || q.includes('discount') || q.includes('coupon') || q.includes('sale')) {
      return "🎉 B-MART Today's Offers: Enjoy flat 20% OFF on all bag collections + Free Express Shipping on orders over ₹499!";
    }

    return "I'd be glad to assist you with that! You can ask me to track your orders, recommend top bags, check return policies, or explain payment options.";
  };

  const handleChipClick = (chipText) => {
    handleSendMessage(chipText);
  };

  const handleCopyMessage = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleLike = (msgId) => {
    setLikedMsgs((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
    setDislikedMsgs((prev) => ({ ...prev, [msgId]: false }));
  };

  const handleDislike = (msgId) => {
    setDislikedMsgs((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
    setLikedMsgs((prev) => ({ ...prev, [msgId]: false }));
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    dispatch(addToCartLocal({ product, quantity: 1 }));
  };

  const handleToggleWishlist = (product, e) => {
    e.stopPropagation();
    navigate(`/products/${product.productId}`);
  };

  const handleSelectReturnReason = (reason) => {
    if (!returnOrderSelected) return;
    setReturnSuccessMsg(`Return request created successfully for Order #${returnOrderSelected.orderId}. Pickup scheduled within 48 hours.`);
    setReturnOrderSelected(null);
  };

  const handleCreateSupportTicket = async () => {
    try {
      const res = await chatbotApi.createSupportTicket({
        email: user?.email || 'customer@bmart.com',
        category: 'GENERAL_SUPPORT',
        issue: 'Customer requested human support via chatbot escalation',
        conversationSummary: 'Multi-turn chat escalation request'
      });
      const ticket = res.data?.data || {};
      const ticketMsg = {
        id: Date.now(),
        sender: 'bot',
        text: `👨‍💼 Support Ticket Created!\n\n🎫 Ticket ID: ${ticket.ticketId || '#BM-TICKET-9042'}\n• Priority: High\n• Status: OPEN\n\nOur customer care team will respond within 2 hours.`,
        ticket: ticket,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, ticketMsg]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bmart-chat-container">
      {/* FLOATING LAUNCHER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bmart-chat-launcher"
          aria-label="Open B-MART Virtual Assistant"
        >
          <div className="bmart-chat-launcher-status">
            <Bot className="w-6 h-6 text-white" />
            <span className="bmart-chat-online-dot"></span>
          </div>
          <div style={{ textTransform: 'none' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              B-MART Assistant <Sparkles className="w-3.5 h-3.5" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
            </div>
            <div style={{ fontSize: '11px', color: '#e0e7ff', fontWeight: '400' }}>Online • 24/7 AI Support</div>
          </div>
        </button>
      )}

      {/* CHATBOT DIALOG MODAL */}
      {isOpen && (
        <div className="bmart-chat-window">
          {/* HEADER */}
          <div className="bmart-chat-header">
            <div className="bmart-chat-header-info">
              <div className="bmart-chat-avatar-icon">
                🤖
              </div>
              <div>
                <h3 className="bmart-chat-title">
                  B-MART Assistant ✨
                </h3>
                <p className="bmart-chat-subtitle">
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                  Online • 24/7 AI Support
                </p>
              </div>
            </div>

            <div className="bmart-chat-header-actions">
              <button
                onClick={handleClearHistory}
                title="Clear Conversation"
                className="bmart-chat-icon-btn"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={resetChat}
                title="New Conversation"
                className="bmart-chat-icon-btn"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="bmart-chat-icon-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MESSAGES BODY */}
          <div className="bmart-chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`bmart-msg-row ${msg.sender}`}
              >
                <div className="bmart-msg-bubble-container">
                  {msg.sender === 'bot' && (
                    <div className="bmart-bot-avatar">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`bmart-msg-bubble ${msg.sender}`}>
                    {/* MESSAGE TEXT */}
                    <div>{msg.text}</div>

                    {/* AI LABEL & SPEAKER */}
                    {msg.sender === 'bot' && (
                      <div className="bmart-msg-meta">
                        <span className="bmart-ai-badge">
                          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" /> AI Generated Response
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => speakText(msg.text)}
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Listen Read Aloud"
                          >
                            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-blue-600" /> : <Volume2 className="w-3.5 h-3.5 hover:text-blue-600" />}
                          </button>
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="bmart-bot-avatar" style={{ backgroundColor: '#334155' }}>
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* BOT MESSAGE ACTION CONTROLS */}
                {msg.sender === 'bot' && (
                  <div className="bmart-msg-actions">
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className="bmart-action-btn"
                      title="Copy Response"
                    >
                      {copiedMsgId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedMsgId === msg.id ? 'Copied' : 'Copy'}
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => handleLike(msg.id)}
                      className={`bmart-action-btn ${likedMsgs[msg.id] ? 'active' : ''}`}
                    >
                      <ThumbsUp className="w-3 h-3" /> Like
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => handleDislike(msg.id)}
                      className={`bmart-action-btn ${dislikedMsgs[msg.id] ? 'active' : ''}`}
                    >
                      <ThumbsDown className="w-3 h-3" /> Dislike
                    </button>
                  </div>
                )}

                {/* RICH PRODUCT CARDS IN CHAT */}
                {msg.products && msg.products.length > 0 && (
                  <div className="bmart-cards-container">
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '4px 0' }}>
                      Recommended Products:
                    </p>
                    {msg.products.map((prod) => (
                      <div
                        key={prod.productId}
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/products/${prod.productId}`);
                        }}
                        className="bmart-product-card"
                      >
                        <img
                          src={prod.imageUrl || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=200'}
                          alt={prod.name}
                          className="bmart-product-img"
                        />
                        <div className="bmart-product-info">
                          <h4 className="bmart-product-title">
                            {prod.name}
                          </h4>
                          <div className="bmart-product-price-row">
                            <span className="bmart-price">₹{prod.price}</span>
                            {prod.discountPrice && (
                              <span className="bmart-discount-badge">
                                20% OFF
                              </span>
                            )}
                            <span className="bmart-rating">
                              <Star className="w-3 h-3" style={{ fill: '#f59e0b', color: '#f59e0b' }} /> {prod.rating || 4.5}
                            </span>
                          </div>
                          <div className="bmart-card-btn-group">
                            <button
                              onClick={(e) => handleAddToCart(prod, e)}
                              className="bmart-add-cart-btn"
                            >
                              🛒 Add to Cart
                            </button>
                            <button
                              onClick={(e) => handleToggleWishlist(prod, e)}
                              style={{ padding: '4px 8px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                            >
                              👁️ View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* FLIPKART VISUAL ORDER TIMELINE TRACKER */}
                {msg.orders && msg.orders.length > 0 && (
                  <div className="bmart-cards-container">
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '4px 0' }}>
                      Flipkart-Style Live Order Tracker:
                    </p>
                    {msg.orders.map((ord) => (
                      <div
                        key={ord.orderId}
                        style={{ padding: '14px', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '10px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Package className="w-4 h-4 text-blue-600" /> Order #{ord.orderId}
                          </span>
                          <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                            {ord.status}
                          </span>
                        </div>

                        {/* VISUAL 4-STEP TIMELINE BAR */}
                        <div className="bmart-timeline-tracker">
                          <div className="bmart-step active">
                            <div className="bmart-step-dot">✓</div>
                            <span>Placed</span>
                          </div>
                          <div className="bmart-step-line active"></div>
                          <div className="bmart-step active">
                            <div className="bmart-step-dot">✓</div>
                            <span>Shipped</span>
                          </div>
                          <div className="bmart-step-line active"></div>
                          <div className="bmart-step active">
                            <div className="bmart-step-dot">🚚</div>
                            <span>Out for Delivery</span>
                          </div>
                          <div className="bmart-step-line"></div>
                          <div className="bmart-step">
                            <div className="bmart-step-dot">🏠</div>
                            <span>Delivered</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '11.5px', color: '#475569', backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '8px' }}>
                          <span>Courier: <strong>BlueDart (BD-98234)</strong></span>
                          <span>Est Delivery: <strong style={{ color: '#059669' }}>Tomorrow</strong></span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              navigate('/profile');
                            }}
                            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '700', fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            Track & Invoice <ChevronRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setReturnOrderSelected(ord)}
                            style={{ padding: '4px 10px', backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Return / Exchange
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* AMAZON SIDE-BY-SIDE SPEC COMPARISON TABLE */}
                {msg.comparisonProducts && msg.comparisonProducts.length >= 2 && (
                  <div className="bmart-cards-container">
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '4px 0' }}>
                      Amazon Spec Comparison Grid:
                    </p>
                    <div className="bmart-comparison-table-wrapper">
                      <table className="bmart-comparison-table">
                        <thead>
                          <tr>
                            <th>Feature</th>
                            <th>{msg.comparisonProducts[0].name.slice(0, 16)}...</th>
                            <th>{msg.comparisonProducts[1].name.slice(0, 16)}...</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Price</td>
                            <td className="bmart-highlight-price">₹{msg.comparisonProducts[0].price}</td>
                            <td className="bmart-highlight-price">₹{msg.comparisonProducts[1].price}</td>
                          </tr>
                          <tr>
                            <td>Rating</td>
                            <td>⭐ {msg.comparisonProducts[0].rating || 4.5}</td>
                            <td>⭐ {msg.comparisonProducts[1].rating || 4.6}</td>
                          </tr>
                          <tr>
                            <td>Material</td>
                            <td>Waterproof Polyester</td>
                            <td>Genuine Faux Leather</td>
                          </tr>
                          <tr>
                            <td>Capacity</td>
                            <td>28 Liters</td>
                            <td>22 Liters</td>
                          </tr>
                          <tr>
                            <td>Warranty</td>
                            <td>1 Year Brand</td>
                            <td>6 Months Brand</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* INTERACTIVE RETURN FLOW */}
                {returnOrderSelected && (
                  <div className="bmart-cards-container" style={{ backgroundColor: '#fffbeb', padding: '12px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                    <p style={{ fontWeight: '700', color: '#92400e', fontSize: '12px', margin: '0 0 8px 0' }}>
                      Select Return Reason for Order #{returnOrderSelected.orderId}:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {['Damaged product', 'Wrong product received', 'Product not as expected', 'Missing item'].map((reason) => (
                        <button
                          key={reason}
                          onClick={() => handleSelectReturnReason(reason)}
                          style={{ padding: '8px 10px', backgroundColor: '#ffffff', border: '1px solid #fcd34d', borderRadius: '6px', textAlign: 'left', color: '#78350f', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          • {reason}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {returnSuccessMsg && (
                  <div className="bmart-cards-container" style={{ backgroundColor: '#ecfdf5', padding: '10px 12px', borderRadius: '12px', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '12px', fontWeight: '600', display: 'flex', itemsCenter: 'center', gap: '6px' }}>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{returnSuccessMsg}</span>
                  </div>
                )}

                {/* SUPPORT ESCALATION BUTTONS */}
                {msg.intent === 'HUMAN_AGENT' && (
                  <div className="bmart-cards-container" style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                    <p style={{ fontWeight: '700', color: '#1e40af', fontSize: '12px', margin: '0 0 8px 0' }}>
                      Human Support Options:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <button
                        onClick={handleCreateSupportTicket}
                        style={{ padding: '8px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '11.5px', cursor: 'pointer' }}
                      >
                        🎫 Create Support Ticket
                      </button>
                      <a
                        href="mailto:support@bmart.com"
                        style={{ padding: '8px', backgroundColor: '#ffffff', color: '#1d4ed8', border: '1px solid #93c5fd', borderRadius: '6px', fontWeight: '700', fontSize: '11.5px', textAlign: 'center', textDecoration: 'none', display: 'block' }}
                      >
                        📧 Email Support
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="bmart-bot-avatar">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bmart-msg-bubble bot" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px' }}>
                  <div className="bmart-typing-dots">
                    <span className="bmart-dot"></span>
                    <span className="bmart-dot"></span>
                    <span className="bmart-dot"></span>
                  </div>
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUICK ACTION CHIPS */}
          {quickChips && quickChips.length > 0 && (
            <div className="bmart-chips-container">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(chip)}
                  className="bmart-chip-btn"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* INPUT FORM WITH MIC & SPEAKER */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="bmart-input-form"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`bmart-mic-btn ${isListening ? 'listening' : ''}`}
              title="Voice Search 🎙️ (Speak query)"
            >
              {isListening ? <MicOff className="w-4 h-4 text-rose-600 animate-pulse" /> : <Mic className="w-4 h-4 text-slate-600 hover:text-blue-600" />}
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isListening ? "Listening... Speak now 🎙️" : "Ask B-MART Assistant..."}
              className="bmart-input-field"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bmart-send-btn"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
