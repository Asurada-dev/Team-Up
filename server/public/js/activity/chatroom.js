const memberList = document.getElementById('member-list');
const chatRoom = document.getElementById('chat-room');
const chatForm = document.getElementById('chat-form');
const socket = io();

pageLoad();
async function pageLoad() {
  const activityId = window.location.href.split('/').reverse()[0];
  const { data } = await axios.get(`/api/v1/activity/members/${activityId}`);
  data.forEach((element) => {
    memberList.insertAdjacentHTML(
      'beforeend',
      ` <div class="d-flex align-items-start">
            <div class="flex-grow-1 mx-4 my-3">
                ${element.name}
                <div id="member-${element.member_id}" class="small chat-offline">・Offline</div>
            </div>
        </div>`
    );
  });

  const { data: user } = await axios.get(`/api/v1/user/current-user`);
  const userId = user.user.userId;
  const userName = user.user.name;

  const chatLog = await axios.get(`/api/v1/activity/chat-log/${activityId}`);
  chatLog.data.forEach((element) => {
    chatRoom.insertAdjacentHTML(
      'beforeend',
      `
        <div class="chat-message-${
          userName === element.name ? 'right' : 'left'
        } pb-4">
            <div class="flex-shrink-1 bg-secondary rounded py-2 px-3 mr-3">
                <div class="badge bg-dark text-nowrap mb-1">${
                  element.name
                }</div>
                    <span class="small text-end text-nowrap mt-2">${
                      element.send_time
                    }</span>
                <div class="message">${element.message}</div>
            </div>
        </div>`
    );
  });

  // Chatroom
  socket.emit('joinRoom', { userId, userName, activityId });

  socket.on('online', (userList) => {
    userList.forEach((userId) => {
      const member = document.getElementById(`member-${userId}`);
      member.innerHTML = '・Online';
      member.classList.add('chat-online');
      member.classList.remove('chat-offline');
    });
  });

  socket.on('offline', (userId) => {
    const member = document.getElementById(`member-${userId}`);
    member.innerHTML = '・Offline';
    member.classList.add('chat-offline');
    member.classList.remove('chat-online');
  });

  socket.on('message', (message) => {
    chatRoom.insertAdjacentHTML(
      'beforeend',
      `<div class="chat-message-${
        userName === message.userName ? 'right' : 'left'
      } pb-4">
          <div class="flex-shrink-1 bg-secondary rounded py-2 px-3 mr-3">
              <div class="badge bg-dark text-nowrap mb-1">${
                message.userName
              }</div>
                  <span class="small text-end text-nowrap mt-2">${
                    message.time
                  }</span>
              <div class="message">${message.text}</div>
          </div>
      </div>`
    );
    chatRoom.scrollTop = chatRoom.scrollHeight;
  });

  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let message = event.target.message.value.trim();

    // Check whether user sends empty message
    if (message.length === 0) return;

    socket.emit('chatMessage', message);
    event.target.message.value = '';
  });
}
