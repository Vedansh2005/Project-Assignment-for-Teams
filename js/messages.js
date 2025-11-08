document.addEventListener('DOMContentLoaded', function() {
    var sendButton = document.getElementById('send-message');
    var messageInput = document.getElementById('message-input');
    
    if (sendButton && messageInput) {
        sendButton.addEventListener('click', function() {
            sendMessage();
        });
        
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

function sendMessage() {
    var input = document.getElementById('message-input');
    var message = input.value.trim();
    if (message) {
        var container = document.getElementById('messages-container');
        var now = new Date();
        var time = now.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
        
        var messageDiv = document.createElement('div');
        messageDiv.className = 'message own';
        messageDiv.innerHTML = '<p style="margin: 5px 0;">' + message + '</p><p style="margin: 5px 0; font-size: 12px;">' + time + '</p>';
        container.appendChild(messageDiv);
        
        input.value = '';
        container.scrollTop = container.scrollHeight;
    }
}

