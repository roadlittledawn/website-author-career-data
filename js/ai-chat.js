/**
 * AI Chat Component
 * Side panel chat interface for AI writing assistant
 */

class AIChat {
  constructor(api) {
    this.api = api;
    this.isOpen = false;
    this.chatHistory = [];
    this.currentContext = null;
    this.element = null;
    this.isStreaming = false;
  }

  /**
   * Open AI chat panel with context
   */
  async open(options) {
    const {
      collection,
      itemId,
      roleType,
      field
    } = options;

    try {
      // Show loading state
      this.showLoadingState();

      // Build context for current editing session
      this.currentContext = await buildSmartContext({
        collection,
        itemId,
        roleType,
        field,
        api: this.api
      });

      // Create UI if not exists
      if (!this.element) {
        this.element = this.createChatUI();
        document.body.appendChild(this.element);
      }

      // Update context indicator
      this.updateContextIndicator(options);

      // Clear previous chat history (fresh start for new context)
      this.chatHistory = [];
      this.clearMessages();

      // Add welcome message
      this.addSystemMessage(
        `AI Writing Assistant ready! I have context about your ${collection} for ${roleType.replace(/_/g, ' ')} roles.`
      );

      // Slide in panel
      this.element.classList.add('open');
      this.isOpen = true;

      // Focus on input
      const input = this.element.querySelector('textarea');
      if (input) input.focus();
    } catch (error) {
      console.error('Error opening AI chat:', error);
      this.showError('Failed to initialize AI assistant. Please try again.');
    }
  }

  /**
   * Close AI chat panel
   */
  close() {
    if (this.element) {
      this.element.classList.remove('open');
    }
    this.isOpen = false;
  }

  /**
   * Send message to AI
   */
  async sendMessage(userMessage) {
    if (!userMessage || !userMessage.trim()) {
      return;
    }

    const trimmedMessage = userMessage.trim();

    // Add user message to chat
    this.addMessage('user', trimmedMessage);

    // Show typing indicator
    this.showTypingIndicator();
    this.isStreaming = true;

    try {
      // Prepare messages for API
      const messages = [
        ...this.chatHistory,
        { role: 'user', content: trimmedMessage }
      ];

      // Call AI assistant API
      const response = await this.api.callAI({
        messages,
        context: this.currentContext,
        options: {
          stream: false, // Simplified - use non-streaming for now
          maxTokens: 1000,
          temperature: 0.7
        }
      });

      this.hideTypingIndicator();
      this.isStreaming = false;

      // Add AI response to chat
      const assistantMessage = response.message.content;
      this.addMessage('assistant', assistantMessage);

      // Update chat history
      this.chatHistory.push(
        { role: 'user', content: trimmedMessage },
        { role: 'assistant', content: assistantMessage }
      );

      // Show usage info if available
      if (response.usage) {
        console.log('Token usage:', response.usage);
      }
    } catch (error) {
      console.error('AI error:', error);
      this.hideTypingIndicator();
      this.isStreaming = false;

      const errorMessage = error.code === 'RATE_LIMIT'
        ? 'Rate limit exceeded. Please wait a moment before trying again.'
        : 'Failed to get AI response. Please try again.';

      this.showError(errorMessage);
    }
  }

  /**
   * Create chat UI element
   */
  createChatUI() {
    const panel = document.createElement('div');
    panel.className = 'ai-chat-panel';
    panel.innerHTML = `
      <div class="ai-chat-header">
        <div class="ai-chat-title">
          <svg class="ai-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
          </svg>
          <h3>AI Writing Assistant</h3>
        </div>
        <button class="close-btn" aria-label="Close AI assistant">&times;</button>
      </div>
      <div class="ai-chat-context">
        <span class="context-indicator">Loading context...</span>
      </div>
      <div class="ai-chat-messages">
        <!-- Messages will be added here -->
      </div>
      <div class="ai-chat-input-container">
        <textarea
          class="ai-chat-input"
          placeholder="Ask AI to help you write..."
          rows="3"
          aria-label="Message to AI assistant"
        ></textarea>
        <div class="ai-chat-actions">
          <button class="send-btn" aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
            Send
          </button>
        </div>
      </div>
    `;

    // Attach event listeners
    const closeBtn = panel.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => this.close());

    const sendBtn = panel.querySelector('.send-btn');
    sendBtn.addEventListener('click', () => this.handleSend());

    const textarea = panel.querySelector('textarea');
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    return panel;
  }

  /**
   * Handle send button click
   */
  handleSend() {
    if (this.isStreaming) {
      return; // Don't send while streaming
    }

    const textarea = this.element.querySelector('textarea');
    const message = textarea.value;

    if (message.trim()) {
      this.sendMessage(message);
      textarea.value = '';
      textarea.style.height = 'auto'; // Reset height
    }
  }

  /**
   * Add message to chat
   */
  addMessage(role, content) {
    const messagesContainer = this.element.querySelector('.ai-chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `ai-message ai-message-${role}`;

    if (role === 'assistant') {
      // Render markdown and add copy button
      messageEl.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content">
          <div class="message-text">${this.renderMarkdown(content)}</div>
          <div class="message-actions">
            <button class="copy-btn" title="Copy to clipboard">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V2z"/>
                <path d="M2 6a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V8a2 2 0 00-2-2H2z"/>
              </svg>
              Copy
            </button>
          </div>
        </div>
      `;

      // Add copy functionality
      const copyBtn = messageEl.querySelector('.copy-btn');
      copyBtn.addEventListener('click', () => this.copyToClipboard(copyBtn, content));
    } else if (role === 'user') {
      messageEl.innerHTML = `
        <div class="message-avatar">You</div>
        <div class="message-content">
          <div class="message-text">${this.escapeHtml(content)}</div>
        </div>
      `;
    }

    messagesContainer.appendChild(messageEl);
    this.scrollToBottom();

    return messageEl;
  }

  /**
   * Add system message
   */
  addSystemMessage(content) {
    const messagesContainer = this.element.querySelector('.ai-chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = 'ai-message ai-message-system';
    messageEl.innerHTML = `
      <div class="message-text">${this.escapeHtml(content)}</div>
    `;
    messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  /**
   * Update context indicator
   */
  updateContextIndicator(options) {
    const indicator = this.element.querySelector('.context-indicator');
    const roleDisplay = options.roleType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const collectionDisplay = options.collection.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    indicator.textContent = `📝 ${collectionDisplay} | 👤 ${roleDisplay}`;
    indicator.className = 'context-indicator context-loaded';
  }

  /**
   * Render markdown (simple implementation)
   */
  renderMarkdown(text) {
    return text
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`(.+?)`/g, '<code>$1</code>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      // Wrap in paragraph
      .replace(/^(.*)$/, '<p>$1</p>')
      // Bullet lists
      .replace(/<p>- (.+?)<\/p>/g, '<ul><li>$1</li></ul>')
      // Combine consecutive ul tags
      .replace(/<\/ul><ul>/g, '');
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(button, text) {
    try {
      // Remove HTML tags for plain text copy
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = text;
      const plainText = tempDiv.textContent || tempDiv.innerText;

      await navigator.clipboard.writeText(plainText);

      // Visual feedback
      const originalHTML = button.innerHTML;
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z"/>
        </svg>
        Copied!
      `;
      button.classList.add('copied');

      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('copied');
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      this.showError('Failed to copy to clipboard');
    }
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    const messagesContainer = this.element.querySelector('.ai-chat-messages');

    // Remove existing indicator
    const existing = messagesContainer.querySelector('.typing-indicator');
    if (existing) existing.remove();

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
      <div class="message-avatar">AI</div>
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    messagesContainer.appendChild(indicator);
    this.scrollToBottom();
  }

  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    const indicator = this.element.querySelector('.typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const messagesContainer = this.element.querySelector('.ai-chat-messages');
    const errorEl = document.createElement('div');
    errorEl.className = 'ai-message ai-message-error';
    errorEl.innerHTML = `
      <div class="message-text">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path fill-rule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zM8 4a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 8a1 1 0 100-2 1 1 0 000 2z"/>
        </svg>
        ${this.escapeHtml(message)}
      </div>
    `;
    messagesContainer.appendChild(errorEl);
    this.scrollToBottom();
  }

  /**
   * Show loading state
   */
  showLoadingState() {
    if (this.element) {
      const indicator = this.element.querySelector('.context-indicator');
      if (indicator) {
        indicator.textContent = 'Loading context...';
        indicator.className = 'context-indicator';
      }
    }
  }

  /**
   * Clear all messages
   */
  clearMessages() {
    const messagesContainer = this.element?.querySelector('.ai-chat-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
  }

  /**
   * Scroll to bottom of messages
   */
  scrollToBottom() {
    const messagesContainer = this.element?.querySelector('.ai-chat-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  /**
   * Check if panel is open
   */
  isOpened() {
    return this.isOpen;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIChat;
}
