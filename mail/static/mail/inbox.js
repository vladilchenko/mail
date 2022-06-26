document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector("#compose-form").onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(data => {
    data.forEach(email => {
      email_block = create_email_block(email);
      document.querySelector("#emails-view").append(email_block);
    })
  })
  .catch(error => {
    console.log('Error:', error)
  });
}

function create_email_block(email) {
  email_block = document.createElement("div");
  email_block.setAttribute("email_uuid", email.id)
  email_block.addEventListener("click", event => {
    console.log(`Clicked on email ${event.currentTarget.getAttribute("email_uuid")}`)
  });
  email_block.classList.add("email_record");
  if (email.read) {
    email_block.classList.add("read")
  };

  email_subject = document.createElement("h4");
  email_subject.innerHTML = email.subject;

  email_sender = document.createElement("p");
  email_sender.innerHTML = email.sender;

  email_date = document.createElement("p");
  email_date.innerHTML = email.timestamp;

  email_block.appendChild(email_subject);
  email_block.appendChild(email_sender);
  email_block.appendChild(email_date);

  return email_block
}

function send_email() {


  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result)
  });

  load_mailbox('sent');

  return false;
}
